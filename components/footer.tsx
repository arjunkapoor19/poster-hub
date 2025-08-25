// components/footer.tsx
import Link from "next/link"
import { Instagram } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 py-8 md:py-12 flex flex-col items-center space-y-6">
        
        {/* Top navigation links (centered, single row) */}
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
          <Link href="/faq" className="hover:text-foreground">FaQ</Link>
          <Link href="/T&C" className="hover:text-foreground">Terms & Conditions</Link>
          <Link href="/refund-policy" className="hover:text-foreground">Cancellation & Refund Policy</Link>
          <Link href="/contact" className="hover:text-foreground">Contact Us</Link>
          <Link href="/privacy-policy" className="hover:text-foreground">Privacy Policy</Link>
          <Link href="/shipping-policy" className="hover:text-foreground">Shipping & Delivery policy</Link>
        </div>

        {/* Social icons (centered) */}
        <div className="flex justify-center">
          <Link href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <Instagram className="h-5 w-5 hover:text-foreground" />
          </Link>
        </div>

        {/* Divider */}
        <div className="w-full border-t" />

        {/* Copyright (centered) */}
        <p className="text-xs text-muted-foreground text-center">
          © {new Date().getFullYear()}, WallStreet
        </p>
      </div>
    </footer>
  )
}
