"use client"

import type React from "react"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { addToCart, type CartItem } from "@/app/lib/indexdb"
import { ImageSlider } from "@/app/components/image-slider"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Loader2, ShoppingCart, ArrowLeft, Package, Check, Minus, Plus, Star, ShieldCheck, Truck } from "lucide-react"
import { Input } from "@/app/components/ui/input"

interface Product {
  id: string
  productName: string
  description: string
  price: number
  images: string[]
  quantity: number
  variants?: Array<{ name: string; value: string }>
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter()
  const { id } = use(params)
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState<{ name: string; value: string } | undefined>()
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [success, setSuccess] = useState(false)
  const formatNaira = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};


  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const docRef = doc(db, "products", id)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          setProduct({
            id: docSnap.id,
            ...docSnap.data(),
          } as Product)
        } else {
          console.error("Product not found")
          router.push("/product")
        }
      } catch (error) {
        console.error("Failed to fetch product:", error)
        router.push("/product")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id, router])

  const handleAddToCart = async () => {
    if (!product) return

    setIsAddingToCart(true)
    try {
      const cartItem: CartItem = {
        id: product.id,
        productName: product.productName,
        price: product.price,
        quantity,
        selectedVariant,
        image: product.images[0] || "/placeholder.svg",
      }

      await addToCart(cartItem)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      setQuantity(1)
      setSelectedVariant(undefined)
    } catch (error) {
      console.error("Failed to add to cart:", error)
    } finally {
      setIsAddingToCart(false)
    }
  }

  const incrementQuantity = () => {
    if (product && quantity < product.quantity) {
      setQuantity(quantity + 1)
    }
  }

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1)
    }
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(1, Math.min(product?.quantity || 999, Number.parseInt(e.target.value) || 1))
    setQuantity(value)
  }

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading product...</p>
        </div>
      </main>
    )
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto p-8 text-center border-0 shadow-lg">
            <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">Product not found</p>
          </Card>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/product">
            <Button variant="ghost" className="text-gray-600 hover:text-blue-600 hover:bg-blue-50">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Store
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
              <ShoppingCart className="h-5 w-5 mr-2" />
              View Cart
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-7xl mx-auto">
          {/* Image Section */}
          <div className="lg:sticky lg:top-8 self-start">
            <ImageSlider images={product.images} alt={product.productName} />
          </div>

          {/* Product Info Section */}
          <div className="space-y-6">
            {/* Title and Price */}
            <div>
              <div className="flex items-start gap-2 mb-3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 flex-1">{product.productName}</h1>
                {product.quantity > 0 && product.quantity < 10 && (
                  <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap">
                    Only {product.quantity} left
                  </span>
                )}
              </div>
              
              {/* Mock Rating */}
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-sm text-gray-600">(4.8 • 127 reviews)</span>
              </div>

              <div className="flex items-baseline gap-3 mb-6">
                <p className="text-4xl font-bold text-blue-600">{formatNaira(product.price)}</p>
                <span className="text-gray-500 text-lg">per unit</span>
              </div>

              <p className="text-gray-700 text-lg leading-relaxed">{product.description}</p>
            </div>

            {/* Stock Status */}
            <Card className="border-0 bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                {product.quantity > 0 ? (
                  <>
                    <div className="bg-green-500 p-2 rounded-full">
                      <Check className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">In Stock</p>
                      <p className="text-sm text-gray-600">{product.quantity} units available</p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-red-500 p-2 rounded-full">
                      <Package className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Out of Stock</p>
                      <p className="text-sm text-gray-600">Currently unavailable</p>
                    </div>
                  </>
                )}
              </div>
            </Card>

            {/* Options Card */}
            <Card className="border-0 shadow-lg p-6 space-y-6">
              {/* Variants */}
              {product.variants && product.variants.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                    Select Options
                  </label>
                  <select
                    value={selectedVariant ? JSON.stringify(selectedVariant) : ""}
                    onChange={(e) => setSelectedVariant(e.target.value ? JSON.parse(e.target.value) : undefined)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white text-gray-900 font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                  >
                    <option value="">Choose an option</option>
                    {product.variants.map((variant, index) => (
                      <option key={index} value={JSON.stringify(variant)}>
                        {variant.name}: {variant.value}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Quantity */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border-2 border-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Minus className="h-4 w-4 text-gray-700" />
                    </button>
                    <Input
                      type="number"
                      min="1"
                      max={product.quantity}
                      value={quantity}
                      onChange={handleQuantityChange}
                      className="w-20 text-center border-0 font-semibold text-lg focus-visible:ring-0"
                    />
                    <button
                      type="button"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.quantity}
                      className="px-4 py-3 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Plus className="h-4 w-4 text-gray-700" />
                    </button>
                  </div>
                  <span className="text-sm text-gray-600 font-medium">
                    {product.quantity} available
                  </span>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.quantity === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-6 text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Adding to Cart...
                  </>
                ) : (
                  <>
                    <ShoppingCart className="h-5 w-5 mr-2" />
                    Add to Cart • {formatNaira(product.price * quantity)}
                  </>
                )}
              </Button>

              {success && (
                <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200">
                  <Check className="h-5 w-5 flex-shrink-0" />
                  <p className="font-medium">Successfully added to cart!</p>
                </div>
              )}
            </Card>

            {/* Trust Badges */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="border-0 bg-white shadow-md p-4 text-center">
                <Truck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm">Fast Delivery</p>
                <p className="text-xs text-gray-600">2-3 business days</p>
              </Card>
              <Card className="border-0 bg-white shadow-md p-4 text-center">
                <ShieldCheck className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm">Secure Payment</p>
                <p className="text-xs text-gray-600">100% protected</p>
              </Card>
              <Card className="border-0 bg-white shadow-md p-4 text-center">
                <Package className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900 text-sm">Quality Assured</p>
                <p className="text-xs text-gray-600">Verified products</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}