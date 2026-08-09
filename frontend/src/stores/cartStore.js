import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import toast from 'react-hot-toast'

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],           // [{ menuItem, name, image, price, isVeg, quantity, restaurantId, restaurantName }]
      restaurantId: null,
      restaurantName: '',
      coupon: null,        // { code, discountType, value, minOrderValue }

      // Add item to cart (clears cart if switching restaurant)
      addItem: (restaurant, item, qty = 1) => {
        const { restaurantId, items } = get()
        const targetRestId = restaurant._id || restaurant.id

        let currentItems = items
        if (restaurantId && restaurantId !== targetRestId) {
          currentItems = []
          set({ coupon: null })
          toast('Cart reset for new restaurant', { icon: '🔄' })
        }

        const itemId = item._id || item.id
        const existing = currentItems.find((i) => i.menuItem === itemId)

        if (existing) {
          set({
            items: currentItems.map((i) =>
              i.menuItem === itemId ? { ...i, quantity: i.quantity + qty } : i
            ),
            restaurantId: targetRestId,
            restaurantName: restaurant.name,
          })
        } else {
          set({
            items: [
              ...currentItems,
              {
                menuItem: itemId,
                name: item.name,
                image: item.image || '',
                price: item.price,
                isVeg: item.isVeg,
                quantity: qty,
                restaurantId: targetRestId,
                restaurantName: restaurant.name,
              },
            ],
            restaurantId: targetRestId,
            restaurantName: restaurant.name,
          })
        }
        toast.success(`${item.name} added to cart`)
      },

      updateQuantity: (menuItemId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(menuItemId)
          return
        }
        set({
          items: get().items.map((i) =>
            i.menuItem === menuItemId ? { ...i, quantity } : i
          ),
        })
      },

      removeItem: (menuItemId) => {
        const filtered = get().items.filter((i) => i.menuItem !== menuItemId)
        if (filtered.length === 0) {
          set({ items: [], restaurantId: null, restaurantName: '', coupon: null })
        } else {
          set({ items: filtered })
        }
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: '', coupon: null }),

      setCoupon: (coupon) => set({ coupon }),

      // Calculated helpers
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      getDeliveryFee: () => (get().items.length > 0 ? 30 : 0),
      getTax: () => Math.round(get().getSubtotal() * 0.05),
      getDiscount: () => {
        const { coupon } = get()
        const subtotal = get().getSubtotal()
        if (!coupon || subtotal < (coupon.minOrderValue || 0)) return 0
        if (coupon.discountType === 'flat') return coupon.value
        if (coupon.discountType === 'percentage') return Math.round((subtotal * coupon.value) / 100)
        return 0
      },
      getTotal: () => {
        const sub = get().getSubtotal()
        if (sub === 0) return 0
        return Math.max(0, sub + get().getDeliveryFee() + get().getTax() - get().getDiscount())
      },
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'foodexpress-cart-store',
      partialize: (state) => ({
        items: state.items,
        restaurantId: state.restaurantId,
        restaurantName: state.restaurantName,
        coupon: state.coupon,
      }),
    }
  )
)
