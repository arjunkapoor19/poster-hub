// components/footer.tsx

import Link from "next/link"
import { Facebook, Instagram, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button" // Assuming you use shadcn/ui Button
import { Input } from "@/components/ui/input"   // Assuming you use shadcn/ui Input

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12">
        {/* Main 4-column grid for navigation */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">Shop</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/new" className="text-muted-foreground hover:text-foreground">New Arrivals</Link></li>
              {/* <li><Link href="/bestsellers" className="text-muted-foreground hover:text-foreground">Bestsellers</Link></li> */}
              {/* <li><Link href="/sale" className="text-muted-foreground hover:text-foreground">Sale</Link></li> */}
              <li><Link href="/collections" className="text-muted-foreground hover:text-foreground">Collections</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-lg font-semibold">Help</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link></li>
              {/* This link now correctly points to the shipping policy page we created */}
              <li><Link href="/shipping-policy" className="text-muted-foreground hover:text-foreground">Shipping</Link></li>
              {/* This link now correctly points to the refund policy page we created */}
              <li><Link href="/refund-policy" className="text-muted-foreground hover:text-foreground">Returns & Refunds</Link></li>
              <li><Link href="/contact" className="text-muted-foreground hover:text-foreground">Contact Us</Link></li>
            </ul>
          </div>
          {/* <div>
            <h3 className="mb-4 text-lg font-semibold">About</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-muted-foreground hover:text-foreground">Our Story</Link></li>
              <li><Link href="/careers" className="text-muted-foreground hover:text-foreground">Careers</Link></li>
            </ul>
          </div> */}
          <div>
            <h3 className="mb-4 text-lg font-semibold">Connect</h3>
            {/* <div className="flex space-x-4">
              <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                <Twitter className="h-5 w-5" />
                <span className="sr-only">Twitter</span>
              </Link>
            </div> */}
            <div className="mt-4">
              <h4 className="mb-2 text-sm font-medium">Subscribe to our newsletter</h4>
              <div className="flex max-w-sm flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
                <Input type="email" placeholder="Your email" />
                <Button>Subscribe</Button>
              </div>
            </div>
          </div>
        </div>

        {/* --- NEW SECTION: Legal Links & Copyright --- */}
        <div className="mt-12 border-t pt-8 text-sm text-muted-foreground">
          <div className="flex flex-col-reverse items-center gap-4 sm:flex-row sm:justify-between">
            <p className="text-center sm:text-left">
              © {new Date().getFullYear()} WallStreet. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              <Link href="/T&C" className="hover:text-foreground">Terms & Conditions</Link>
              <Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
              <Link href="/shipping-policy" className="hover:text-foreground">Shipping Policy</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  )
}