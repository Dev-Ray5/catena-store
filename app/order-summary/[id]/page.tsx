"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Loader2, ArrowLeft, MessageCircle, CreditCard, CheckCircle2, Package, Copy, Check } from "lucide-react"

interface OrderItem {
  productId: string
  productName: string
  price: number
  quantity: number
  selectedVariant?: { name: string; value: string }
  finalPrice: number
}

interface Order {
  id: string
  items: OrderItem[]
  totalAmount: number
  notes: string
  customerDetails: {
    fullName: string
    companyName: string
    phone: string
    email: string
    address: string
  }
  status: string
  createdAt: any
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
  }).format(amount)
}

export default function OrderSummaryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showBankDetails, setShowBankDetails] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setOrder({
            id: docSnap.id,
            ...docSnap.data(),
          } as Order)
        } else {
          router.push("/cart")
        }
      } catch (error) {
        console.error("Failed to fetch order:", error)
        router.push("/cart")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrder()
  }, [id, router])

  const handleContactSales = () => {
    const message = `Good day, I have enquiries about an order, here is my order ID: ${id}`
    const whatsappUrl = `https://wa.me/+23481292785?text=${encodeURIComponent(message)}`
    window.open(whatsappUrl, "_blank")
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading your order...</p>
        </div>
      </main>
    )
  }

  if (!order) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8 text-center">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Order not found</p>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/product" className="inline-block mb-6">
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>

          {/* Success Header */}
          <Card className="mb-6 overflow-hidden border-0 shadow-lg">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 md:p-12 text-white text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Order Confirmed!</h1>
              <p className="text-blue-100 text-lg mb-4">Thank you for your order</p>
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full">
                <span className="text-sm text-blue-100">Order ID:</span>
                <span className="font-mono font-bold text-white">{id}</span>
                <button
                  onClick={() => copyToClipboard(id)}
                  className="ml-2 p-1 hover:bg-white/10 rounded transition-colors"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Content - Left Column (2/3) */}
            <div className="md:col-span-2 space-y-6">
              {/* Order Items */}
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Order Items</h2>
                  </div>
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <div
                        key={item.productId}
                        className={`flex gap-4 pb-4 ${index !== order.items.length - 1 ? "border-b border-gray-100" : ""}`}
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900 mb-1">{item.productName}</p>
                          {item.selectedVariant && (
                            <p className="text-sm text-gray-500 mb-1">
                              {item.selectedVariant.name}: {item.selectedVariant.value}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {formatCurrency(item.price)} × {item.quantity.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900 text-lg">{formatCurrency(item.finalPrice)}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <div className="mt-6 pt-6 border-t border-gray-100 bg-gray-50 -mx-6 -mb-6 px-6 py-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Special Notes:</p>
                      <p className="text-gray-600">{order.notes}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Customer Info */}
              <Card className="border-0 shadow-lg">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Delivery Information</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Full Name</p>
                      <p className="font-semibold text-gray-900">{order.customerDetails.fullName}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Phone</p>
                      <p className="font-semibold text-gray-900">{order.customerDetails.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Email</p>
                      <p className="font-semibold text-gray-900 break-all">{order.customerDetails.email}</p>
                    </div>
                    {order.customerDetails.companyName && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Company</p>
                        <p className="font-semibold text-gray-900">{order.customerDetails.companyName}</p>
                      </div>
                    )}
                    <div
                      className={`bg-gray-50 p-4 rounded-lg ${order.customerDetails.companyName ? "sm:col-span-2" : "sm:col-span-2"}`}
                    >
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">Delivery Address</p>
                      <p className="font-semibold text-gray-900">{order.customerDetails.address}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Sidebar - Right Column (1/3) */}
            <div className="space-y-6">
              {/* Total Amount */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-blue-700 text-white">
                <div className="p-6">
                  <p className="text-blue-100 text-sm font-medium mb-2">Total Amount</p>
                  <p className="text-4xl font-bold mb-1">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-blue-100 text-xs">Inclusive of all taxes</p>
                </div>
              </Card>

              {/* Payment Button */}
              <Button
                onClick={() => setShowBankDetails(!showBankDetails)}
                className="
                  w-full relative overflow-hidden
                  bg-white
                  text-blue-600
                  border-2 border-blue-600
                  font-semibold py-6 text-base
                  shadow-lg transition-all
                  group
                "
              >
                {/* Background fill animation */}
                <span
                  className="
                    absolute inset-0
                    bg-blue-600
                    translate-x-full translate-y-full
                    group-hover:translate-x-0 group-hover:translate-y-0
                    transition-transform duration-300 ease-out
                    -z-10
                  "
                />

                <CreditCard className="h-5 w-5 mr-2 text-blue-600 group-hover:text-white transition-colors duration-300" />

                <span className="text-blue-600 group-hover:text-white transition-colors duration-300">
                  {showBankDetails ? "Hide" : "Show"} Payment Details
                </span>
              </Button>

              {/* Bank Details */}
              {showBankDetails && (
                <Card className="border-2 border-blue-200 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                  <div className="p-6 space-y-4">
                    <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-blue-600" />
                      Bank Transfer Details
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Account Name</p>
                        <p className="font-bold text-gray-900">Catena LTD</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Bank Name</p>
                        <p className="font-bold text-gray-900">Real Bank</p>
                      </div>
                      <div className="bg-white p-3 rounded-lg border border-blue-100">
                        <p className="text-xs font-medium text-gray-500 uppercase mb-1">Account Number</p>
                        <div className="flex items-center justify-between">
                          <p className="font-mono font-bold text-gray-900 text-lg">0123456789</p>
                          <button
                            onClick={() => copyToClipboard("0123456789")}
                            className="p-2 hover:bg-blue-50 rounded transition-colors"
                          >
                            {copied ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-blue-600" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="bg-blue-600 text-white p-4 rounded-lg">
                        <p className="text-xs font-medium text-blue-100 uppercase mb-1">Amount to Transfer</p>
                        <p className="font-bold text-2xl">{formatCurrency(order.totalAmount)}</p>
                      </div>
                    </div>
                  </div>
                </Card>
              )}

              {/* Contact Sales */}
<Button
  onClick={handleContactSales}
  variant="outline"
                className="
                  w-full relative overflow-hidden
                  bg-white
                  text-blue-600
                  border-2 border-blue-600
                  font-semibold py-6 text-base
                  shadow-lg transition-all
                  group
                "
              >
  {/* Animated BG fill */}
  <span
                  className="
                    absolute inset-0
                    bg-blue-600
                    translate-x-full translate-y-full
                    group-hover:translate-x-0 group-hover:translate-y-0
                    transition-transform duration-300 ease-out
                    -z-10
                  "
                />


  <MessageCircle
   className="h-5 w-5 mr-2 text-blue-600 group-hover:text-white transition-colors duration-300" />

  <span
    className="text-blue-600 group-hover:text-white transition-colors duration-300">
    Contact Sales
  </span>
</Button>


              {/* Continue Shopping */}
              <Link href="/product" className="block">
                <Button
                  variant="ghost"
                  className="w-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium"
                >
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
