"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { getCartItems, removeFromCart, updateCartItem, type CartItem } from "@/app/lib/indexdb"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { ArrowLeft, Trash2, ShoppingCart, Loader2, Plus, Minus, Package, ShieldCheck, Truck, CreditCard } from "lucide-react"

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};


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

  const handleRemoveItem = async (productId: string) => {
    try {
      await removeFromCart(productId)
      setItems(items.filter((item) => item.id !== productId))
    } catch (error) {
      console.error("Failed to remove item:", error)
    }
  }

  const handleQuantityChange = async (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return

    const updatedItems = items.map((item) => (item.id === productId ? { ...item, quantity: newQuantity } : item))

    const updatedItem = updatedItems.find((item) => item.id === productId)
    if (updatedItem) {
      try {
        await updateCartItem(updatedItem)
        setItems(updatedItems)
      } catch (error) {
        console.error("Failed to update item:", error)
      }
    }
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your cart...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link href="/product">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">Shopping Cart</h1>
              <p className="text-blue-100">
                {itemCount} {itemCount === 1 ? "item" : "items"} in your cart
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 pb-12">
        {items.length === 0 ? (
          <Card className="max-w-2xl mx-auto border-0 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-br from-gray-50 to-white p-16 text-center">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-100 rounded-full mb-6">
                <ShoppingCart className="h-12 w-12 text-blue-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-3">Your Cart is Empty</h2>
              <p className="text-gray-600 text-lg mb-8">Discover amazing products and start shopping!</p>
              <Link href="/product">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-6 text-lg">
                  Start Shopping
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item) => (
                <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-shadow overflow-hidden">
                  <div className="p-6 flex gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 text-xl mb-1">{item.productName}</h3>
                          {item.selectedVariant && (
                            <p className="text-sm text-gray-600 bg-gray-100 inline-block px-2 py-1 rounded">
                              {item.selectedVariant.name}: {item.selectedVariant.value}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors ml-4"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="mt-auto">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4 text-gray-700" />
                              </button>
                              <Input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, Number.parseInt(e.target.value) || 1)}
                                className="w-16 text-center border-0 font-semibold focus-visible:ring-0"
                              />
                              <button
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                              >
                                <Plus className="h-4 w-4 text-gray-700" />
                              </button>
                            </div>
                            <span className="text-sm text-gray-600">× {formatNaira(item.price)}</span>
                          </div>
                          <p className="font-bold text-blue-600 text-2xl">
                            {formatNaira(item.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:sticky lg:top-4 space-y-6 self-start">
              {/* Summary Card */}
              <Card className="border-0 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Summary
                  </h2>
                </div>

                <div className="p-6 space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal ({itemCount} items)</span>
                      <span className="font-semibold">{formatNaira(total)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Shipping</span>
                      <span className="font-semibold text-green-600">NOT ADDED  </span>
                    </div>
                  </div>

                  <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900">Total</span>
                    <span className="text-3xl font-bold text-blue-600">{formatNaira(total)}</span>
                  </div>

                  <Link href="/checkout">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Proceed to Checkout
                    </Button>
                  </Link>
                </div>
              </Card>

              {/* Trust Badges */}
              <div className="grid grid-cols-1 gap-3">
                <Card className="border-0 bg-white shadow-md p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Truck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Fast Delivery</p>
                      <p className="text-xs text-gray-600">2-3 business days</p>
                    </div>
                  </div>
                </Card>
                
                <Card className="border-0 bg-white shadow-md p-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <ShieldCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
                      <p className="text-xs text-gray-600">100% protected</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}