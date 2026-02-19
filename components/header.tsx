"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { Menu, X, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { usePathname } from "next/navigation"

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { items } = useCart()
  const pathname = usePathname()

  const cartItemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/header-logo.png"
            alt="254 Convex Comm LTD"
            width={84}
            height={64}
            className="h-16 w-auto rounded-lg"
          />
          <div className="hidden sm:block">
            <p className="text-sm font-bold text-foreground"></p>
            <p className="text-xs text-muted-foreground"></p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/cart" 
            className="relative p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartItemCount > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-xs font-bold text-primary-foreground flex items-center justify-center">
                {cartItemCount}
              </span>
            )}
          </Link>
          <Button variant="outline" asChild>
            <Link href="/contact">Request a Quote</Link>
          </Button>
        </div>

        <button
          type="button"
          className="md:hidden p-2 text-muted-foreground hover:text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          <span className="sr-only">Toggle menu</span>
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`block py-2 text-sm font-medium transition-colors ${
                  pathname === link.href ? "text-primary" : "text-muted-foreground hover:text-primary"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex items-center gap-3 pt-2 border-t border-border mt-4">
              <Link 
                href="/cart" 
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary"
                onClick={() => setMobileMenuOpen(false)}
              >
                <ShoppingCart className="h-4 w-4" />
                Cart ({cartItemCount})
              </Link>
            </div>
            <Button className="w-full mt-4" asChild>
              <Link href="/contact">Request a Quote</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
