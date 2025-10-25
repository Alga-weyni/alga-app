// Universal Navigation - Optimized for Children, Elderly, and All Users
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { Home, Menu, User, Wrench, HelpCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "@/components/auth-dialog-passwordless";

interface HeaderProps {
  hideNavigation?: boolean;
}

export default function Header({ hideNavigation = false }: HeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
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
        title: "Signed Out",
        description: "See you soon! 👋",
      });
    },
  });

  // Navigation items with emojis for universal recognition - Airbnb-style minimal
  const navItems = [
    { path: "/properties", icon: Home, emoji: "🏠", label: "Stays", ariaLabel: "Browse places to stay", testId: "stays" },
    { path: "/services", icon: Wrench, emoji: "🧰", label: "Services", ariaLabel: "Browse services and help", testId: "services" },
    { path: "/my-alga", icon: User, emoji: "👤", label: "Me", ariaLabel: "View my dashboard", testId: "me" },
    { path: "/support", icon: HelpCircle, emoji: "👵🏾", label: "Ask Lemlem (ልምልም)", ariaLabel: "Ask Lemlem (ልምልም) - your AI agent", testId: "help" },
  ];

  return (
    <header className="bg-[#F8F1E7] shadow-sm sticky top-0 z-50 border-b border-[#E5D9C8]">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-18">
          {/* Logo - Bigger & Friendlier */}
          <Link 
            to="/" 
            className="flex items-center space-x-2 sm:space-x-3 cursor-pointer"
            aria-label="Alga home"
          >
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-eth-brown rounded-2xl flex items-center justify-center shadow-md">
              <Home className="text-white text-xl" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-eth-brown">Alga</h1>
          </Link>

          {/* Mobile Menu */}
          {!hideNavigation && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button 
                  variant="ghost" 
                  size="lg" 
                  className="h-14 w-14"
                  data-testid="button-mobile-menu"
                  aria-label="Open navigation menu"
                  role="button"
                >
                  <Menu className="h-7 w-7" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] sm:w-[380px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-eth-brown text-2xl">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8" role="navigation" aria-label="Main navigation">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-4 text-xl font-medium py-5 px-6 rounded-2xl transition-all
                          ${isActive 
                            ? 'bg-eth-brown text-white shadow-lg' 
                            : 'hover:bg-cream-100 text-eth-brown'}
                        `}
                        data-testid={`mobile-link-${item.testId}`}
                        aria-label={item.ariaLabel}
                        role="button"
                      >
                        <span className="text-3xl" aria-hidden="true">{item.emoji}</span>
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}

                  <div className="border-t border-border my-4"></div>

                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-xl py-7 font-medium"
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                      aria-label="Sign out of your account"
                      role="button"
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full text-xl py-7 bg-eth-brown hover:bg-eth-brown/90"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthDialogOpen(true);
                      }}
                      data-testid="mobile-button-signin"
                      aria-label="Sign in to your account"
                      role="button"
                    >
                      Sign In
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Navigation - Airbnb-style Minimal */}
          {!hideNavigation && (
            <nav className="hidden md:flex items-center gap-6 lg:gap-8" role="navigation" aria-label="Main navigation">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path || location.pathname.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="group relative flex items-center gap-2 py-2 transition-all"
                    data-testid={`link-${item.testId}`}
                    aria-label={item.ariaLabel}
                    role="button"
                  >
                    <span className="text-xl sm:text-2xl" aria-hidden="true">{item.emoji}</span>
                    <span className={`
                      text-sm sm:text-base font-medium transition-colors
                      ${isActive 
                        ? 'text-[#3C2313]' 
                        : 'text-[#5a4a42] group-hover:text-[#3C2313]'}
                    `}>
                      {item.label}
                    </span>
                    {/* Smooth underline animation */}
                    <span className={`
                      absolute bottom-0 left-0 h-0.5 bg-[#3C2313] transition-all duration-300 ease-out
                      ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}
                    `} aria-hidden="true"></span>
                  </Link>
                );
              })}
            </nav>
          )}

          {/* User Menu - Desktop */}
          <div className="hidden md:flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button 
                    className="flex items-center space-x-2 bg-white rounded-full p-1.5 pr-4 hover:shadow-md transition-all border border-[#E5D9C8] cursor-pointer"
                    aria-label="Open user menu"
                    role="button"
                  >
                    <Avatar className="w-9 h-9">
                      <AvatarImage src={user?.profileImageUrl || ""} alt={`${user?.firstName}'s profile`} />
                      <AvatarFallback className="bg-[#3C2313] text-white font-semibold text-sm">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-[#3C2313] hidden lg:block">
                      {user?.firstName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <div className="px-4 py-3">
                    <p className="text-base font-semibold text-eth-brown">{user?.firstName} {user?.lastName}</p>
                    <p className="text-sm text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link to="/my-alga" className="cursor-pointer text-base py-3" role="button" aria-label="Go to my dashboard">
                      👤 My Dashboard
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    data-testid="button-logout"
                    className="text-red-600 cursor-pointer text-base py-3"
                    role="button"
                    aria-label="Sign out of your account"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="default"
                onClick={() => setAuthDialogOpen(true)}
                data-testid="button-signin-header"
                className="bg-[#3C2313] hover:bg-[#3C2313]/90 text-white px-6 py-2 text-sm rounded-full font-medium transition-all hover:shadow-md"
                aria-label="Sign in to your account"
                role="button"
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
