// src/app/new/page.tsx

"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"

import Footer from "@/components/footer"
import Header from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { supabase } from "@/lib/supabase" // Using the correct import path
import { useCartStore } from "@/store/cartStore"
import { useCartDrawerStore } from "@/store/cartDrawerStore"
import { AddToCartModal } from "@/components/ui/add-to-cart-modal"

// Define the Poster type
type Poster = {
  id: string
  title: string
  image: string | null
  price: number
}

export default function NewArrivalsPage() {
  const [products, setProducts] = useState<Poster[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const addToCart = useCartStore((state) => state.addToCart)
  const { openDrawer } = useCartDrawerStore()

  useEffect(() => {
    const fetchNewArrivals = async () => {
      setIsLoading(true)
      try {
        // This query now correctly fetches the latest products without the problematic sorting.
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("latest", true);

        if (error) {
          console.error("Error fetching new arrivals:", error);
        } else {
          setProducts(data || []);
        }
      } catch (err) {
        console.error("Unexpected error fetching new arrivals:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  useEffect(() => {
    if (isModalOpen) {
      const timer = setTimeout(() => setIsModalOpen(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [isModalOpen]);

  const handleAddToCart = (poster: Poster) => {
    addToCart({
      id: poster.id,
      name: poster.title,
      price: poster.price,
      quantity: 1,
      image: poster.image || "/placeholder.svg",
    });
    setIsModalOpen(true);
    openDrawer();
  };

  return (
    <>
      <Header />
      <AddToCartModal isOpen={isModalOpen} />
      
      <main className="bg-background text-foreground">
        <div className="container mx-auto px-4 py-12 md:py-16">
          
          <div className="mb-12 border-b pb-8">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter">New Arrivals</h1>
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              The latest additions to the WallStreet collection.
            </p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 xl:gap-x-8">
              {products.map((poster) => (
                <Card key={poster.id} className="overflow-hidden border-0 shadow-sm transition-shadow hover:shadow-lg">
                  <CardContent className="p-0">
                    <Link href={`/product/${poster.id}`} className="relative block aspect-[2/3] overflow-hidden">
                      <Image
                        src={poster.image || "/placeholder.svg"}
                        alt={poster.title}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    </Link>
                  </CardContent>
                  <CardFooter className="flex flex-col p-4 items-center text-center">
                    <Link href={`/product/${poster.id}`} className="font-semibold hover:underline text-base leading-tight">
                      {poster.title}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">₹{poster.price.toFixed(2)}</p>
                    <Button 
                      className="w-full mt-4 font-bold" 
                      onClick={() => handleAddToCart(poster)}
                    >
                      Add to Cart
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && products.length > 0 && (
            <div className="mt-16 flex justify-center">
              <Button size="lg" asChild>
                <Link href="/shop">
                  Explore All Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          )}

        </div>
      </main>
      <Footer />
    </>
  );
}