import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/api-config";
import type { ServiceBooking } from "@shared/schema";

interface ServiceReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: ServiceBooking;
}

interface RatingCategoryProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function RatingCategory({ label, value, onChange }: RatingCategoryProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
            data-testid={`rating-${label.toLowerCase()}-${star}`}
          >
            <Star
              className={`w-6 h-6 ${
                star <= value
                  ? "fill-amber-400 text-amber-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ServiceReviewForm({
  open,
  onOpenChange,
  booking,
}: ServiceReviewFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [rating, setRating] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [quality, setQuality] = useState(5);
  const [timeliness, setTimeliness] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [value, setValue] = useState(5);
  const [comment, setComment] = useState("");

  const submitReviewMutation = useMutation({
    mutationFn: async (reviewData: any) => {
      return await apiRequest("POST", "/api/service-reviews", reviewData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-service-bookings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/service-providers", booking.serviceProviderId] });
      toast({
        title: "Review submitted",
        description: "Thank you for your feedback!",
      });
      onOpenChange(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Failed to submit review",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setRating(5);
    setProfessionalism(5);
    setQuality(5);
    setTimeliness(5);
    setCommunication(5);
    setValue(5);
    setComment("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    submitReviewMutation.mutate({
      serviceBookingId: booking.id,
      serviceProviderId: booking.serviceProviderId,
      rating,
      professionalism,
      quality,
      timeliness,
      communication,
      value,
      comment: comment.trim() || null,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review Service</DialogTitle>
          <DialogDescription>
            Share your experience to help others make informed decisions
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Overall Rating */}
          <div className="space-y-2">
            <Label className="text-base font-semibold">Overall Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  data-testid={`rating-overall-${star}`}
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Ratings */}
          <div className="space-y-4 border-t pt-4">
            <h3 className="text-sm font-semibold text-muted-foreground">
              Detailed Ratings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RatingCategory
                label="Professionalism"
                value={professionalism}
                onChange={setProfessionalism}
              />
              <RatingCategory
                label="Quality"
                value={quality}
                onChange={setQuality}
              />
              <RatingCategory
                label="Timeliness"
                value={timeliness}
                onChange={setTimeliness}
              />
              <RatingCategory
                label="Communication"
                value={communication}
                onChange={setCommunication}
              />
              <RatingCategory
                label="Value for Money"
                value={value}
                onChange={setValue}
              />
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-2">
            <Label htmlFor="comment">Your Review (Optional)</Label>
            <Textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience with this service provider..."
              rows={4}
              className="resize-none"
              data-testid="input-review-comment"
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              data-testid="button-cancel-review"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitReviewMutation.isPending}
              data-testid="button-submit-review"
            >
              {submitReviewMutation.isPending ? "Submitting..." : "Submit Review"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
