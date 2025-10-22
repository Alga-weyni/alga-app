// Simplified Child-Friendly Navigation for Alga
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
import { Home, Menu, User, Wrench, HelpCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import AuthDialog from "@/components/auth-dialog-passwordless";

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
        title: "Signed Out",
        description: "See you soon! 👋",
      });
    },
  });

  // Navigation items (child-friendly labels with icons)
  const navItems = [
    { path: "/properties", icon: Home, label: "Stay", testId: "stay" },
    { path: "/services", icon: Wrench, label: "Fix", testId: "fix" },
    ...(isAuthenticated ? [{ path: "/my-alga", icon: User, label: "Me", testId: "me" }] : []),
    { path: "/support", icon: HelpCircle, label: "Help", testId: "help" },
  ];

  return (
    <header className="bg-background shadow-sm sticky top-0 z-50 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo - Bigger & Friendlier */}
          <Link href="/" className="flex items-center space-x-3 cursor-pointer">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-eth-brown rounded-2xl flex items-center justify-center shadow-md">
              <Home className="text-white text-xl" />
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
                  className="h-12 w-12"
                  data-testid="button-mobile-menu"
                >
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="text-left text-eth-brown text-xl">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-3 mt-8">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location === item.path || location.startsWith(`${item.path}/`);
                    return (
                      <Link
                        key={item.path}
                        href={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`
                          flex items-center gap-3 text-lg font-medium py-4 px-5 rounded-xl transition-all
                          ${isActive 
                            ? 'bg-eth-brown text-white shadow-md' 
                            : 'hover:bg-cream-100 text-eth-brown'}
                        `}
                        data-testid={`mobile-link-${item.testId}`}
                      >
                        <Icon className="h-6 w-6" />
                        {item.label}
                      </Link>
                    );
                  })}

                  <div className="border-t border-border my-4"></div>

                  {isAuthenticated ? (
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full justify-start text-lg py-6 font-medium"
                      onClick={() => {
                        logoutMutation.mutate();
                        setMobileMenuOpen(false);
                      }}
                      data-testid="mobile-button-logout"
                    >
                      Sign Out
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      className="w-full text-lg py-6 bg-eth-brown hover:bg-eth-brown/90"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setAuthDialogOpen(true);
                      }}
                      data-testid="mobile-button-signin"
                    >
                      Sign In
                    </Button>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Navigation - Clean & Simple */}
          {!hideNavigation && (
            <nav className="hidden md:flex items-center space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path || location.startsWith(`${item.path}/`);
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`
                      flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium
                      ${isActive 
                        ? 'bg-eth-brown text-white shadow-md' 
                        : 'hover:bg-cream-100 text-eth-brown/80 hover:text-eth-brown'}
                    `}
                    data-testid={`link-${item.testId}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
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
                  <button className="flex items-center space-x-2 bg-cream-100 rounded-full p-2 pr-4 hover:bg-cream-200 transition-colors cursor-pointer">
                    <Avatar className="w-10 h-10 border-2 border-eth-brown/20">
                      <AvatarImage src={user?.profileImageUrl || ""} />
                      <AvatarFallback className="bg-eth-brown text-white font-semibold">
                        {user?.firstName?.[0]}{user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-eth-brown hidden lg:block">
                      {user?.firstName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="text-sm font-semibold text-eth-brown">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-gray-500 mt-1">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem asChild>
                    <Link href="/my-alga" className="cursor-pointer">My Alga</Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => logoutMutation.mutate()}
                    data-testid="button-logout"
                    className="text-red-600 cursor-pointer"
                  >
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button 
                size="lg"
                onClick={() => setAuthDialogOpen(true)}
                data-testid="button-signin-header"
                className="bg-eth-brown hover:bg-eth-brown/90 text-white px-6 py-6 rounded-xl shadow-md hover:shadow-lg transition-all"
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
