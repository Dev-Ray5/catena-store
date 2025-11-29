"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { getCartItems, clearCart, type CartItem } from "@/app/lib/indexdb"
import { db } from "@/app/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Loader2, ArrowLeft, ShoppingBag, User, MapPin, Mail, Phone, Building2, FileText, CreditCard, ShieldCheck, Truck, Package } from "lucide-react"

interface CustomerDetails {
  fullName: string
  companyName: string
  phone: string
  email: string
  address: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [notes, setNotes] = useState("")
  const [customer, setCustomer] = useState<CustomerDetails>({
    fullName: "",
    companyName: "",
    phone: "",
    email: "",
    address: "",
  })

  // Format currency in Naira with commas
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  useEffect(() => {
    const loadCart = async () => {
      try {
        const cartItems = await getCartItems()
        if (cartItems.length === 0) {
          router.push("/cart")
          return
        }
        setItems(cartItems)
      } catch (error) {
        console.error("Failed to load cart:", error)
        router.push("/cart")
      } finally {
        setIsLoading(false)
      }
    }

    loadCart()
  }, [router])

  const handleCustomerChange = (field: keyof CustomerDetails, value: string) => {
    setCustomer((prev) => ({ ...prev, [field]: value }))
  }

  const handlePlaceOrder = async () => {
    // Validation
    if (!customer.fullName || !customer.phone || !customer.email || !customer.address) {
      alert("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

      // Create order document
      const ordersCollection = collection(db, "orders")
      const orderData = {
        items: items.map((item) => ({
          productId: item.id,
          productName: item.productName,
          price: item.price,
          quantity: item.quantity,
          selectedVariant: item.selectedVariant || null,
          finalPrice: item.price * item.quantity,
        })),
        totalAmount: total,
        notes,
        customerDetails: customer,
        status: "pending",
        createdAt: serverTimestamp(),
      }

      const docRef = await addDoc(ordersCollection, orderData)
      const orderId = docRef.id

      await clearCart()

      // Redirect to order summary with order ID
      router.push(`/order-summary/${orderId}`)
    } catch (error) {
      console.error("Failed to place order:", error)
      alert("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading checkout...</p>
        </div>
      </main>
    )
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8 text-center border-0 shadow-lg">
            <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Your cart is empty</p>
          </Card>
        </div>
      </main>
    )
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-8 md:py-12">
          <Link href="/cart">
            <Button variant="ghost" className="text-white hover:bg-white/10 mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Cart
            </Button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
              <CreditCard className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-1">Checkout</h1>
              <p className="text-blue-100">Complete your order • {itemCount} items</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Summary Section */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Order Summary</h2>
                </div>
              </div>
              <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-white border-2 border-gray-200">
                      <Image
                        src={item.image || "/placeholder.svg"}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 mb-1 truncate">{item.productName}</p>
                      {item.selectedVariant && (
                        <p className="text-sm text-gray-600 mb-1 bg-white inline-block px-2 py-0.5 rounded">
                          {item.selectedVariant.name}: {item.selectedVariant.value}
                        </p>
                      )}
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-gray-600">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                        <p className="font-bold text-blue-600 text-lg">
                          {formatCurrency(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border-t-2 border-blue-200 p-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Subtotal ({itemCount} items)</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>
              </div>
            </Card>

            {/* Customer Details Section */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Customer Details</h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600" />
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    value={customer.fullName}
                    onChange={(e) => handleCustomerChange("fullName", e.target.value)}
                    placeholder="John Doe"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-600" />
                    Company Name <span className="text-gray-400 text-xs">(Optional)</span>
                  </label>
                  <Input
                    type="text"
                    value={customer.companyName}
                    onChange={(e) => handleCustomerChange("companyName", e.target.value)}
                    placeholder="Your Company Ltd."
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    value={customer.phone}
                    onChange={(e) => handleCustomerChange("phone", e.target.value)}
                    placeholder="+234 XXX XXX XXXX"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600" />
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={customer.email}
                    onChange={(e) => handleCustomerChange("email", e.target.value)}
                    placeholder="your.email@example.com"
                    className="h-12 border-2 border-gray-200 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-600" />
                    Delivery Address <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={customer.address}
                    onChange={(e) => handleCustomerChange("address", e.target.value)}
                    placeholder="Street address, city, state, postal code"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-24 resize-none transition-all"
                  />
                </div>
              </div>
            </Card>

            {/* Notes Section */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  <h2 className="text-xl font-bold">Additional Notes</h2>
                </div>
              </div>
              <div className="p-6">
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any special requests, delivery instructions, or notes for your order..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 min-h-32 resize-none transition-all"
                />
              </div>
            </Card>
          </div>

          {/* Order Total Section - Sticky Sidebar */}
          <div className="lg:sticky lg:top-4 space-y-6 self-start">
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Payment Summary
                </h2>
              </div>

              <div className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span className="font-semibold">{formatCurrency(total)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee</span>
                    <span className="font-semibold text-green-600">FREE</span>
                  </div>
                  <div className="flex justify-between text-gray-600 text-sm">
                    <span>Items</span>
                    <span>{itemCount}</span>
                  </div>
                </div>

                <div className="border-t-2 border-gray-200 pt-4 flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-3xl font-bold text-blue-600">{formatCurrency(total)}</span>
                </div>

                <Button
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processing Order...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="h-5 w-5 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  By placing this order, you agree to our terms and conditions
                </p>
              </div>
            </Card>

            {/* Trust Badges */}
            <div className="space-y-3">
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
                    <p className="font-semibold text-gray-900 text-sm">Secure Checkout</p>
                    <p className="text-xs text-gray-600">Your data is protected</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}