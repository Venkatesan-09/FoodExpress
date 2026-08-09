import { create } from 'zustand'
import { io } from 'socket.io-client'

const SOCKET_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000'

export const useSocketStore = create((set, get) => ({
  socket: null,
  connected: false,
  orderLocation: {},    // { [orderId]: { lat, lng, etaMinutes, progress } }
  orderStatuses: {},    // { [orderId]: { status, timestamp } }

  connect: (accessToken) => {
    const existing = get().socket
    if (existing?.connected) return

    const socket = io(SOCKET_URL, {
      auth: { token: accessToken },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      set({ socket, connected: true })
    })

    socket.on('disconnect', () => {
      set({ connected: false })
    })

    socket.on('order:status_changed', ({ orderId, status, timestamp }) => {
      set((state) => ({
        orderStatuses: {
          ...state.orderStatuses,
          [orderId]: { status, timestamp },
        },
      }))
    })

    socket.on('order:location_update', ({ orderId, lat, lng, etaMinutes, progress }) => {
      set((state) => ({
        orderLocation: {
          ...state.orderLocation,
          [orderId]: { lat, lng, etaMinutes, progress },
        },
      }))
    })

    set({ socket })
  },

  disconnect: () => {
    const { socket } = get()
    if (socket) {
      socket.disconnect()
      set({ socket: null, connected: false })
    }
  },

  joinOrderRoom: (orderId) => {
    const { socket } = get()
    socket?.emit('join:order', orderId)
  },

  leaveOrderRoom: (orderId) => {
    const { socket } = get()
    socket?.emit('leave:order', orderId)
  },

  joinRestaurantRoom: (restaurantId) => {
    const { socket } = get()
    socket?.emit('join:restaurant', restaurantId)
  },
}))
