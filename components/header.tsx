"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ShoppingCart, UserRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import { AnimatedSearch } from "@/components/animated-search"
import { useCartStore } from "@/store/cartStore"

const Header = () => {
  const cart = useCartStore((state) => state.cart)
  const [cartCount, setCartCount] = useState(0)

  // Prevent hydration mismatch by setting cartCount only after mount
  useEffect(() => {
    setCartCount(cart.reduce((acc, item) => acc + item.quantity, 0))
  }, [cart])

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-5 pb-3">
      <div className="container flex h-14 items-center pl-0">
        <MobileMenu />
        <Link
          href="/"
          className="md:mr-4 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-0 flex items-center space-x-2"
        >
          <span className="text-2xl md:text-3xl font-bold md:ml-7">Postered</span>
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
          <Button variant="ghost" size="icon">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="ml-1 text-sm font-bold">{cartCount}</span>
            )}
            <span className="sr-only">Cart</span>
          </Button>
          <Button variant="ghost" size="icon" className="hidden md:flex">
            <UserRound className="h-5 w-5" />
            <span className="sr-only">Account</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
