import { useState, useEffect } from "react";
import { Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function DevMobileToggle() {
  const [forceMobile, setForceMobile] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("dev-force-mobile");
    if (stored === "true") {
      setForceMobile(true);
    }
  }, []);

  const toggleMode = () => {
    const newMode = !forceMobile;
    setForceMobile(newMode);
    localStorage.setItem("dev-force-mobile", String(newMode));
    window.location.reload();
  };

  return (
    <div className="fixed top-4 left-4 z-[100]">
      <Button
        onClick={toggleMode}
        size="sm"
        variant={forceMobile ? "default" : "outline"}
        className={`gap-2 shadow-lg ${
          forceMobile
            ? "bg-blue-600 hover:bg-blue-700 text-white"
            : "bg-white hover:bg-gray-100"
        }`}
        data-testid="button-dev-toggle-mobile"
      >
        {forceMobile ? (
          <>
            <Smartphone className="h-4 w-4" />
            <span className="text-xs font-semibold">Mobile Mode</span>
          </>
        ) : (
          <>
            <Monitor className="h-4 w-4" />
            <span className="text-xs font-semibold">Web Mode</span>
          </>
        )}
      </Button>
      <p className="text-[10px] text-gray-500 mt-1 text-center">
        {forceMobile ? "Testing mobile UI" : "Click to preview mobile"}
      </p>
    </div>
  );
}
