import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/header";
import PropertyCard from "@/components/property-card";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f6f2ec" }}>
        <Card className="max-w-md w-full mx-4" style={{ background: "#fff", borderColor: "#e5d9ce" }}>
          <CardContent className="p-8 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4" style={{ color: "#8a6e4b" }} />
            <h2 className="text-2xl font-bold mb-2" style={{ color: "#2d1405" }}>
              My Favorites
            </h2>
            <p className="text-base mb-6" style={{ color: "#5a4a42" }}>
              Please sign in to view your favorite properties
            </p>
            <Button 
              onClick={() => navigate("/login")}
              className="w-full text-lg py-6"
              style={{ background: "#2d1405" }}
              data-testid="button-signin"
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const { data: favorites, isLoading } = useQuery<any[]>({
    queryKey: ["/api/favorites"],
  });

  return (
    <div className="min-h-screen bg-[#D4C5B0] dark:bg-gray-900">
      <div className="flex">
        {/* Ethiopian Pattern Sidebar */}
        <div className="w-20 bg-gradient-to-b from-[#8B4513] to-[#654321] flex-shrink-0">
          <div className="h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTTAgMTBMMTAgMEwyMCAxMEwxMCAyMFoiIGZpbGw9InJnYmEoMjU1LDIxNSwwLDAuMSkiLz48cGF0aCBkPSJNMjAgMzBMMzAgMjBMNDAgMzBMMzAgNDBaIiBmaWxsPSJyZ2JhKDI1NSwyMTUsMCwwLjEpIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30"></div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <Header />
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="w-8 h-8 text-[#D2691E] dark:text-[#FFD700]" />
                <h1 className="text-4xl font-bold text-[#654321] dark:text-white">My Favorites</h1>
              </div>
              <p className="text-gray-700 dark:text-gray-300">
                Properties you've saved for later
              </p>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-96 bg-white/50 dark:bg-gray-800/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : favorites && favorites.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                {favorites.map((property: any) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <Heart className="w-24 h-24 text-gray-300 dark:text-gray-700 mx-auto mb-6" />
                <h2 className="text-2xl font-bold text-gray-600 dark:text-gray-400 mb-4">
                  No favorites yet
                </h2>
                <p className="text-gray-500 dark:text-gray-500 mb-8">
                  Start exploring properties and save your favorites!
                </p>
                <a
                  href="/properties"
                  data-testid="link-browse-properties"
                  className="inline-block bg-[#D2691E] hover:bg-[#B8571B] text-white px-8 py-3 rounded-lg font-semibold transition-colors"
                >
                  Browse Properties
                </a>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
