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
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  useEffect(() => {
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0))
  }, [cart])

  useEffect(() => {
    // Check current auth session
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    // Subscribe to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
    })

    return () => {
      listener?.subscription.unsubscribe()
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
        setShowLogoutModal(true)
        // Redirect happens after modal display (in useEffect)
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error)
    }
  }

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen)
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
            
            {/* User Account Button with Dropdown */}
            <div className="relative hidden md:block" ref={dropdownRef}>
              {user ? (
                <Button variant="ghost" size="icon" onClick={toggleDropdown}>
                  <UserRound className="h-5 w-5" />
                  <span className="sr-only">Account</span>
                </Button>
              ) : (
                <Link href="/login">
                  <Button variant="ghost" size="icon">
                    <UserRound className="h-5 w-5" />
                    <span className="sr-only">Login</span>
                  </Button>
                </Link>
              )}

              {/* Profile Dropdown Menu */}
              {dropdownOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                  <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-200 font-bold">
                    {user.email}
                  </div>
                  <Link 
                    href="/profile" 
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Link>
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