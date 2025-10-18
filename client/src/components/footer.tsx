import { Link } from "wouter";
import { Home, MapPin, Users, Building, Shield, Phone, Mail, Facebook, Instagram, Twitter } from "lucide-react";
import { SiTiktok, SiYoutube, SiVisa, SiMastercard, SiAlipay, SiWechat, SiPaypal } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-eth-brown text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Brand & Social */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 bg-eth-orange rounded-lg flex items-center justify-center">
                <Home className="h-5 w-5 text-white" />
              </div>
              <h4 className="text-xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>ALGA</h4>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Authentic Ethiopian stays for travelers and diaspora.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-3.5 w-3.5 text-eth-orange" />
              <span className="text-white/80 font-medium">100% Ethiopian Owned</span>
            </div>
            
            {/* Social Media */}
            <div className="pt-2">
              <div className="flex gap-2.5">
                <a href="https://facebook.com/alga" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Facebook">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="https://instagram.com/alga" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Instagram">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="https://twitter.com/alga" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="Twitter">
                  <Twitter className="h-4 w-4" />
                </a>
                <a href="https://tiktok.com/@alga" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="TikTok">
                  <SiTiktok className="h-4 w-4" />
                </a>
                <a href="https://youtube.com/@alga" target="_blank" rel="noopener noreferrer" className="w-8 h-8 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title="YouTube">
                  <SiYoutube className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* For Guests */}
          <div>
            <h5 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">For Guests</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/properties" className="text-white/70 hover:text-white transition-colors">Browse Properties</Link></li>
              <li><Link href="/properties?city=Addis%20Ababa" className="text-white/70 hover:text-white transition-colors">Addis Ababa Stays</Link></li>
              <li><Link href="/properties?city=Bahir%20Dar" className="text-white/70 hover:text-white transition-colors">Bahir Dar Stays</Link></li>
              <li><Link href="/properties?city=Gondar" className="text-white/70 hover:text-white transition-colors">Gondar Stays</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Travel Guide</a></li>
            </ul>
          </div>

          {/* For Hosts */}
          <div>
            <h5 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">For Hosts</h5>
            <ul className="space-y-2 text-sm">
              <li><Link href="/become-host" className="text-white/70 hover:text-white transition-colors">List Your Property</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Hosting Resources</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Pricing Tips</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Host Community</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Safety Guidelines</a></li>
            </ul>
          </div>

          {/* Support & Payments */}
          <div>
            <h5 className="font-semibold text-white mb-3 text-sm uppercase tracking-wide">Support</h5>
            <ul className="space-y-2 text-sm mb-4">
              <li><a href="tel:+251911000000" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> +251 911 000 000
              </a></li>
              <li><a href="mailto:hello@alga.et" className="text-white/70 hover:text-white transition-colors flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> hello@alga.et
              </a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Cancellations</a></li>
            </ul>

            {/* Payment Methods - Compact */}
            <div className="pt-3 border-t border-white/20">
              <p className="text-xs text-white/60 mb-2 uppercase tracking-wide">We Accept</p>
              <div className="flex flex-wrap gap-1.5 mb-2">
                <div className="bg-white/10 rounded px-2 py-1 flex items-center gap-1.5">
                  <Phone className="h-3 w-3 text-eth-orange" />
                  <span className="text-xs font-medium">Telebirr</span>
                </div>
                <div className="bg-white/10 rounded px-1.5 py-1">
                  <SiVisa className="h-3.5 w-3.5 text-[#1A1F71]" title="Visa" />
                </div>
                <div className="bg-white/10 rounded px-1.5 py-1">
                  <SiMastercard className="h-3.5 w-3.5 text-[#EB001B]" title="Mastercard" />
                </div>
                <div className="bg-white/10 rounded px-1.5 py-1">
                  <SiPaypal className="h-3.5 w-3.5 text-[#00457C]" title="PayPal" />
                </div>
                <div className="bg-white/10 rounded px-1.5 py-1">
                  <SiAlipay className="h-3.5 w-3.5 text-[#1677FF]" title="Alipay" />
                </div>
                <div className="bg-white/10 rounded px-1.5 py-1">
                  <SiWechat className="h-3.5 w-3.5 text-[#07C160]" title="WeChat Pay" />
                </div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <Shield className="h-3 w-3" />
                <span>SSL Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-white/60">
            <p>© 2024 Alga. Made with ❤️ in Ethiopia.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Sitemap</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
