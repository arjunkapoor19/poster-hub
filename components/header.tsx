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
import { supabase } from "@/lib/supabaseClient"
import { User as SupabaseUser } from "@supabase/supabase-js" 

const Header = () => {
  const router = useRouter()
  const cart = useCartStore((state) => state.cart)
  const { openDrawer } = useCartDrawerStore()
  const [cartCount, setCartCount] = useState(0)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0))
  }, [cart])

  useEffect(() => {
    // Set up auth state listener right away
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    // Initial auth check
    const checkInitialAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user || null)
        console.log("session here",session)
      } catch (error) {
        console.error("Auth check error:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkInitialAuth()

    return () => {
      authListener?.subscription.unsubscribe()
    }
  }, [])

  // Close dropdown when clicking outside
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

  // Auto-close logout modal after a delay
  useEffect(() => {
    let timer: NodeJS.Timeout
    if (showLogoutModal) {
      timer = setTimeout(() => {
        setShowLogoutModal(false)
        router.push("/")
      }, 2000)
    }
    return () => {
      clearTimeout(timer)
    }
  }, [showLogoutModal, router])

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error("Error logging out:", error.message)
      } else {
        setDropdownOpen(false)
        setUser(null) // Immediately update UI
        setShowLogoutModal(true)
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error)
    }
  }

  const handleUserIconClick = () => {
    if (isLoading) return
  
    if (user) {
      const isMagicLinkVerified = !!user.email_confirmed_at
      if (isMagicLinkVerified) {
        router.push("/profile")
      } else {
        // fallback if user somehow not verified yet
        setDropdownOpen(!dropdownOpen)
      }
    } else {
      router.push("/login")
    }
  }
  
  

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault() // Prevent any default behavior
    e.stopPropagation() // Stop event bubbling
    setDropdownOpen(false) // Close dropdown
    router.push("/profile") // Navigate programmatically 
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-5 pb-3">
        <div className="container flex h-14 items-center pl-0">
          <MobileMenu />
          <Link
            href="/"
            className="md:mr-4 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-0 flex items-center space-x-2"
          >
            <span className="text-2xl md:text-3xl font-bold md:ml-7">WallStreet</span>
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
            
            {/* User Account Button with Dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {/* Show a single button for both logged in and logged out states */}
              <Button
                variant="ghost" 
                size="icon" 
                onClick={handleUserIconClick}
                disabled={isLoading}
              >
                <UserRound className="h-5 w-5" />
                <span className="sr-only">{user ? "Account" : "Login"}</span>
              </Button>

              {/* Profile Dropdown Menu - Only show when logged in and dropdown is open */}
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

      {/* Logout Success Modal */}
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
            <div className="mt-4 flex justify-center">
              <Button 
                onClick={() => {
                  setShowLogoutModal(false)
                  router.push("/")
                }}
                className="px-4 py-2"
              >
                Return Home
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Header