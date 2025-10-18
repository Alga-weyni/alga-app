import { Link } from "wouter";
import { Home, Facebook, Twitter, Instagram, Shield, CreditCard, Smartphone, Mail } from "lucide-react";
import { SiStripe, SiPaypal, SiTiktok, SiYoutube, SiVisa, SiMastercard, SiAlipay, SiWechat } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-eth-brown text-white py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center">
                <Home className="text-white text-xl" />
              </div>
              <h4 className="text-2xl font-bold" style={{ fontFamily: "'Playfair Display', 'Georgia', serif" }}>ALGA</h4>
            </div>
            <p className="text-white/80 text-sm leading-relaxed">
              Connecting travelers with authentic Ethiopian experiences.
            </p>
            <div className="flex items-center space-x-2 text-sm">
              <Shield className="h-4 w-4 text-eth-orange" />
              <span className="text-white/90 font-semibold">100% Ethiopian Owned</span>
            </div>
            <div>
              <p className="text-xs text-white/60 mb-2">Follow Us</p>
              <div className="flex flex-wrap gap-3">
                <a href="https://facebook.com/alga" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#1877F2] transition-colors" title="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://instagram.com/alga" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#E4405F] transition-colors" title="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://twitter.com/alga" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#1DA1F2] transition-colors" title="Twitter/X">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://tiktok.com/@alga" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-white transition-colors" title="TikTok">
                  <SiTiktok className="h-5 w-5" />
                </a>
                <a href="https://youtube.com/@alga" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#FF0000] transition-colors" title="YouTube">
                  <SiYoutube className="h-5 w-5" />
                </a>
                <a href="mailto:hello@alga.et" className="text-white/70 hover:text-eth-orange transition-colors" title="Email Us">
                  <Mail className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-bold mb-4 text-lg text-eth-orange">Support & Resources</h5>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Safety & Trust</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Host Resources</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Cancellation Policy</a></li>
              <li><a href="#" className="text-white/80 hover:text-white transition-colors">Contact Us</a></li>
            </ul>
          </div>

          {/* Secure Payments */}
          <div>
            <h5 className="font-bold mb-4 text-lg text-eth-orange">Payment Methods</h5>
            
            {/* Primary: Ethiopian Payment */}
            <div className="bg-eth-orange/20 border border-eth-orange/30 rounded-lg px-3 py-2.5 mb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-eth-orange" />
                  <span className="text-sm font-semibold text-white">Telebirr</span>
                </div>
                <span className="text-xs text-white/80 font-medium">🇪🇹 Local</span>
              </div>
            </div>

            {/* International Payments Grid */}
            <div className="space-y-2.5">
              <p className="text-xs text-white/60 uppercase tracking-wide">International</p>
              
              {/* Cards & PayPal */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded px-2 py-1.5 flex items-center space-x-1.5">
                  <SiVisa className="h-4 w-4 text-[#1A1F71]" />
                  <span className="text-xs font-medium">Visa</span>
                </div>
                <div className="bg-white/10 rounded px-2 py-1.5 flex items-center space-x-1.5">
                  <SiMastercard className="h-4 w-4 text-[#EB001B]" />
                  <span className="text-xs font-medium">Mastercard</span>
                </div>
              </div>

              {/* Digital Wallets */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/10 rounded px-2 py-1.5 flex items-center space-x-1.5">
                  <SiPaypal className="h-4 w-4 text-[#00457C]" />
                  <span className="text-xs font-medium">PayPal</span>
                </div>
                <div className="bg-white/10 rounded px-2 py-1.5 flex items-center space-x-1.5">
                  <SiAlipay className="h-4 w-4 text-[#1677FF]" />
                  <span className="text-xs font-medium">Alipay</span>
                </div>
              </div>

              {/* WeChat standalone */}
              <div className="bg-white/10 rounded px-2 py-1.5 flex items-center space-x-1.5">
                <SiWechat className="h-4 w-4 text-[#07C160]" />
                <span className="text-xs font-medium">WeChat Pay</span>
              </div>
            </div>

            {/* Security Badge */}
            <div className="mt-4 pt-3 border-t border-white/20">
              <div className="flex items-center gap-1.5 text-xs text-white/70 mb-1">
                <Shield className="h-3.5 w-3.5 text-eth-orange" />
                <span className="font-medium">Secure & Encrypted</span>
              </div>
              <p className="text-xs text-white/50">SSL/TLS • PCI DSS Compliant</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center text-white/70">
          <p className="text-sm mb-4 md:mb-0">
            © 2024 Alga. Made with ❤️ in Ethiopia. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
