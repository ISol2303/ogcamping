"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'

interface CartItem {
  id: string
  type: "SERVICE" | "EQUIPMENT" | "COMBO"
  item: any
  quantity: number
  rentalDays?: number
  totalPrice: number
  checkInDate?: string
  checkOutDate?: string
  extraPeople?: number
}

interface CartContextType {
  cartItems: CartItem[]
  cartCount: number
  addToCart: (item: CartItem) => void
  removeFromCart: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateRentalDays: (id: string, rentalDays: number) => void
  clearCart: () => void
  getTotalPrice: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // Load cart from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cart')
      if (storedCart) {
        try {
          setCartItems(JSON.parse(storedCart))
        } catch (error) {
          console.error('Error parsing cart from localStorage:', error)
        }
      }
    }
  }, [])

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(cartItems))
    }
  }, [cartItems])

  const addToCart = (item: CartItem) => {
    setCartItems(prev => {
      // Check if item already exists in cart
      const existingItem = prev.find(cartItem => 
        cartItem.item.id === item.item.id && 
        cartItem.type === item.type &&
        cartItem.rentalDays === item.rentalDays
      )

      if (existingItem) {
        // Update quantity if item exists and recalculate totalPrice
        const newQuantity = existingItem.quantity + item.quantity
        const newTotalPrice = newQuantity * existingItem.item.price * (existingItem.rentalDays || 1)
        
        return prev.map(cartItem =>
          cartItem.item.id === existingItem.item.id && 
          cartItem.type === existingItem.type &&
          cartItem.rentalDays === existingItem.rentalDays
            ? { 
                ...cartItem, 
                quantity: newQuantity,
                totalPrice: newTotalPrice
              }
            : cartItem
        )
      } else {
        // Add new item
        return [...prev, item]
      }
    })
  }

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id)
      return
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          // Recalculate totalPrice based on quantity and rentalDays
          const newTotalPrice = quantity * item.item.price * (item.rentalDays || 1)
          return { ...item, quantity, totalPrice: newTotalPrice }
        }
        return item
      })
    )
  }

  const updateRentalDays = (id: string, rentalDays: number) => {
    if (rentalDays <= 0) {
      return
    }

    setCartItems(prev =>
      prev.map(item => {
        if (item.id === id) {
          // Recalculate totalPrice based on quantity and new rentalDays
          const newTotalPrice = item.quantity * item.item.price * rentalDays
          return { ...item, rentalDays, totalPrice: newTotalPrice }
        }
        return item
      })
    )
  }

  const clearCart = () => {
    setCartItems([])
  }

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.totalPrice, 0)
  }

  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateRentalDays,
        clearCart,
        getTotalPrice
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
