import { CheckCircle, Star, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ServiceProvider } from "@shared/schema";

interface ProviderBadgeProps {
  provider: ServiceProvider;
  size?: "sm" | "md" | "lg";
}

export default function ProviderBadge({ provider, size = "md" }: ProviderBadgeProps) {
  const badges = [];
  
  // Verified Badge
  if (provider.verificationStatus === "approved") {
    badges.push({
      icon: <CheckCircle className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
      label: "Verified",
      color: "bg-green-100 text-green-700 hover:bg-green-100",
      tooltip: "ID verified by Alga",
    });
  }

  // Top Rated Badge (4.5+ rating)
  const rating = parseFloat(provider.rating || "0");
  if (rating >= 4.5) {
    badges.push({
      icon: <Star className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
      label: "Top Rated",
      color: "bg-amber-100 text-amber-700 hover:bg-amber-100",
      tooltip: `${rating.toFixed(1)} stars - Highly rated provider`,
    });
  }

  // Quick Response Badge (5+ completed jobs)
  if ((provider.totalJobsCompleted || 0) >= 5) {
    badges.push({
      icon: <Zap className={size === "sm" ? "w-3 h-3" : "w-4 h-4"} />,
      label: "Experienced",
      color: "bg-blue-100 text-blue-700 hover:bg-blue-100",
      tooltip: `${provider.totalJobsCompleted} jobs completed`,
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <Tooltip key={index}>
          <TooltipTrigger asChild>
            <Badge 
              variant="secondary" 
              className={`${badge.color} ${size === "sm" ? "text-xs px-2 py-0.5" : "px-3 py-1"}`}
              data-testid={`badge-${badge.label.toLowerCase().replace(" ", "-")}`}
            >
              <span className="flex items-center gap-1">
                {badge.icon}
                <span>{badge.label}</span>
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p>{badge.tooltip}</p>
          </TooltipContent>
        </Tooltip>
      ))}
    </div>
  );
}
