import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { Skeleton } from '@/components/ui/skeleton';

interface ReviewListProps {
  tourId: number;
}

export function ReviewList({ tourId }: ReviewListProps) {
  const [page, setPage] = useState(0);
  const REVIEWS_PER_PAGE = 10;

  const { data: reviewsData, isLoading } = trpc.reviews.getByTour.useQuery({
    tourId,
    limit: REVIEWS_PER_PAGE,
    offset: page * REVIEWS_PER_PAGE,
  });

  const { data: ratingData } = trpc.reviews.getAverageRating.useQuery({
    tourId,
  });

  const markHelpfulMutation = trpc.reviews.markHelpful.useMutation();
  const markUnhelpfulMutation = trpc.reviews.markUnhelpful.useMutation();

  const handleHelpful = (reviewId: number) => {
    markHelpfulMutation.mutate({ reviewId });
  };

  const handleUnhelpful = (reviewId: number) => {
    markUnhelpfulMutation.mutate({ reviewId });
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {ratingData && ratingData.totalReviews > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Guest Reviews</CardTitle>
            <CardDescription>Based on {ratingData.totalReviews} verified reviews</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{ratingData.averageRating}</div>
              <div className="space-y-2">
                {renderStars(Math.round(ratingData.averageRating))}
                <p className="text-sm text-gray-600">{ratingData.totalReviews} reviews</p>
              </div>
            </div>

            {/* Rating Distribution */}
            {ratingData.ratingDistribution && (
              <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((rating) => {
                  const count = ratingData.ratingDistribution[rating] || 0;
                  const percentage =
                    ratingData.totalReviews > 0
                      ? Math.round((count / ratingData.totalReviews) * 100)
                      : 0;

                  return (
                    <div key={rating} className="flex items-center gap-2">
                      <span className="w-12 text-sm">{rating} stars</span>
                      <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="w-12 text-right text-sm text-gray-600">{percentage}%</span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {reviewsData?.reviews.length === 0 ? 'No reviews yet' : 'Guest Reviews'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : reviewsData?.reviews && reviewsData.reviews.length > 0 ? (
            <>
              {reviewsData.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4 last:border-b-0">
                  {/* Review Header */}
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {renderStars(review.rating)}
                        {review.verified && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold">{review.title || 'No title'}</h4>
                      <p className="text-sm text-gray-600">
                        by {review.guestName} •{' '}
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Review Text */}
                  {review.text && <p className="text-gray-700 mb-3">{review.text}</p>}

                  {/* Helpful/Unhelpful */}
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleHelpful(review.id)}
                      className="text-gray-600 hover:text-green-600"
                    >
                      <ThumbsUp size={16} className="mr-1" />
                      Helpful ({review.helpful})
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnhelpful(review.id)}
                      className="text-gray-600 hover:text-red-600"
                    >
                      <ThumbsDown size={16} className="mr-1" />
                      Not Helpful ({review.unhelpful})
                    </Button>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {reviewsData.total > REVIEWS_PER_PAGE && (
                <div className="flex gap-2 justify-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => setPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4">
                    Page {page + 1} of {Math.ceil(reviewsData.total / REVIEWS_PER_PAGE)}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setPage(
                        Math.min(
                          Math.ceil(reviewsData.total / REVIEWS_PER_PAGE) - 1,
                          page + 1
                        )
                      )
                    }
                    disabled={page >= Math.ceil(reviewsData.total / REVIEWS_PER_PAGE) - 1}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-600">
              No reviews yet. Be the first to share your experience!
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
