import Image from "next/image"
import Link from "next/link"

const collections = [
  {
    id: 1,
    title: "Minimalist",
    image: "/placeholder.svg?height=600&width=800",
    count: 24,
  },
  {
    id: 2,
    title: "Abstract",
    image: "/placeholder.svg?height=600&width=800",
    count: 18,
  },
  {
    id: 3,
    title: "Nature",
    image: "/placeholder.svg?height=600&width=800",
    count: 32,
  },
  {
    id: 4,
    title: "Urban",
    image: "/placeholder.svg?height=600&width=800",
    count: 16,
  },
]

export default function FeaturedCollections() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
      {collections.map((collection) => (
        <Link
          key={collection.id}
          href={`/collections/${collection.id}`}
          className="group relative overflow-hidden rounded-lg"
        >
          <div className="aspect-square relative overflow-hidden rounded-lg">
            <Image
              src={collection.image || "/placeholder.svg"}
              alt={collection.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-0 left-0 p-4 text-white">
              <h3 className="text-lg font-semibold">{collection.title}</h3>
              <p className="text-sm opacity-90">{collection.count} posters</p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}

