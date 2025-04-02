"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] sm:w-[350px]">
        <nav className="flex flex-col gap-6 text-lg font-medium">
          <Link
            href="/shop"
            className="border-b pb-2 transition-colors hover:text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Shop
          </Link>
          <Link
            href="/collections"
            className="border-b pb-2 transition-colors hover:text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Collections
          </Link>
          <Link
            href="/new"
            className="border-b pb-2 transition-colors hover:text-foreground/80"
            onClick={() => setOpen(false)}
          >
            New Arrivals
          </Link>
          <Link
            href="/sale"
            className="border-b pb-2 transition-colors hover:text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Sale
          </Link>
          <Link
            href="/account"
            className="border-b pb-2 transition-colors hover:text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>
          <Link
            href="/help"
            className="border-b pb-2 transition-colors hover:text-foreground/80"
            onClick={() => setOpen(false)}
          >
            Help
          </Link>
        </nav>
      </SheetContent>
    </Sheet>
  )
}

