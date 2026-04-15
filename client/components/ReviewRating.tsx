import { useEffect } from "react";
import type { Review, AggregateRating, TourWithRating } from "@/lib/review-schema";
import {
  generateReviewSchema,
  generateAggregateRatingSchema,
  generateTourWithRatingSchema,
  getRatingColor,
  getRatingCategory,
  getRatingBadgeText,
  generateStarRating,
  formatRating,
  generateReviewSummary,
  reviewToJsonLd,
} from "@/lib/review-schema";

interface ReviewSchemaProps {
  review: Review;
}

/**
 * ReviewSchema Component
 * Injects review schema into page head for rich snippets
 */
export function ReviewSchema({ review }: ReviewSchemaProps) {
  useEffect(() => {
    // Create script element
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = reviewToJsonLd(review);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [review]);

  return null;
}

interface AggregateRatingSchemaProps {
  aggregateRating: AggregateRating;
}

/**
 * AggregateRatingSchema Component
 * Injects aggregate rating schema for rich snippets
 */
export function AggregateRatingSchema({ aggregateRating }: AggregateRatingSchemaProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = reviewToJsonLd(aggregateRating);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [aggregateRating]);

  return null;
}

interface TourWithRatingSchemaProps {
  tourSchema: TourWithRating;
}

/**
 * TourWithRatingSchema Component
 * Injects complete tour schema with ratings for rich snippets
 */
