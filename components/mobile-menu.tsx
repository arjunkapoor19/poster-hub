"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import type { User } from "@supabase/supabase-js"
import { Menu, LogIn, UserCircle, LogOut } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle, // <-- 1. Import SheetTitle
  SheetTrigger,
} from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden" // <-- 2. Import VisuallyHidden

export default function MobileMenu() {
  const [open, setOpen] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // ... (the useEffect and handleLogout hooks remain exactly the same)
  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => { subscription?.unsubscribe() }
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setOpen(false)
    router.push("/")
    router.refresh()
  }


  const MenuLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <Link
      href={href}
      className="text-muted-foreground transition-colors hover:text-foreground"
      onClick={() => setOpen(false)}
    >
      {children}
    </Link>
  )

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[300px] pr-10">
        {/* --- 3. ADD THE HIDDEN TITLE --- */}
        <VisuallyHidden>
          <SheetTitle>Mobile Navigation Menu</SheetTitle>
        </VisuallyHidden>
        
        <nav className="flex h-full flex-col gap-6 text-lg font-medium">
          {/* ... (the rest of your nav JSX remains the same) ... */}
           <div className="flex flex-col gap-4 pt-6">
            <MenuLink href="/shop">Shop All</MenuLink>
            <MenuLink href="/collections">Collections</MenuLink>
            <MenuLink href="/new">New Arrivals</MenuLink>
            <MenuLink href="/sale">Sale</MenuLink>
          </div>
          
          <Separator className="my-4" />

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : user ? (
              <>
                <Link href="/profile" className="flex items-center gap-2 transition-colors hover:text-foreground" onClick={() => setOpen(false)}>
                  <UserCircle className="h-5 w-5" />
                  My Profile
                </Link>
                <MenuLink href="/profile/orders">My Orders</MenuLink>
              </>
            ) : (
              <Link href="/login" className="flex items-center gap-2 transition-colors hover:text-foreground" onClick={() => setOpen(false)}>
                <LogIn className="h-5 w-5" />
                Login / Sign Up
              </Link>
            )}
            <MenuLink href="/help">Help Center</MenuLink>
          </div>

          {user && (
            <div className="mt-auto">
              <Button variant="ghost" className="w-full justify-start gap-2 p-0 text-lg font-medium text-red-500 hover:text-red-400" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          )}
        </nav>
      </SheetContent>
    </Sheet>
  )
}