"use client"

import { useState, useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import { Console } from "console"

import {supabase} from "../lib/supabase"
import Link from "next/link"

type Product = {
  id: number
  title: string
  image: string
  category: string
  price: number
}

export function AnimatedSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen)
  }
  
  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setProducts([])
  }
  
  // Focus the input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Handle ESC key to close search
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        closeSearch()
      }
    }
    
    window.addEventListener('keydown', handleEsc)
    return () => {
      window.removeEventListener('keydown', handleEsc)
    }
  }, [])
  
  // Fetch search results from Supabase when query changes
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 2) {
        setProducts([])
        return
      }
      
      setIsLoading(true)
      
      try {
        // Fetch product results based on search query
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .ilike('title', `%${searchQuery}%`)
          .limit(10)
        
        if (productError) throw productError
        
        if (productData) {
          setProducts(productData)
          console.log(productData)
        }
      } catch (error) {
        console.error('Error fetching search results:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    // Use debounce to prevent too many requests
    const debounceTimer = setTimeout(fetchSearchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  return (
    <>
      {/* Regular search button (shown when search is closed) */}
      {!isSearchOpen && (
        <Button variant="ghost" size="icon" onClick={toggleSearch}>
          <Search className="h-5 w-5" />
          <span className="sr-only">Search</span>
        </Button>
      )}
      
      {/* Expanded search input and results (shown when search is open) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur transition-all duration-300 ease-in-out">
          {/* Search input */}
          <div className="w-full bg-white px-4 flex items-center py-4 border-b">
            <div className="relative w-full rounded-full border border-input overflow-hidden">
              <div className="flex items-center">
                <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search..."
                  className="h-14 w-full bg-transparent pl-10 pr-10 outline-none"
                  value={searchQuery}
                  onChange={handleSearchInput}
                />
              </div>
            </div>
            <Button variant="ghost" size="icon" className="ml-2" onClick={closeSearch}>
              <X className="h-5 w-5" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          
          {/* Search results */}
          {searchQuery.length > 0 && (
            <div className="w-full flex-grow bg-white">
              <div className="w-full max-w-screen-xl mx-auto px-4 py-4">
                {/* Products section */}
                <h3 className="text-lg font-semibold mb-4 tracking-wide">PRODUCTS</h3>
                <div className="space-y-4">
                  {isLoading ? (
                    <div>Loading...</div>
                  ) : products.length > 0 ? (
                    products.map((product) => (
                      <div key={product.id} className="flex gap-4 py-2 border-b last:border-0">
                        <div className="w-20 h-24 relative bg-gray-100">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              No image
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="text-xs uppercase text-gray-500">
                            {product.category || "POSTERIZED"}
                          </div>
                          <Link href={`/product/${product.id}`} className="font-medium hover:underline"><h4 className="font-medium">{product.title}</h4></Link>
                          <div className="mt-auto flex gap-2">
                            {product.price && product.price !== product.price && (
                              <span className="line-through text-gray-500">
                                Rs. {product.price.toFixed(2)}
                              </span>
                            )}
                            <span>
                              Rs. {product.price.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    searchQuery.length > 1 && (
                      <div>No products found</div>
                    )
                  )}
                </div>
                
                {searchQuery.length > 1 && (
                  <div className="mt-6 text-sm">
                    Search for "{searchQuery}"
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}