import { Link } from "wouter";
import { Home, Shield, Phone, Mail, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";
import { SiTiktok, SiYoutube, SiTelegram } from "react-icons/si";

export default function Footer() {
  return (
    <footer className="bg-eth-brown text-white">
      {/* Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 lg:gap-6">
          
          {/* Brand - Takes 2 columns */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-12 h-12 bg-eth-orange rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>ALGA</h4>
            </div>
            <p className="text-white/80 text-sm leading-relaxed pr-4">
              Authentic Ethiopian stays — connecting travelers and diaspora to local hospitality.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-4 w-4 text-eth-orange" />
              <span className="text-white/90 font-semibold">100% Ethiopian Owned</span>
            </div>
          </div>

          {/* For Guests */}
          <div>
            <h5 className="font-bold text-white mb-4 text-sm">For Guests</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/properties" className="text-white/70 hover:text-white transition-colors">Browse Stays</Link></li>
              <li><Link href="/properties?city=Addis%20Ababa" className="text-white/70 hover:text-white transition-colors">Popular Destinations</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Travel Guide</a></li>
            </ul>
          </div>

          {/* For Hosts */}
          <div>
            <h5 className="font-bold text-white mb-4 text-sm">For Hosts</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/become-host" className="text-white/70 hover:text-white transition-colors">List Your Property</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Host Resources</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Community & Support</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h5 className="font-bold text-white mb-4 text-sm">Support</h5>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Safety & Trust</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Cancellations</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h5 className="font-bold text-white mb-4 text-sm">Legal</h5>
            <ul className="space-y-2.5 text-sm">
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Terms & Conditions</a></li>
            </ul>
          </div>
        </div>

        {/* Contact & Social Section */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Contact Us */}
            <div>
              <h5 className="font-bold text-white mb-4 text-sm">Contact Us</h5>
              <div className="space-y-2.5 text-sm">
                <a href="tel:+251911000000" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
                  <Phone className="h-4 w-4 text-eth-orange" />
                  <span>+251 911 000 000</span>
                </a>
                <a href="mailto:hello@alga.et" className="text-white/80 hover:text-white transition-colors flex items-center gap-2">
                  <Mail className="h-4 w-4 text-eth-orange" />
                  <span>hello@alga.et</span>
                </a>
              </div>
            </div>

            {/* Follow Us */}
            <div>
              <h5 className="font-bold text-white mb-3 text-sm">Follow Us</h5>
              <p className="text-white/70 text-xs mb-3">Stay connected with Alga across platforms:</p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <a href="https://instagram.com/algaethiopia" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs transition-colors" title="Instagram">
                  <Instagram className="h-3.5 w-3.5" />
                  <span>Instagram</span>
                </a>
                <a href="https://tiktok.com/@algaethiopia" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs transition-colors" title="TikTok">
                  <SiTiktok className="h-3.5 w-3.5" />
                  <span>TikTok</span>
                </a>
                <a href="https://facebook.com/algaethiopia" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs transition-colors" title="Facebook">
                  <Facebook className="h-3.5 w-3.5" />
                  <span>Facebook</span>
                </a>
                <a href="https://youtube.com/@algaethiopia" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs transition-colors" title="YouTube">
                  <SiYoutube className="h-3.5 w-3.5" />
                  <span>YouTube</span>
                </a>
                <a href="https://linkedin.com/company/algaethiopia" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs transition-colors" title="LinkedIn">
                  <Linkedin className="h-3.5 w-3.5" />
                  <span>LinkedIn</span>
                </a>
                <a href="https://t.me/algaethiopia" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 flex items-center gap-1.5 text-xs transition-colors" title="Telegram">
                  <SiTelegram className="h-3.5 w-3.5" />
                  <span>Telegram</span>
                </a>
              </div>
              
              <p className="text-white/60 text-xs italic">
                @algaethiopia — for travel stories, host features, and behind-the-scenes journeys.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:pl-6 lg:pr-12 py-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 text-center sm:text-left">
            <div className="text-sm text-white/70">
              <p className="font-medium">© 2025 Alga. Built with ❤️ in Ethiopia.</p>
              <p className="text-xs text-white/50 mt-1">Powered by local innovation and global connection.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
