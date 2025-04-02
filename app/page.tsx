import Link from "next/link"
import { ChevronRight, Search, ShoppingCart, UserRound } from "lucide-react"

import { Button } from "@/components/ui/button"
import MobileMenu from "@/components/mobile-menu"
import HeroBanner from "@/components/hero-banner"
import LatestDropsCarousel from "@/components/latest-drops-carousel"
import FeaturedCollections from "@/components/featured-collections"
import PopularPosters from "@/components/popular-posters"
import Footer from "@/components/footer"
import { AnimatedSearch } from "@/components/AnimatedSearch"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">

      <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 pt-5 pb-3">
        <div className="container flex h-14 items-center pl-0">
          <MobileMenu />
          <Link href="/" className="md:mr-4 absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-0 flex items-center space-x-2">
            <span className="text-2xl md:text-3xl font-bold md:ml-7">Postered</span>
          </Link>
         
          <div className="hidden flex-1 md:flex">
            <nav className="flex items-center space-x-6 text-m font-medium ml-10">
              <Link href="/shop" className="transition-colors hover:text-foreground/80">
                Shop
              </Link>
              <Link href="/collections" className="transition-colors hover:text-foreground/80">
                Collections
              </Link>
              <Link href="/new" className="transition-colors hover:text-foreground/80">
                New Arrivals
              </Link>
              <Link href="/sale" className="transition-colors hover:text-foreground/80">
                Sale
              </Link>
            </nav>
            </div>
          <div className="flex flex-1 items-center justify-end space-x-4">
            <AnimatedSearch />
            <Button variant="ghost" size="icon">
              <ShoppingCart className="h-5 w-5" />
              <span className="sr-only">Cart</span>
            </Button>
            <Button variant="ghost" size="icon" className= "hidden md:flex">
              <UserRound className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </div>
        </div>
      </header>
      
      <HeroBanner />

      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Latest Drops</h2>
          <Link href="/new" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <LatestDropsCarousel />
      </div>

      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight">Popular Right Now</h2>
          <Link
            href="/popular"
            className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary"
          >
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <PopularPosters />
      </div>

      <div className="container px-4 py-8 md:py-12">
        <h2 className="text-2xl font-bold tracking-tight mb-6">Featured Collections</h2>
        <LatestDropsCarousel />
      </div>


      <Footer />
    </main>
  )
}

