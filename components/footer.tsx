import Link from "next/link"
import Image from "next/image"
import { Mail, MapPin, Phone, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  return (
    <footer className="bg-muted border-t border-border">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/images/logo-brandmark.png"
                alt="254 Convex Comm LTD"
                width={40}
                height={40}
                className="h-10 w-auto"
              />
              <div>
                <p className="text-sm font-bold text-foreground">254 Convex Comm LTD</p>
                <p className="text-xs text-muted-foreground">Your peace of mind is our priority</p>
              </div>
            </Link>
            <p className="text-sm text-muted-foreground">
              Technology-driven ecommerce supplier serving businesses across Kenya.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Business Segments</h3>
            <ul className="space-y-2">
              <li className="text-sm text-muted-foreground">Electronics</li>
              <li className="text-sm text-muted-foreground">CCTV Surveillance</li>
              <li className="text-sm text-muted-foreground">Home Appliances</li>
              <li className="text-sm text-muted-foreground">Office Stationery</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-foreground">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <span>0722745703</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span>sales@254convexcomltd.co.ke</span>
              </li>
              <li className="flex items-start gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary mt-0.5" />
                <span>Jivern Bharat Building 5th Flr along Harambee Avenue, Nairobi</span>
              </li>
            </ul>
            <Button className="mt-4 gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white" asChild>
              <a href="https://wa.me/254722745703" target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp Us
              </a>
            </Button>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} 254 Convex Comm LTD. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
