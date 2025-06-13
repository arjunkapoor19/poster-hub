import Link from "next/link"
import { ChevronRight, Search, ShoppingCart, UserRound } from "lucide-react"

import HeroBanner from "@/components/hero-banner"
import LatestDropsCarousel from "@/components/latest-drops-carousel"
import PopularPosters from "@/components/popular-posters"
import Footer from "@/components/footer"
import Header from "@/components/header"
import { getProductsInCollection } from '@/lib/shopify';

export default async function Home() {
    const latestDropsProducts = await getProductsInCollection('latest-drops');
    
    return (
    <main className="flex min-h-screen flex-col">
        

      <Header />
      
      <HeroBanner />

      <div className="container px-4 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-center">Latest Drops</h2>
          <Link href="/new" className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary">
            View all
            <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <LatestDropsCarousel products={latestDropsProducts}/>
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
        <LatestDropsCarousel products={latestDropsProducts}/>
      </div>


      <Footer />
    </main>
  )
}

