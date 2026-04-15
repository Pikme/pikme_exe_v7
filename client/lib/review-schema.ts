/**
 * Review and Rating Schema Utilities for Rich Snippets
 * Generates JSON-LD schemas for reviews and ratings to enable rich snippets in search results
 */

export interface ReviewRating {
  "@context": "https://schema.org";
  "@type": "Review" | "AggregateRating";
  ratingValue: number; // 0-5
  bestRating?: number;
  worstRating?: number;
  ratingCount?: number;
  reviewCount?: number;
}

export interface Author {
  "@type": "Person";
  name: string;
  url?: string;
}

export interface Review {
  "@context": "https://schema.org";
  "@type": "Review";
  reviewRating: {
    "@type": "Rating";
    ratingValue: number;
    bestRating?: number;
    worstRating?: number;
  };
  author?: Author;
  reviewBody: string;
  datePublished?: string;
  name?: string;
  reviewAspect?: string;
}

export interface AggregateRating {
  "@context": "https://schema.org";
  "@type": "AggregateRating";
  ratingValue: number;
  bestRating?: number;
  worstRating?: number;
  ratingCount: number;
  reviewCount?: number;
}

export interface TourWithRating {
  "@context": "https://schema.org";
  "@type": "Product" | "LocalBusiness" | "TouristAttraction";
  name: string;
  description?: string;
  url: string;
  image?: string | string[];
  aggregateRating?: AggregateRating;
  review?: Review[];
}

/**
 * Generate single review schema
 */
export function generateReviewSchema(
  reviewBody: string,
  ratingValue: number,
  authorName?: string,
  datePublished?: string,
  reviewName?: string
): Review {
  // Validate rating
  if (ratingValue < 0 || ratingValue > 5) {
    console.warn("Rating value must be between 0 and 5");
  }

  return {
    "@context": "https://schema.org",
    "@type": "Review",
    reviewRating: {
      "@type": "Rating",
      ratingValue: Math.min(5, Math.max(0, ratingValue)),
      bestRating: 5,
      worstRating: 0,
    },
    ...(authorName && {
      author: {
        "@type": "Person",
        name: authorName,
      },
    }),
    reviewBody,
    ...(datePublished && { datePublished }),
    ...(reviewName && { name: reviewName }),
  };
}

/**
 * Generate aggregate rating schema
 */
export function generateAggregateRatingSchema(
  ratingValue: number,
  ratingCount: number,
  reviewCount?: number
): AggregateRating {
  // Validate rating
  if (ratingValue < 0 || ratingValue > 5) {
    console.warn("Rating value must be between 0 and 5");
  }

  if (ratingCount < 1) {
    console.warn("Rating count must be at least 1");
  }

  return {
    "@context": "https://schema.org",
    "@type": "AggregateRating",
    ratingValue: Math.min(5, Math.max(0, ratingValue)),
    bestRating: 5,
    worstRating: 0,
    ratingCount: Math.max(1, ratingCount),
    ...(reviewCount && { reviewCount }),
  };
}

/**
 * Generate tour with aggregate rating schema
 */
export function generateTourWithRatingSchema(
  name: string,
  url: string,
  ratingValue: number,
  ratingCount: number,
  options?: {
    description?: string;
    image?: string | string[];
    reviews?: Review[];
    reviewCount?: number;
  }
): TourWithRating {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    url,
    ...(options?.description && { description: options.description }),
    ...(options?.image && { image: options.image }),
    aggregateRating: generateAggregateRatingSchema(ratingValue, ratingCount, options?.reviewCount),
    ...(options?.reviews && options.reviews.length > 0 && { review: options.reviews }),
  };
}

/**
 * Generate multiple reviews schema
 */
export function generateMultipleReviewsSchema(
  reviews: Array<{
    body: string;
    rating: number;
    author?: string;
    date?: string;
    name?: string;
  }>
): Review[] {
  return reviews.map((review) =>
    generateReviewSchema(review.body, review.rating, review.author, review.date, review.name)
  );
}

