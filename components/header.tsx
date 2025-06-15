"use client"

import { useEffect, useState, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingCart, UserRound, LogOut, User, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import { AnimatedSearch } from "@/components/animated-search"
import { useCartStore } from "@/store/cartStore"
import { useCartDrawerStore } from "@/store/cartDrawerStore"
import CartDrawer from "@/components/cart-drawer"
// ------------------- CHANGE #1: IMPORTS -------------------
// Supabase imports are GONE. We now import from our shopify.ts library.
import { getCustomerData, Customer } from "@/lib/shopify"

const Header = () => {
  const router = useRouter()
  const cart = useCartStore((state) => state.cart)
  const { openDrawer } = useCartDrawerStore()
  const [cartCount, setCartCount] = useState(0)
  
  // ------------------- CHANGE #2: USER STATE -------------------
  // The user state is now typed as `Customer` from Shopify, not `SupabaseUser`.
  const [user, setUser] = useState<Customer | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0))
  }, [cart])

  // ------------------- CHANGE #3: AUTHENTICATION LOGIC -------------------
  // This entire `useEffect` block is replaced. Instead of using `supabase.auth`,
  // it now checks for a Shopify customer access token in localStorage.
  useEffect(() => {
    const checkUserAuthentication = async () => {
      setIsLoading(true)
      // Check for the token in the browser's local storage.
      const tokenString = localStorage.getItem("customerAccessToken")

      if (tokenString) {
        try {
            const token = JSON.parse(tokenString)
            
            // Check if the token from storage is expired.
            if (new Date(token.expiresAt) < new Date()) {
                console.log("Shopify token expired, renewing...")
                const newAccessToken = await renewCustomerToken(token.accessToken)
                
                // If renewal is successful, update storage and fetch user data.
                if (newAccessToken) {
                    localStorage.setItem("customerAccessToken", JSON.stringify(newAccessToken))
                    const customerData = await getCustomerData(newAccessToken.accessToken)
                    setUser(customerData?.customer || null)
                } else {
                    // If renewal fails, the user is logged out.
                    localStorage.removeItem("customerAccessToken")
                    setUser(null)
                }
            } else {
                // If the token is still valid, fetch the user's data.
                const customerData = await getCustomerData(token.accessToken)
                setUser(customerData?.customer || null)
            }
        } catch (error) {
            console.error("Failed to process Shopify token:", error)
            localStorage.removeItem("customerAccessToken")
            setUser(null)
        }
      }
      setIsLoading(false)
    }

    checkUserAuthentication()
  }, []) // This effect runs once when the component mounts.

  // This `useEffect` for the dropdown remains the same.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // This `useEffect` for the logout modal remains the same.
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showLogoutModal) {
      timer = setTimeout(() => {
        setShowLogoutModal(false)
        router.push("/")
      }, 2000)
    }
    return () => clearTimeout(timer)
  }, [showLogoutModal, router])

  // ------------------- CHANGE #4: LOGOUT FUNCTION -------------------
  // This function no longer calls `supabase.auth.signOut()`.
  // It simply removes the token from localStorage.
  const handleLogout = () => {
    localStorage.removeItem("customerAccessToken")
    setUser(null)
    setDropdownOpen(false)
    setShowLogoutModal(true)
  }

  // ------------------- CHANGE #5: USER ICON CLICK LOGIC -------------------
  // The logic is simplified. If a user exists, show the dropdown.
  // If not, redirect to the login page. The Supabase-specific check is removed.
  const handleUserIconClick = () => {
    if (isLoading) return
    
    if (user) {
      setDropdownOpen(!dropdownOpen) // If logged in, toggle the menu.
    } else {
      router.push("/login") // If logged out, go to the login page.
    }
  }
  
  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDropdownOpen(false)
    router.push("/profile") 
  }

  return (
    <>
      {/* The JSX below is largely the same, but its behavior is now driven by the new Shopify state */}
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-5 pb-3">
        <div className="container flex h-14 items-center pl-0">
          <MobileMenu />
          <Link
            href="/"
            className="md:mr-4 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-0 flex items-center space-x-2"
          >
            <span className="text-2xl md:text-3xl font-bold md:ml-7">PosterPlug</span>
          </Link>
          <div className="hidden flex-1 md:flex">
             <nav className="flex items-center space-x-6 text-m font-medium ml-10">
              <Link href="/shop" className="transition-colors hover:text-foreground/80">Shop</Link>
              <Link href="/collections" className="transition-colors hover:text-foreground/80">Collections</Link>
              <Link href="/new" className="transition-colors hover:text-foreground/80">New Arrivals</Link>
              <Link href="/sale" className="transition-colors hover:text-foreground/80">Sale</Link>
            </nav>
          </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <AnimatedSearch />
            <Button variant="ghost" size="icon" onClick={openDrawer}>
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="text-sm font-bold">{cartCount}</span>
              )}
              <span className="sr-only">Cart</span>
            </Button>
            
            <div className="relative hidden md:block" ref={dropdownRef}>
              <Button
                variant="ghost" 
                size="icon" 
                onClick={handleUserIconClick}
                disabled={isLoading}
              >
                <UserRound className="h-5 w-5" />
                <span className="sr-only">{user ? "Account" : "Login"}</span>
              </Button>
              
              {/* This dropdown now displays the Shopify user's email */}
              {!isLoading && user && dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 font-bold truncate">
                    {user.email}
                  </div>
                  <button 
                    onClick={handleProfileClick}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </button>
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartDrawer />

      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50" role="dialog" aria-modal="true">
          <div className="bg-white rounded-lg p-6 shadow-xl transform transition-all max-w-sm w-full">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 rounded-full p-2">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900">Logged Out Successfully</h3>
            <p className="text-sm text-gray-500 text-center mt-2">
              You have been logged out of your account.
            </p>
          </div>
        </div>
      )}
    </>
  )
}

export default Header