"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import { Search, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { searchProducts, type Product } from "../lib/shopify"

export function AnimatedSearch() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const toggleSearch = () => setIsSearchOpen(!isSearchOpen)
  
  const closeSearch = () => {
    setIsSearchOpen(false)
    setSearchQuery("")
    setProducts([])
  }
  
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeSearch()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [])
  
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (searchQuery.length < 2) {
        setProducts([])
        return
      }
      setIsLoading(true)
      try {
        const results = await searchProducts(searchQuery)
        
        // --- DEBUGGING LOG ---
        // This will show us exactly what the component receives from the helper.
        console.log("Data received to be rendered:", results);
        
        // Ensure we always set an array to prevent crashes.
        setProducts(results || []) 
      } catch (error) {
        console.error('Error in fetchSearchResults:', error)
        setProducts([]) // Set to empty array on error
      } finally {
        setIsLoading(false)
      }
    }
    
    const debounceTimer = setTimeout(fetchSearchResults, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])
  
  const handleSearchInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }
  
  // The Search Overlay JSX, which will be "teleported"
  const searchOverlay = (
    <div className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur">
      <div className="w-full bg-white px-4 flex items-center py-4 border-b">
        <div className="relative w-full rounded-full border border-input overflow-hidden">
          <div className="flex items-center">
            <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="search"
              placeholder="Search for posters..."
              className="h-14 w-full bg-transparent pl-10 pr-10 outline-none"
              value={searchQuery}
              onChange={handleSearchInput}
            />
          </div>
        </div>
        <Button variant="ghost" size="icon" className="ml-2" onClick={closeSearch}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      
      {searchQuery.length > 0 && (
        <div className="w-full flex-grow bg-white overflow-y-auto">
          <div className="w-full max-w-screen-xl mx-auto px-4 py-4">
            <h3 className="text-lg font-semibold mb-4 tracking-wide">PRODUCTS</h3>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Searching...</div>
              ) : products.length > 0 ? (
                // --- ROBUST RENDERING LOGIC ---
                // This will safely map over the products and catch any errors.
                products.map((product) => {
                  if (!product) return null; // Safety check for null items in the array

                  try {
                    // Safely access potentially missing data
                    const imageUrl = product.images?.edges[0]?.node.url;
                    const price = parseFloat(product.priceRange?.minVariantPrice?.amount || '0');

                    return (
                      <div key={product.id} className="flex gap-4 py-2 border-b last:border-0">
                        <div className="w-20 h-24 relative bg-gray-100 flex-shrink-0">
                          {imageUrl ? (
                            <Image src={imageUrl} alt={product.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs text-center">No Image</div>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <div className="text-xs uppercase text-gray-500">
                            {product.productType || "POSTER"}
                          </div>
                          <Link href={`/product/${product.handle}`} className="font-medium hover:underline" onClick={closeSearch}>
                            <h4 className="font-medium">{product.title}</h4>
                          </Link>
                          <div className="mt-auto flex gap-2">
                            <span>Rs. {price.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )
                  } catch (error) {
                    console.error("Error rendering product:", product.id, error);
                    return <div key={`error-${product.id}`} className="text-red-500">Error displaying this item.</div>;
                  }
                })
              ) : (
                // This message will now show correctly if the products array is empty
                !isLoading && <div className="text-center text-muted-foreground">No products found for "{searchQuery}"</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
  return (
    <>
      <Button variant="ghost" size="icon" onClick={toggleSearch}>
        <Search className="h-5 w-5" />
        <span className="sr-only">Search</span>
      </Button>
      
      {isSearchOpen && isMounted && createPortal(
        searchOverlay,
        document.getElementById('search-portal')!
      )}
    </>
  )
}