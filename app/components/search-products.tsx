"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Search } from "lucide-react"
import { Input } from "@/app/components/ui/input"

interface SearchProductsProps {
  onSearch: (query: string) => void
}

export function SearchProducts({ onSearch }: SearchProductsProps) {
  const [query, setQuery] = useState("")

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setQuery(value)
      onSearch(value)
    },
    [onSearch],
  )

  return (
    <div className="relative w-full">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
      <Input placeholder="Search products..." value={query} onChange={handleChange} className="pl-10 bg-card" />
    </div>
  )
}
