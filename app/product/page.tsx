"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { collection, query, getDocs } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { SearchProducts } from "@/app/components/search-products"
import { Button } from "@/app/components/ui/button"
import { Card } from "@/app/components/ui/card"
import { Loader2, ShoppingCart, Package, Tag, TrendingUp } from "lucide-react"

interface Product {
  id: string
  productName: string
  description: string
  price: number
  images: string[]
  quantity: number
  variants?: Array<{ name: string; value: string }>
}

// Skeleton Loading Component
function ProductCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-lg h-full flex flex-col animate-pulse">
      <div className="relative w-full aspect-square bg-gray-200" />
      <div className="p-5 flex-1 flex flex-col bg-white space-y-3">
        <div className="h-6 bg-gray-200 rounded w-3/4" />
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-24" />
          <div className="h-10 w-10 bg-gray-200 rounded-full" />
        </div>
      </div>
    </Card>
  )
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Format currency in Naira with commas
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const q = query(collection(db, "products"))
        const querySnapshot = await getDocs(q)
        const productsData: Product[] = []

        querySnapshot.forEach((doc) => {
          productsData.push({
            id: doc.id,
            ...doc.data(),
          } as Product)
        })

        setProducts(productsData)
        setFilteredProducts(productsData)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query)
      const filtered = products.filter(
        (product) =>
          product.productName.toLowerCase().includes(query.toLowerCase()) ||
          product.description.toLowerCase().includes(query.toLowerCase()),
      )
      setFilteredProducts(filtered)
    },
    [products],
  )

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left">
              {/* Logo and Store Name */}
              <div className="flex items-center gap-4 justify-center md:justify-start mb-4">
                <div className="bg-white p-2 rounded-lg">
                  <Image 
                    src="/logo.png" 
                    alt="Catena LTD Logo" 
                    width={50} 
                    height={50} 
                    className="object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Catena LTD</h2>
                  <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full mt-1">
                    <TrendingUp className="h-3 w-3" />
                    <span className="text-xs font-medium">Premium Quality Products</span>
                  </div>
                </div>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-3">Welcome to Our Store</h1>
              <p className="text-blue-100 text-base md:text-lg max-w-2xl">
                Discover our curated collection of premium products, handpicked just for you
              </p>
            </div>
<Link href="/cart">
  <Button 
    size="lg"
    className="
      bg-white 
      text-black 
      border-2 
      border-white 
      shadow-lg 
      transition-all
      hover:bg-blue-600
      hover:border-blue-600
      hover:shadow-xl
      group
    "
  >
    <ShoppingCart className="h-5 w-5 mr-2 text-black group-hover:text-white" />
    <span className="text-black group-hover:text-white">View Cart</span>
  </Button>
</Link>


          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Search and Stats Bar */}
        <div className="mb-8">
          <div className="max-w-2xl mx-auto mb-6">
            <SearchProducts onSearch={handleSearch} />
          </div>
          
          {!isLoading && (
            <div className="flex items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{filteredProducts.length} Products</span>
              </div>
              {searchQuery && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">Showing results for "{searchQuery}"</span>
                </div>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <Card className="max-w-md mx-auto border-0 shadow-lg">
            <div className="text-center py-16 px-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
                <Package className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
              <p className="text-gray-600 mb-6">
                {searchQuery 
                  ? `We couldn't find any products matching "${searchQuery}"`
                  : "No products are currently available"}
              </p>
              {searchQuery && (
                <Button 
                  onClick={() => handleSearch("")}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear Search
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="group overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col cursor-pointer">
                  <div className="relative w-full aspect-square bg-gray-100 overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <>
                        <Image
                          src={product.images[0] || "/placeholder.svg"}
                          alt={product.productName}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {product.quantity === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="bg-red-500 text-white px-4 py-2 rounded-full font-semibold text-sm">
                              Out of Stock
                            </span>
                          </div>
                        )}
                        {product.quantity > 0 && product.quantity < 10 && (
                          <div className="absolute top-3 right-3">
                            <span className="bg-orange-500 text-white px-3 py-1 rounded-full font-semibold text-xs">
                              Only {product.quantity} left
                            </span>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Package className="h-16 w-16 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col bg-white">
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                      {product.productName}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2 flex-1 mb-4">
                      {product.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatCurrency(product.price)}
                        </p>
                        {product.variants && product.variants.length > 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            {product.variants.length} variant{product.variants.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-blue-600 text-white p-2 rounded-full">
                          <ShoppingCart className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}