import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import BottomNav from "./bottom-nav";
import { LemlemChat } from "@/components/lemlem-chat";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export default function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("GET", "/api/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      navigate("/login");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-[#f9e9d8] pb-16">
      {/* Mobile Header - With Logout */}
      <header className="bg-[#F8F1E7] shadow-sm sticky top-0 z-40 border-b border-[#E5D9C8] safe-area-inset-top">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="w-10" /> {/* Spacer for centering */}
          <h1 className="text-xl font-bold text-eth-brown">Alga</h1>
          
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-10 w-10 rounded-full p-0"
                  data-testid="button-user-menu"
                >
                  <User className="h-5 w-5 text-eth-brown" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5 text-sm font-medium text-eth-brown">
                  {user?.firstName || user?.email || "User"}
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => navigate("/profile")}
                  className="cursor-pointer"
                  data-testid="menu-item-profile"
                >
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                  data-testid="menu-item-logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/login")}
              className="text-eth-brown"
              data-testid="button-login"
            >
              Login
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className={showBottomNav ? "pb-4" : ""}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && <BottomNav />}

      {/* Lemlem Chat - Mobile positioned */}
      <LemlemChat propertyId={undefined} bookingId={undefined} />
    </div>
  );
}
