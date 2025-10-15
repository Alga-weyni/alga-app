import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Menu, Globe, User } from "lucide-react";

export default function Header() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  return (
    <header className="bg-eth-warm-tan shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-4 cursor-pointer">
              <h1 className="text-4xl font-bold text-eth-brown tracking-wide" style={{ fontFamily: "'Playfair Display', 'Georgia', serif", letterSpacing: '0.08em' }}>
                ETHIOPIA STAYS
              </h1>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-10">
            <Link href="/properties">
              <a className={`hover:opacity-70 transition-opacity font-medium text-lg ${
                location === '/properties' 
                  ? 'text-eth-orange' 
                  : 'text-eth-brown'
              }`}>
                EXPLORE
              </a>
            </Link>
            {isAuthenticated && (
              <Link href="/host/dashboard">
                <a className={`hover:opacity-70 transition-opacity font-medium text-lg ${
                  location === '/host/dashboard' 
                    ? 'text-eth-orange' 
                    : 'text-eth-brown'
                }`}>
                  HOST
                </a>
              </Link>
            )}
            <a href="#" className="hover:opacity-70 transition-opacity font-medium text-lg text-eth-brown">
              ABOUT
            </a>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 bg-white/60 backdrop-blur-sm rounded-full p-2 hover:bg-white/80 transition-colors cursor-pointer border border-eth-brown/20">
                    <Menu className="h-4 w-4 text-eth-brown" />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-eth-orange text-white">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/bookings">My Bookings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/favorites">My Favorites</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/host/dashboard">Host Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout">Sign Out</a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild className="bg-eth-orange hover:opacity-90 text-white border-0 rounded-xl px-6 py-2 font-bold">
                <a href="/api/login">SIGN IN</a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
