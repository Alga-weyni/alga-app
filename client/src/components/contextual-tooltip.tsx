// Contextual Tooltip - Auto-fading helper tips
import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContextualTooltipProps {
  message: string;
  emoji?: string;
  duration?: number; // milliseconds
  onDismiss?: () => void;
}

export function ContextualTooltip({ 
  message, 
  emoji = "💡", 
  duration = 5000,
  onDismiss 
}: ContextualTooltipProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Auto-fade after duration
    const timer = setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onDismiss]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-20 left-1/2 transform -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-300"
      role="alert"
      aria-live="polite"
    >
      <div
        className="flex items-center gap-3 px-6 py-4 rounded-2xl shadow-lg border-2 max-w-md"
        style={{ 
          background: "#fff", 
          borderColor: "#8a6e4b",
        }}
      >
        {/* Emoji Icon */}
        <span className="text-3xl flex-shrink-0" aria-hidden="true">{emoji}</span>

        {/* Message */}
        <p className="text-base font-medium flex-1" style={{ color: "#2d1405" }}>
          {message}
        </p>

        {/* Dismiss Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setVisible(false);
            onDismiss?.();
          }}
          className="flex-shrink-0 h-8 w-8 p-0"
          aria-label="Dismiss tooltip"
          role="button"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// Hook for managing tooltip visibility based on localStorage
export function useContextualTooltip(key: string) {
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(`tooltip-dismissed-${key}`);
    if (!dismissed) {
      setShowTooltip(true);
    }
  }, [key]);

  const handleDismiss = () => {
    localStorage.setItem(`tooltip-dismissed-${key}`, 'true');
    setShowTooltip(false);
  };

  return { showTooltip, handleDismiss };
}
