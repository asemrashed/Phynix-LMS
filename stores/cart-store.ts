import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@fxprime/types"

interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  itemCount: () => number
  subtotal: () => number
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            const quantity = Math.min(
              item.stock,
              existing.quantity + (item.quantity ?? 1)
            )
            return {
              items: state.items.map((i) =>
                i.productId === item.productId ? { ...i, quantity } : i
              ),
            }
          }
          return {
            items: [
              ...state.items,
              {
                ...item,
                quantity: Math.min(item.stock, item.quantity ?? 1),
              },
            ],
          }
        })
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        }))
      },

      updateQuantity: (productId, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(1, Math.min(i.stock, quantity)) }
              : i
          ),
        }))
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: "fxprime-cart" }
  )
)

export function calcShipping(subtotal: number): number {
  return subtotal >= 1000 ? 0 : 80
}
