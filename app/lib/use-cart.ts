"use client"

import { useEffect, useState } from "react"
import { getCartItems, type CartItem } from "./indexdb"

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartItems = await getCartItems()
        setItems(cartItems)
      } catch (error) {
        console.error("Failed to load cart:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [])

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return { items, isLoading, total, itemCount }
}