/**
 * Calculate average rating from reviews
 */
export function calculateAverageRating(ratings: number[]): number {
  if (ratings.length === 0) return 0;
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return Math.round((sum / ratings.length) * 10) / 10; // Round to 1 decimal
}

/**
 * Generate rating distribution
 */
export function generateRatingDistribution(
  ratings: number[]
): Record<number, number> {
  const distribution: Record<number, number> = {
    5: 0,
    4: 0,
    3: 0,
    2: 0,
    1: 0,
  };

  ratings.forEach((rating) => {
    const rounded = Math.round(rating);
    if (rounded >= 1 && rounded <= 5) {
      distribution[rounded]++;
    }
  });

  return distribution;
}

/**
 * Generate rating badge text
 */
export function getRatingBadgeText(ratingValue: number, ratingCount: number): string {
  if (ratingCount === 0) return "No ratings";
  if (ratingCount === 1) return `${ratingValue} ★ (1 review)`;
  return `${ratingValue} ★ (${ratingCount} reviews)`;
}

/**
 * Get rating color based on value
 */
export function getRatingColor(ratingValue: number): string {
  if (ratingValue >= 4.5) return "text-green-600"; // Excellent
  if (ratingValue >= 4) return "text-green-500"; // Very Good
  if (ratingValue >= 3.5) return "text-yellow-500"; // Good
  if (ratingValue >= 3) return "text-yellow-600"; // Average
  if (ratingValue >= 2) return "text-orange-600"; // Poor
  return "text-red-600"; // Very Poor
}

/**
 * Get rating category
 */
export function getRatingCategory(ratingValue: number): string {
  if (ratingValue >= 4.5) return "Excellent";
  if (ratingValue >= 4) return "Very Good";
  if (ratingValue >= 3.5) return "Good";
  if (ratingValue >= 3) return "Average";
  if (ratingValue >= 2) return "Poor";
  return "Very Poor";
}

/**
 * Validate review schema
 */
export function validateReviewSchema(review: Review): string[] {
  const issues: string[] = [];

  // Check required fields
  if (!review.reviewBody || review.reviewBody.trim().length === 0) {
    issues.push("Review body is required");
  }

  if (!review.reviewRating || review.reviewRating.ratingValue === undefined) {
    issues.push("Rating value is required");
  }

  // Check rating range
  if (review.reviewRating && (review.reviewRating.ratingValue < 0 || review.reviewRating.ratingValue > 5)) {
    issues.push("Rating value must be between 0 and 5");
  }

  // Check author
  if (review.author && !review.author.name) {
    issues.push("Author name is required if author is provided");
  }

  // Check date format (ISO 8601)
  if (review.datePublished && !isValidISODate(review.datePublished)) {
    issues.push("Date must be in ISO 8601 format");
  }

  return issues;
}

/**
 * Validate aggregate rating schema
 */
export function validateAggregateRatingSchema(rating: AggregateRating): string[] {
  const issues: string[] = [];

  if (rating.ratingValue < 0 || rating.ratingValue > 5) {
    issues.push("Rating value must be between 0 and 5");
  }

  if (rating.ratingCount < 1) {
    issues.push("Rating count must be at least 1");
  }

  if (rating.reviewCount !== undefined && rating.reviewCount < 0) {
    issues.push("Review count cannot be negative");
  }

  return issues;
}

/**
 * Check if date is valid ISO 8601 format
 */
function isValidISODate(dateString: string): boolean {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  } catch {
    return false;
  }
}

/**
 * Format rating for display
 */
export function formatRating(ratingValue: number, decimals: number = 1): string {
  return ratingValue.toFixed(decimals);
}

/**
 * Generate star rating HTML
 */
