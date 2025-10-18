import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Home, Menu, Globe, User, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "@/components/auth-dialog";

interface HeaderProps {
  hideNavigation?: boolean;
}

export default function Header({ hideNavigation = false }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [location, navigate] = useLocation();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      navigate("/");
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
  });

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:pl-6 lg:pr-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 sm:space-x-3 cursor-pointer">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Home className="text-primary-foreground text-base sm:text-lg" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold luxury-rich-gold">Alga</h1>
          </Link>

          {/* Mobile Menu Button */}
          {!hideNavigation && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" data-testid="button-mobile-menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left luxury-rich-gold">Navigation</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <Link 
                    href="/properties"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg py-3 px-4 rounded-lg transition-colors ${
                      location === '/properties' 
                        ? 'bg-primary text-primary-foreground font-medium' 
                        : 'hover:bg-secondary'
                    }`}
                    data-testid="mobile-link-explore"
                  >
                    Explore Properties
                  </Link>
                  
                  <Link 
                    href="/discover"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg py-3 px-4 rounded-lg transition-colors ${
                      location === '/discover' 
                        ? 'bg-primary text-primary-foreground font-medium' 
                        : 'hover:bg-secondary'
                    }`}
                    data-testid="mobile-link-discover"
                  >
                    Discover Map
                  </Link>

                  <Link 
                    href="/search"
                    onClick={() => setMobileMenuOpen(false)}
                    className={`text-lg py-3 px-4 rounded-lg transition-colors ${
                      location === '/search' 
                        ? 'bg-primary text-primary-foreground font-medium' 
                        : 'hover:bg-secondary'
                    }`}
                    data-testid="mobile-link-search"
                  >
                    Advanced Search
                  </Link>
                  
                  {isAuthenticated ? (
                    user?.role === 'host' && (
                      <Link 
                        href="/host/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className={`text-lg py-3 px-4 rounded-lg transition-colors ${
                          location === '/host/dashboard' 
                            ? 'bg-primary text-primary-foreground font-medium' 
                            : 'hover:bg-secondary'
                        }`}
                        data-testid="mobile-link-host-dashboard"
                      >
                        Host Dashboard
                      </Link>
                    )
                  ) : (
                    <Link 
                      href="/start-hosting"
                      onClick={() => setMobileMenuOpen(false)}
                      className={`text-lg py-3 px-4 rounded-lg transition-colors font-medium ${
                        location === '/start-hosting' 
                          ? 'bg-eth-orange text-white' 
                          : 'text-eth-orange hover:bg-eth-orange/10'
                      }`}
                      data-testid="mobile-link-start-hosting"
                    >
                      Start Hosting
                    </Link>
                  )}

                  {isAuthenticated && (
                    <>
                      <div className="border-t border-border my-2"></div>
                      
                      {(user?.role === 'guest' || user?.role === 'host') && (
                        <>
                          <Link 
                            href="/bookings"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-lg py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                            data-testid="mobile-link-bookings"
                          >
                            My Bookings
                          </Link>
                          <Link 
                            href="/favorites"
                            onClick={() => setMobileMenuOpen(false)}
                            className="text-lg py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                            data-testid="mobile-link-favorites"
                          >
                            My Favorites
                          </Link>
                        </>
                      )}

                      {user?.role === 'admin' && (
                        <Link 
                          href="/admin/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-lg py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                          data-testid="mobile-link-admin"
                        >
                          Admin Dashboard
                        </Link>
                      )}

                      {user?.role === 'operator' && (
                        <Link 
                          href="/operator/dashboard"
                          onClick={() => setMobileMenuOpen(false)}
                          className="text-lg py-3 px-4 rounded-lg hover:bg-secondary transition-colors"
                          data-testid="mobile-link-operator"
                        >
                          Operator Dashboard
                        </Link>
                      )}

                      <div className="border-t border-border my-2"></div>
                      
                      <Button
                        variant="outline"
                        className="w-full justify-start text-lg py-6"
                        onClick={() => {
                          logoutMutation.mutate();
                          setMobileMenuOpen(false);
                        }}
                        data-testid="mobile-button-logout"
                      >
                        Sign Out
                      </Button>
                    </>
                  )}

                  {!isAuthenticated && (
                    <>
                      <div className="border-t border-border my-2"></div>
                      <Button
                        className="w-full justify-start text-lg py-6"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          setAuthDialogOpen(true);
                        }}
                        data-testid="mobile-button-signin"
                      >
                        Sign In / Register
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Navigation - Hidden for operator/admin dashboards */}
          {!hideNavigation && (
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                href="/properties"
                className={`transition-colors ${
                  location === '/properties' 
                    ? 'text-primary font-medium' 
                    : 'text-foreground hover:text-primary'
                }`}
                data-testid="link-explore"
              >
                Explore
              </Link>
              
              <Link 
                href="/discover"
                className={`transition-colors ${
                  location === '/discover' 
                    ? 'text-primary font-medium' 
                    : 'text-foreground hover:text-primary'
                }`}
                data-testid="link-discover"
              >
                Discover Map
              </Link>
              
              {/* Show different links based on auth status and role */}
              {isAuthenticated ? (
                // Only show "Host Your Property" if user is a host
                user?.role === 'host' && (
                  <Link 
                    href="/host/dashboard"
                    className={`transition-colors ${
                      location === '/host/dashboard' 
                        ? 'text-primary font-medium' 
                        : 'text-foreground hover:text-primary'
                    }`}
                  >
                    Host Your Property
                  </Link>
                )
              ) : (
                // Show "Start Hosting" for non-authenticated users
                <Link 
                  href="/start-hosting"
                  className={`transition-colors font-medium ${
                    location === '/start-hosting' 
                      ? 'text-primary' 
                      : 'text-eth-orange hover:text-eth-orange/80'
                  }`}
                  data-testid="link-start-hosting"
                >
                  Start Hosting
                </Link>
              )}
              
              <a href="#" className="text-foreground hover:text-primary transition-colors">
                About Ethiopia
              </a>
            </nav>
          )}

          {/* User Menu - Desktop Only */}
          <div className="hidden md:flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <Globe className="h-5 w-5" />
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center space-x-2 bg-secondary rounded-full p-2 hover:bg-secondary/80 transition-colors cursor-pointer">
                    <Menu className="h-4 w-4 text-foreground" />
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={user?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    <p className="text-xs text-eth-orange font-medium mt-1 capitalize">{user?.role}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  {/* Tenant/Guest options */}
                  {(user?.role === 'guest' || user?.role === 'host') && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link href="/bookings">My Bookings</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href="/favorites">My Favorites</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Host-specific option */}
                  {user?.role === 'host' && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/host/dashboard">Host Dashboard</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  {/* Admin option */}
                  {user?.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin/dashboard">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  {/* Operator option */}
                  {user?.role === 'operator' && (
                    <DropdownMenuItem asChild>
                      <Link href="/operator/dashboard">Operator Dashboard</Link>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    data-testid="button-logout"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                onClick={() => setAuthDialogOpen(true)}
                data-testid="button-signin-header"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        defaultMode="login"
      />
    </header>
  );
}
