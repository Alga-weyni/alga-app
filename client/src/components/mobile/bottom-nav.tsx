import { useLocation } from "wouter";
import { Home, Wrench, User, HelpCircle } from "lucide-react";

interface NavItem {
  path: string;
  icon: React.ElementType;
  label: string;
  testId: string;
}

export default function BottomNav() {
  const [location, setLocation] = useLocation();

  const navItems: NavItem[] = [
    { path: "/properties", icon: Home, label: "Stays", testId: "stays" },
    { path: "/services", icon: Wrench, label: "Services", testId: "services" },
    { path: "/my-alga", icon: User, label: "Me", testId: "me" },
    { path: "/support", icon: HelpCircle, label: "Help", testId: "help" },
  ];

  const isActive = (path: string) => {
    return location === path || location.startsWith(`${path}/`);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E5D9C8] safe-area-inset-bottom z-50"
      style={{
        boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.05)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      data-testid="bottom-nav"
    >
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <button
              key={item.path}
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center justify-center w-20 h-full transition-all relative ${
                active ? "text-[#3C2313]" : "text-[#9CA3AF]"
              }`}
              data-testid={`mobile-nav-${item.testId}`}
            >
              <Icon
                className={`w-6 h-6 transition-all ${
                  active ? "scale-110" : "scale-100"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              <span
                className={`text-[10px] mt-1 font-medium ${
                  active ? "opacity-100" : "opacity-60"
                }`}
              >
                {item.label}
              </span>
              {active && (
                <div className="absolute top-0 w-12 h-1 bg-[#3C2313] rounded-b-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
