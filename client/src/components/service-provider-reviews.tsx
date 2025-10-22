import { useQuery } from "@tanstack/react-query";
import { Star, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import type { ServiceReview } from "@shared/schema";
import { format } from "date-fns";

interface ServiceProviderReviewsProps {
  providerId: number;
}

function RatingBar({ label, value, count }: { label: string; value: number; count: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground w-32">{label}</span>
      <Progress value={(value / 5) * 100} className="h-2 flex-1" />
      <span className="text-sm font-medium w-12 text-right">{value.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground w-12">({count})</span>
    </div>
  );
}

export default function ServiceProviderReviews({ providerId }: ServiceProviderReviewsProps) {
  const { data: reviews, isLoading } = useQuery<ServiceReview[]>({
    queryKey: ["/api/service-providers", providerId, "reviews"],
    queryFn: () => fetch(`/api/service-providers/${providerId}/reviews`).then((res) => res.json()),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-muted-foreground">
          <Star className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No reviews yet</p>
          <p className="text-sm">Be the first to review this service provider!</p>
        </CardContent>
      </Card>
    );
  }

  // Calculate averages
  const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
  const avgProfessionalism = reviews.filter(r => r.professionalism).reduce((sum, r) => sum + (r.professionalism || 0), 0) / reviews.filter(r => r.professionalism).length;
  const avgQuality = reviews.filter(r => r.quality).reduce((sum, r) => sum + (r.quality || 0), 0) / reviews.filter(r => r.quality).length;
  const avgTimeliness = reviews.filter(r => r.timeliness).reduce((sum, r) => sum + (r.timeliness || 0), 0) / reviews.filter(r => r.timeliness).length;
  const avgCommunication = reviews.filter(r => r.communication).reduce((sum, r) => sum + (r.communication || 0), 0) / reviews.filter(r => r.communication).length;
  const avgValue = reviews.filter(r => r.value).reduce((sum, r) => sum + (r.value || 0), 0) / reviews.filter(r => r.value).length;

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-eth-brown">{avgRating.toFixed(1)}</div>
              <div className="flex justify-center my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(avgRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">{reviews.length} reviews</p>
            </div>

            <div className="flex-1 space-y-2">
              <RatingBar label="Professionalism" value={avgProfessionalism || 0} count={reviews.filter(r => r.professionalism).length} />
              <RatingBar label="Quality" value={avgQuality || 0} count={reviews.filter(r => r.quality).length} />
              <RatingBar label="Timeliness" value={avgTimeliness || 0} count={reviews.filter(r => r.timeliness).length} />
              <RatingBar label="Communication" value={avgCommunication || 0} count={reviews.filter(r => r.communication).length} />
              <RatingBar label="Value" value={avgValue || 0} count={reviews.filter(r => r.value).length} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Individual Reviews */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Customer Reviews</h3>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-eth-brown/10 flex items-center justify-center flex-shrink-0">
                  <User className="w-5 h-5 text-eth-brown" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < review.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm font-semibold">{review.rating}.0</span>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(review.createdAt), "MMM d, yyyy")}
                    </span>
                  </div>

                  {review.comment && (
                    <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
                  )}

                  {/* Detailed ratings */}
                  {(review.professionalism || review.quality || review.timeliness || review.communication || review.value) && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 pt-4 border-t">
                      {review.professionalism && (
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Professionalism</p>
                          <p className="font-medium">{review.professionalism}.0 ★</p>
                        </div>
                      )}
                      {review.quality && (
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Quality</p>
                          <p className="font-medium">{review.quality}.0 ★</p>
                        </div>
                      )}
                      {review.timeliness && (
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Timeliness</p>
                          <p className="font-medium">{review.timeliness}.0 ★</p>
                        </div>
                      )}
                      {review.communication && (
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Communication</p>
                          <p className="font-medium">{review.communication}.0 ★</p>
                        </div>
                      )}
                      {review.value && (
                        <div className="text-xs">
                          <p className="text-muted-foreground mb-1">Value</p>
                          <p className="font-medium">{review.value}.0 ★</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
