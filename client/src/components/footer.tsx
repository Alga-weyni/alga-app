import { Link } from "wouter";
import { Home, Facebook, Twitter, Instagram } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background border-t border-border text-foreground py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Home className="text-primary-foreground text-lg" />
              </div>
              <h4 className="text-xl font-bold luxury-rich-gold">Alga</h4>
            </div>
            <p className="text-muted-foreground text-sm mb-4">
              Discover authentic Ethiopian hospitality and connect with local communities 
              across the beautiful landscapes of Ethiopia.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
              <Twitter className="h-5 w-5 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
              <Instagram className="h-5 w-5 text-primary cursor-pointer hover:text-primary/80 transition-colors" />
            </div>
          </div>

          {/* Explore */}
          <div>
            <h5 className="font-semibold mb-4 luxury-rich-gold">Explore</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/properties?city=Addis Ababa" className="hover:text-primary transition-colors">
                  Addis Ababa
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Bahir Dar" className="hover:text-primary transition-colors">
                  Bahir Dar
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Gondar" className="hover:text-primary transition-colors">
                  Gondar
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Lalibela" className="hover:text-primary transition-colors">
                  Lalibela
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Hawassa" className="hover:text-primary transition-colors">
                  Hawassa
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-semibold mb-4 luxury-rich-gold">Support</h5>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Safety Information</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Cancellation Options</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Host Resources</a></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h5 className="font-semibold mb-4 luxury-rich-gold">Payment Partners</h5>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Secure payments via:</p>
              <ul className="space-y-1">
                <li>• Commercial Bank of Ethiopia</li>
                <li>• Dashen Bank</li>
                <li>• Bank of Abyssinia</li>
                <li>• Mobile Money (M-Birr)</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground mb-4 md:mb-0">
            © 2024 Alga. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