export function TourWithRatingSchema({ tourSchema }: TourWithRatingSchemaProps) {
  useEffect(() => {
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.textContent = reviewToJsonLd(tourSchema);
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, [tourSchema]);

  return null;
}

interface RatingDisplayProps {
  ratingValue: number;
  ratingCount: number;
  className?: string;
  showCategory?: boolean;
}

/**
 * RatingDisplay Component
 * Shows rating value and count with visual styling
 */
export function RatingDisplay({
  ratingValue,
  ratingCount,
  className = "",
  showCategory = true,
}: RatingDisplayProps) {
  const color = getRatingColor(ratingValue);
  const category = getRatingCategory(ratingValue);
  const badgeText = getRatingBadgeText(ratingValue, ratingCount);

  return (
    <div className={`rating-display flex items-center gap-2 ${className}`}>
      <div className={`text-2xl font-bold ${color}`}>{formatRating(ratingValue)}</div>
      <div className="flex flex-col">
        <div className="text-sm text-gray-600">{badgeText}</div>
        {showCategory && <div className="text-xs text-gray-500">{category}</div>}
      </div>
    </div>
  );
}

interface StarRatingProps {
  ratingValue: number;
  maxRating?: number;
  className?: string;
}

/**
 * StarRating Component
 * Shows rating as star symbols
 */
export function StarRating({ ratingValue, maxRating = 5, className = "" }: StarRatingProps) {
  const stars = generateStarRating(ratingValue, maxRating);

  return (
    <div className={`star-rating text-lg font-semibold ${className}`}>
      {stars}
    </div>
  );
}

interface ReviewCardProps {
  review: Review;
  className?: string;
}

/**
 * ReviewCard Component
 * Displays individual review with rating and author
 */
export function ReviewCard({ review, className = "" }: ReviewCardProps) {
  const authorName = review.author?.name || "Anonymous";
  const rating = review.reviewRating.ratingValue;

  return (
    <div className={`review-card p-4 border rounded-lg bg-white ${className}`}>
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-semibold text-sm">{authorName}</div>
          {review.datePublished && (
            <div className="text-xs text-gray-500">
              {new Date(review.datePublished).toLocaleDateString()}
            </div>
          )}
        </div>
        <div className="text-right">
          <StarRating ratingValue={rating} />
          <div className="text-xs text-gray-600">{formatRating(rating)}/5</div>
        </div>
      </div>
      {review.name && <div className="font-medium text-sm mb-2">{review.name}</div>}
      <p className="text-sm text-gray-700">{review.reviewBody}</p>
    </div>
  );
}

interface ReviewListProps {
  reviews: Review[];
  maxReviews?: number;
  className?: string;
}

/**
 * ReviewList Component
 * Displays multiple reviews
 */
export function ReviewList({ reviews, maxReviews = 5, className = "" }: ReviewListProps) {
  const displayedReviews = reviews.slice(0, maxReviews);

  return (
    <div className={`review-list space-y-3 ${className}`}>
      {displayedReviews.map((review, index) => (
        <ReviewCard key={index} review={review} />
      ))}
    </div>
  );
}

interface RatingDistributionProps {
  reviews: Review[];
  className?: string;
}

/**
 * RatingDistribution Component
 * Shows distribution of ratings (5 stars, 4 stars, etc.)
 */
export function RatingDistribution({ reviews, className = "" }: RatingDistributionProps) {
  const summary = generateReviewSummary(reviews);
  const { distribution } = summary;

  return (
    <div className={`rating-distribution space-y-2 ${className}`}>
      {[5, 4, 3, 2, 1].map((stars) => {
        const count = distribution[stars] || 0;
        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

        return (
          <div key={stars} className="flex items-center gap-2">
            <div className="w-12 text-sm font-medium">{stars} ★</div>
            <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className="h-full bg-yellow-400"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="w-12 text-right text-sm text-gray-600">{count}</div>
          </div>
        );
      })}
    </div>
  );
}

interface RatingSummaryProps {
  reviews: Review[];
  className?: string;
}

/**
 * RatingSummary Component
 * Shows overall rating summary from reviews
 */
export function RatingSummary({ reviews, className = "" }: RatingSummaryProps) {
  const summary = generateReviewSummary(reviews);

  return (
    <div className={`rating-summary space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <div className="text-4xl font-bold">{formatRating(summary.averageRating)}</div>
        <div>
          <StarRating ratingValue={summary.averageRating} />
          <div className="text-sm text-gray-600">
            Based on {summary.totalReviews} {summary.totalReviews === 1 ? "review" : "reviews"}
          </div>
        </div>
      </div>
      <RatingDistribution reviews={reviews} />
    </div>
  );
}

interface RatingBadgeProps {
  ratingValue: number;
  ratingCount: number;
  compact?: boolean;
  className?: string;
}

/**
 * RatingBadge Component
 * Compact rating display badge
 */
export function RatingBadge({
  ratingValue,
  ratingCount,
  compact = false,
  className = "",
}: RatingBadgeProps) {
  const color = getRatingColor(ratingValue);

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-yellow-50 ${color} ${className}`}
      >
        <span>★</span>
        <span>{formatRating(ratingValue)}</span>
        <span className="text-gray-600">({ratingCount})</span>
      </div>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-50 ${className}`}
    >
      <div className={`text-lg font-bold ${color}`}>{formatRating(ratingValue)}</div>
      <div className="flex flex-col text-sm">
        <StarRating ratingValue={ratingValue} />
        <div className="text-xs text-gray-600">{ratingCount} reviews</div>
      </div>
    </div>
  );
}

interface ReviewFormProps {
  onSubmit: (review: { body: string; rating: number; author: string }) => void;
  className?: string;
}

/**
 * ReviewForm Component
 * Form for submitting new reviews
 */
export function ReviewForm({ onSubmit, className = "" }: ReviewFormProps) {
  const [rating, setRating] = React.useState(5);
  const [body, setBody] = React.useState("");
  const [author, setAuthor] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (body.trim() && author.trim()) {
      onSubmit({ body, rating, author });
      setBody("");
      setAuthor("");
      setRating(5);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`review-form space-y-4 ${className}`}>
      <div>
        <label className="block text-sm font-medium mb-2">Your Rating</label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Name</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Enter your name"
          className="w-full px-3 py-2 border rounded-lg text-sm"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Your Review</label>
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Share your experience..."
          rows={4}
          className="w-full px-3 py-2 border rounded-lg text-sm"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
      >
        Submit Review
      </button>
    </form>
  );
}

interface RatingStarsProps {
  value: number;
  onChange?: (value: number) => void;
  interactive?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * RatingStars Component
 * Interactive star rating selector
 */
export function RatingStars({
  value,
  onChange,
  interactive = false,
  size = "md",
  className = "",
}: RatingStarsProps) {
  const sizeClass = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
  }[size];

  return (
    <div className={`rating-stars flex gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => interactive && onChange?.(star)}
          className={`${sizeClass} ${
            star <= value ? "text-yellow-400" : "text-gray-300"
          } ${interactive ? "cursor-pointer hover:text-yellow-300" : ""}`}
          disabled={!interactive}
        >
          ★
        </button>
      ))}
    </div>
  );
}

// Add React import for ReviewForm
import React from "react";
