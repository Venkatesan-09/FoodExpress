import { create } from 'zustand'
import { io } from 'socket.io-client'

const getSocketUrl = () => {
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL
  }
  if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('food-express-henna-two'))) {
    return 'https://foodexpress-8r29.onrender.com'
  }
  return 'http://localhost:4000'
}

const SOCKET_URL = getSocketUrl()

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
