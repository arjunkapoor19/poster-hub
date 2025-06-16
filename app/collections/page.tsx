// src/app/collections/page.tsx

import Image from "next/image";
import Link from "next/link";
import { Heart, Paintbrush } from "lucide-react";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

// Define the type for a single collection for TypeScript safety
type Collection = {
  id: number;
  title: string;
  description: string;
  slug: string; // For the URL, e.g., /collections/pastel-dreams
  itemCount: number;
  imageUrl: string;
};

// --- DUMMY DATA ---
// In a real app, this would come from your Supabase database.
// For now, we've created it here with cute themes.
const dummyCollections: Collection[] = [
  {
    id: 1,
    title: "Pastel Dreams",
    description: "Soft, dreamy hues for a gentle and calming aesthetic.",
    slug: "pastel-dreams",
    itemCount: 12,
    imageUrl: "https://picsum.photos/seed/pastel/600/400",
  },
  {
    id: 2,
    title: "Cosmic Cuties",
    description: "Adorable astronauts, friendly aliens, and sparkling stars.",
    slug: "cosmic-cuties",
    itemCount: 8,
    imageUrl: "https://picsum.photos/seed/cosmic/600/400",
  },
  {
    id: 3,
    title: "Forest Friends",
    description: "Charming woodland creatures from bunnies to bears.",
    slug: "forest-friends",
    itemCount: 15,
    imageUrl: "https://picsum.photos/seed/forest/600/400",
  },
  {
    id: 4,
    title: "Ocean Whispers",
    description: "Cute narwhals, playful dolphins, and magical seascapes.",
    slug: "ocean-whispers",
    itemCount: 10,
    imageUrl: "https://picsum.photos/seed/ocean/600/400",
  },
  {
    id: 5,
    title: "Sweet Treats",
    description: "A delicious collection of cupcakes, ice cream, and candy.",
    slug: "sweet-treats",
    itemCount: 18,
    imageUrl: "https://picsum.photos/seed/sweets/600/400",
  },
  {
    id: 6,
    title: "Kawaii Culture",
    description: "Everything adorable from the heart of Japanese pop culture.",
    slug: "kawaii-culture",
    itemCount: 22,
    imageUrl: "https://picsum.photos/seed/kawaii/600/400",
  },
  {
    id: 7,
    title: "Minimalist Moments",
    description: "Simple lines and cute shapes for a clean, modern look.",
    slug: "minimalist-moments",
    itemCount: 9,
    imageUrl: "https://picsum.photos/seed/minimal/600/400",
  },
  {
    id: 8,
    title: "Paws & Whiskers",
    description: "A purr-fectly adorable tribute to our furry cat and dog friends.",
    slug: "paws-and-whiskers",
    itemCount: 16,
    imageUrl: "https://picsum.photos/seed/pets/600/400",
  },
  {
    id: 9,
    title: "Magical Academia",
    description: "Whimsical libraries, enchanted objects, and cozy study nooks.",
    slug: "magical-academia",
    itemCount: 11,
    imageUrl: "https://picsum.photos/seed/magic/600/400",
  },
];

export default function CollectionsPage() {
  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-12 md:py-16">
        <div className="flex flex-col items-center text-center space-y-4 mb-12">
          <Heart className="h-12 w-12 text-pink-400" />
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Our Collections</h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            Explore our specially curated collections, each filled with crazy art to bring joy to your space!
          </p>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {dummyCollections.map((collection) => (
            <Card key={collection.id} className="group flex flex-col overflow-hidden rounded-xl shadow-md transition-all duration-300 hover:shadow-2xl hover:-translate-y-2">
              <CardHeader className="p-0">
                <Link href={`/collections/${collection.slug}`} className="block overflow-hidden">
                  <Image
                    src={collection.imageUrl}
                    alt={collection.title}
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover aspect-video transition-transform duration-300 group-hover:scale-110"
                  />
                </Link>
              </CardHeader>
              <CardContent className="flex-1 p-6">
                <CardTitle className="text-2xl mb-2">{collection.title}</CardTitle>
                <p className="text-muted-foreground">{collection.description}</p>
              </CardContent>
              <CardFooter className="flex flex-col items-start gap-4 p-6 pt-0">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Paintbrush className="h-4 w-4 mr-2" />
                  <span>{collection.itemCount} Posters</span>
                </div>
                <Link href={`/collections/${collection.slug}`} className="w-full">
                  <Button className="w-full font-bold transition-colors bg-black hover:bg-gray-800 text-white">
                    View Collection
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}