import { Link } from "wouter";
import { Home } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-eth-brown text-white py-12">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-eth-orange rounded-lg flex items-center justify-center">
                <Home className="text-white text-lg" />
              </div>
              <h4 className="text-xl font-bold">Ethiopia Stays</h4>
            </div>
            <p className="text-white/80 text-sm mb-4">
              Discover authentic Ethiopian hospitality and connect with local communities 
              across the beautiful landscapes of Ethiopia.
            </p>
          </div>

          {/* Explore */}
          <div>
            <h5 className="font-semibold mb-4">Explore</h5>
            <ul className="space-y-2 text-sm text-white/80">
              <li>
                <Link href="/properties?city=Addis Ababa" className="hover:text-white transition-colors">
                  Addis Ababa
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Bahir Dar" className="hover:text-white transition-colors">
                  Bahir Dar
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Gondar" className="hover:text-white transition-colors">
                  Gondar
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Lalibela" className="hover:text-white transition-colors">
                  Lalibela
                </Link>
              </li>
              <li>
                <Link href="/properties?city=Hawassa" className="hover:text-white transition-colors">
                  Hawassa
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-semibold mb-4">Support</h5>
            <ul className="space-y-2 text-sm text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Safety Information</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cancellation Options</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Host Resources</a></li>
            </ul>
          </div>

          {/* Payment Methods */}
          <div>
            <h5 className="font-semibold mb-4">Payment Partners</h5>
            <div className="space-y-2 text-sm text-white/80">
              <p>Secure payments via:</p>
              <ul className="space-y-1">
                <li>• Commercial Bank</li>
                <li>• Dashen Bank</li>
                <li>• Bank of Abyssinia</li>
                <li>• Mobile Money</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-white/80 mb-4 md:mb-0">
            © 2024 Ethiopia Stays. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm text-white/80">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
