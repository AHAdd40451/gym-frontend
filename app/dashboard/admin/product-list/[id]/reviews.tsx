import { StarIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateAvatarFallback } from "@/lib/utils";
import { getProductReviews } from "@/lib/api/services/review/review";
import { formatDistanceToNow } from "date-fns";

interface ProductReviewListProps {
  productId: string;
}

export default async function ProductReviewList({ productId }: ProductReviewListProps) {
  const reviewsResult = await getProductReviews(productId);
  const reviewsData = reviewsResult?.data || reviewsResult;
  const reviews = reviewsData?.reviews || [];

  if (reviews.length === 0) {
    return (
      <div className="text-center p-8 text-muted-foreground">
        <p>No reviews yet for this product.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review._id} className="grid gap-4 rounded-lg border p-4">
          <div className="flex items-start gap-4">
            <Avatar className="size-10">
              <AvatarImage src={`/images/avatars/0${(review.name.charCodeAt(0) % 10) + 1}.png`} />
              <AvatarFallback>{generateAvatarFallback(review.name)}</AvatarFallback>
            </Avatar>
            <div className="grid grow gap-1">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{review.name}</div>
                <div className="text-muted-foreground text-xs">
                  {formatDistanceToNow(new Date(review.createdAt), { addSuffix: true })}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  <div className="flex items-center gap-1">
                    <StarIcon className="size-4 fill-orange-400 stroke-orange-400" />
                    <div className="text-muted-foreground text-sm">{review.rating}</div>
                  </div>
                </Badge>
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <div className="font-semibold">{review.title}</div>
            <div className="text-muted-foreground text-sm">{review.comment}</div>
          </div>
        </div>
      ))}
    </div>
  );
}