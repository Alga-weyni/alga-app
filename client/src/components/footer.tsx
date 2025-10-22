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
              <div className="w-12 h-12 bg-eth-brown rounded-lg flex items-center justify-center">
                <Home className="h-6 w-6 text-white" />
              </div>
              <h4 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "'Playfair Display', serif" }}>ALGA</h4>
            </div>
            <p className="text-white/80 text-sm leading-relaxed pr-4">
              Authentic Ethiopian stays — connecting travelers and diaspora to local hospitality.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <Shield className="h-4 w-4 text-white/80" />
              <span className="text-white/90 font-semibold">100% Ethiopian Owned</span>
            </div>
          </div>

          {/* For Guests */}
          <div>
            <h5 className="font-bold text-white mb-4 text-sm">For Guests</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/properties" className="text-white/70 hover:text-white transition-colors">Browse Stays</Link></li>
              <li><Link to="/properties?city=Addis%20Ababa" className="text-white/70 hover:text-white transition-colors">Popular Destinations</Link></li>
              <li><a href="#" className="text-white/70 hover:text-white transition-colors">Travel Guide</a></li>
            </ul>
          </div>

          {/* For Hosts */}
          <div>
            <h5 className="font-bold text-white mb-4 text-sm">For Hosts</h5>
            <ul className="space-y-2.5 text-sm">
              <li><Link to="/become-host" className="text-white/70 hover:text-white transition-colors">List Your Property</Link></li>
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
        <div className="mt-16 pt-12 border-t border-white/20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12">
            
            {/* Contact Us */}
            <div className="space-y-5">
              <div>
                <h5 
                  className="text-xl font-bold text-white mb-2" 
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  data-testid="heading-contact"
                >
                  Contact Us
                </h5>
                <div className="w-12 h-1 bg-eth-brown/60 rounded-full"></div>
              </div>
              
              <div className="space-y-3">
                <a 
                  href="tel:+251996034044" 
                  className="group flex items-center gap-3 text-white/90 hover:text-white transition-all duration-300"
                  data-testid="link-phone"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                    <Phone className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/60 uppercase tracking-wide">Phone</p>
                    <p className="text-base font-medium">+251 996 034 044</p>
                  </div>
                </a>
                
                <a 
                  href="mailto:hello@alga.et" 
                  className="group flex items-center gap-3 text-white/90 hover:text-white transition-all duration-300"
                  data-testid="link-email"
                >
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-colors flex-shrink-0">
                    <Mail className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-white/60 uppercase tracking-wide">Email</p>
                    <p className="text-base font-medium">hello@alga.et</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Follow Us */}
            <div className="space-y-5">
              <div>
                <h5 
                  className="text-xl font-bold text-white mb-2" 
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  data-testid="heading-social"
                >
                  Follow Us
                </h5>
                <div className="w-12 h-1 bg-eth-brown/60 rounded-full"></div>
              </div>
              
              <p className="text-white/70 text-sm leading-relaxed">
                Stay connected with Alga across platforms:
              </p>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <a 
                  href="https://instagram.com/algaethiopia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  title="Instagram"
                  data-testid="link-instagram"
                >
                  <Instagram className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">Instagram</span>
                </a>
                
                <a 
                  href="https://tiktok.com/@algaethiopia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  title="TikTok"
                  data-testid="link-tiktok"
                >
                  <SiTiktok className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">TikTok</span>
                </a>
                
                <a 
                  href="https://facebook.com/algaethiopia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  title="Facebook"
                  data-testid="link-facebook"
                >
                  <Facebook className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">Facebook</span>
                </a>
                
                <a 
                  href="https://youtube.com/@algaethiopia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  title="YouTube"
                  data-testid="link-youtube"
                >
                  <SiYoutube className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">YouTube</span>
                </a>
                
                <a 
                  href="https://linkedin.com/company/algaethiopia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  title="LinkedIn"
                  data-testid="link-linkedin"
                >
                  <Linkedin className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">LinkedIn</span>
                </a>
                
                <a 
                  href="https://t.me/algaethiopia" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="group flex items-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                  title="Telegram"
                  data-testid="link-telegram"
                >
                  <SiTelegram className="h-5 w-5 text-white" />
                  <span className="text-sm font-medium">Telegram</span>
                </a>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className="text-white/60 text-sm italic leading-relaxed" data-testid="text-social-tagline">
                  <span className="font-semibold text-white/80">@algaethiopia</span> — for travel stories, host features, and behind-the-scenes journeys.
                </p>
              </div>
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
