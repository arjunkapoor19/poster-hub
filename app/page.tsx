import Link from "next/link"
import { ChevronRight, Search, ShoppingCart, UserRound, Star, TrendingUp, Award } from "lucide-react"

import HeroBanner from "@/components/hero-banner"
import LatestDropsCarousel from "@/components/latest-drops-carousel"
import PopularPosters from "@/components/popular-posters"
import Footer from "@/components/footer"
import Header from "@/components/header"
import LatestDropsCarousel2 from "@/components/latest-drops-carousel2"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <Header />
      
      <HeroBanner />

      {/* Stats Section */}
      <div className="bg-muted/30 py-4">
        <div className="container px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center ">
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">100+</div>
              <div className="text-sm text-muted-foreground">Unique Designs</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">4.9</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Rating
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-bold text-primary">4 day</div>
              <div className="text-sm text-muted-foreground">Fast Shipping</div>
            </div>
          </div>
        </div>
      </div>

      {/* Latest Drops Section */}
      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold tracking-tight">Latest Drops</h2>
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">New</span>
          </div>
          <Link href="/new" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <LatestDropsCarousel />
      </div>

      {/* Popular Right Now Section */}
      <div className="bg-gradient-to-r from-background to-muted/20 py-8 md:py-12">
        <div className="container px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Award className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold tracking-tight">Our Collections</h2>
              <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">Hot</span>
            </div>
            <Link
              href="/popular"
              className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              View all
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <PopularPosters />
        </div>
      </div>

      <Footer />
    </main>
  )
}