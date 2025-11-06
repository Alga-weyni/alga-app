import { ReactNode } from "react";
import BottomNav from "./bottom-nav";
import { LemlemChat } from "@/components/lemlem-chat";

interface MobileLayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export default function MobileLayout({ children, showBottomNav = true }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f9e9d8] pb-16">
      {/* Mobile Header - Minimal */}
      <header className="bg-[#F8F1E7] shadow-sm sticky top-0 z-40 border-b border-[#E5D9C8] safe-area-inset-top">
        <div className="flex items-center justify-center h-14 px-4">
          <h1 className="text-xl font-bold text-eth-brown">Alga</h1>
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