export function generateStarRating(ratingValue: number, maxRating: number = 5): string {
  const fullStars = Math.floor(ratingValue);
  const hasHalfStar = ratingValue % 1 >= 0.5;
  const emptyStars = maxRating - fullStars - (hasHalfStar ? 1 : 0);

  let stars = "★".repeat(fullStars);
  if (hasHalfStar) stars += "½";
  stars += "☆".repeat(emptyStars);

  return stars;
}

/**
 * Generate review summary
 */
export function generateReviewSummary(
  reviews: Review[]
): {
  averageRating: number;
  totalReviews: number;
  distribution: Record<number, number>;
} {
  const ratings = reviews
    .map((r) => r.reviewRating.ratingValue)
    .filter((r) => r !== undefined);

  return {
    averageRating: calculateAverageRating(ratings),
    totalReviews: reviews.length,
    distribution: generateRatingDistribution(ratings),
  };
}

/**
 * Convert review schema to JSON-LD string
 */
export function reviewToJsonLd(review: Review | AggregateRating | TourWithRating): string {
  return JSON.stringify(review, null, 2);
}

/**
 * Generate multiple review schemas in @graph format
 */
export function generateReviewGraph(
  tourName: string,
  tourUrl: string,
  aggregateRating: AggregateRating,
  reviews: Review[]
): {
  "@context": "https://schema.org";
  "@graph": Array<TourWithRating | Review>;
} {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@context": "https://schema.org",
        "@type": "Product",
        name: tourName,
        url: tourUrl,
        aggregateRating,
        review: reviews,
      },
      ...reviews,
    ],
  };
}

/**
 * Get rating percentile
 */
export function getRatingPercentile(ratingValue: number, allRatings: number[]): number {
  const belowRating = allRatings.filter((r) => r < ratingValue).length;
  return Math.round((belowRating / allRatings.length) * 100);
}

/**
 * Generate rating comparison
 */
export function generateRatingComparison(
  tourRating: number,
  categoryAverageRating: number
): {
  isAboveAverage: boolean;
  difference: number;
  percentageDifference: number;
} {
  const difference = tourRating - categoryAverageRating;
  const percentageDifference = (difference / categoryAverageRating) * 100;

  return {
    isAboveAverage: difference > 0,
    difference: Math.round(difference * 10) / 10,
    percentageDifference: Math.round(percentageDifference * 10) / 10,
  };
}

/**
 * Filter reviews by rating
 */
export function filterReviewsByRating(reviews: Review[], minRating: number, maxRating: number = 5): Review[] {
  return reviews.filter(
    (review) =>
      review.reviewRating.ratingValue >= minRating && review.reviewRating.ratingValue <= maxRating
  );
}

/**
 * Sort reviews by rating (descending)
 */
export function sortReviewsByRating(reviews: Review[], descending: boolean = true): Review[] {
  return [...reviews].sort((a, b) => {
    const diff = b.reviewRating.ratingValue - a.reviewRating.ratingValue;
    return descending ? diff : -diff;
  });
}

/**
 * Sort reviews by date (newest first)
 */
export function sortReviewsByDate(reviews: Review[], newestFirst: boolean = true): Review[] {
  return [...reviews].sort((a, b) => {
    const dateA = a.datePublished ? new Date(a.datePublished).getTime() : 0;
    const dateB = b.datePublished ? new Date(b.datePublished).getTime() : 0;
    return newestFirst ? dateB - dateA : dateA - dateB;
  });
}

/**
 * Get helpful reviews (high rating or recent)
 */
export function getHelpfulReviews(reviews: Review[], limit: number = 5): Review[] {
  const sorted = sortReviewsByRating(sortReviewsByDate(reviews));
  return sorted.slice(0, limit);
}

/**
 * Generate review excerpt
 */
export function generateReviewExcerpt(reviewBody: string, maxLength: number = 150): string {
  if (reviewBody.length <= maxLength) return reviewBody;
  return reviewBody.substring(0, maxLength).trim() + "...";
}
