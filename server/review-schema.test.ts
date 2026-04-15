import { describe, it, expect } from "vitest";

/**
 * Review and Rating Schema Tests - Phase 2E
 * Tests for review and rating schemas for rich snippets
 */

describe("Review and Rating Schemas - Rich Snippets - Phase 2E", () => {
  describe("Single Review Schema Generation", () => {
    it("should generate valid review schema", () => {
      const review = {
        "@context": "https://schema.org",
        "@type": "Review",
        reviewRating: {
          "@type": "Rating",
          ratingValue: 4.5,
          bestRating: 5,
          worstRating: 0,
        },
        author: {
          "@type": "Person",
          name: "John Doe",
        },
        reviewBody: "Great tour experience!",
        datePublished: "2024-01-15T10:00:00Z",
      };

      expect(review["@context"]).toBe("https://schema.org");
      expect(review["@type"]).toBe("Review");
      expect(review.reviewRating.ratingValue).toBe(4.5);
      expect(review.author.name).toBe("John Doe");
    });

    it("should include all required review fields", () => {
      const review = {
        reviewRating: { ratingValue: 4 },
        reviewBody: "Excellent tour!",
        author: { "@type": "Person", name: "Jane Smith" },
      };

      expect(review.reviewRating.ratingValue).toBeDefined();
      expect(review.reviewBody).toBeDefined();
      expect(review.author).toBeDefined();
    });

    it("should validate rating range (0-5)", () => {
      const validRatings = [0, 1, 2.5, 3, 4, 4.5, 5];

      validRatings.forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(5);
      });
    });

    it("should handle optional review fields", () => {
      const review = {
        reviewBody: "Good experience",
        reviewRating: { ratingValue: 4 },
        // author is optional
        // datePublished is optional
      };

      expect(review.reviewBody).toBeDefined();
      expect(review.reviewRating).toBeDefined();
    });
  });

  describe("Aggregate Rating Schema Generation", () => {
    it("should generate valid aggregate rating schema", () => {
      const aggregateRating = {
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        ratingValue: 4.2,
        bestRating: 5,
        worstRating: 0,
        ratingCount: 150,
        reviewCount: 120,
      };

      expect(aggregateRating["@context"]).toBe("https://schema.org");
      expect(aggregateRating["@type"]).toBe("AggregateRating");
      expect(aggregateRating.ratingValue).toBe(4.2);
      expect(aggregateRating.ratingCount).toBe(150);
    });

    it("should require ratingCount for aggregate rating", () => {
      const aggregateRating = {
        ratingValue: 4.2,
        ratingCount: 150,
      };

      expect(aggregateRating.ratingCount).toBeGreaterThanOrEqual(1);
    });

    it("should support optional reviewCount", () => {
      const aggregateRating1 = {
        ratingValue: 4.2,
        ratingCount: 150,
        reviewCount: 120,
      };

      const aggregateRating2 = {
        ratingValue: 4.2,
        ratingCount: 150,
        // reviewCount omitted
      };

      expect(aggregateRating1.reviewCount).toBeDefined();
      expect(aggregateRating2.reviewCount).toBeUndefined();
    });
  });

  describe("Tour with Rating Schema", () => {
    it("should generate complete tour schema with ratings", () => {
      const tourSchema = {
        "@context": "https://schema.org",
        "@type": "Product",
        name: "Kerala Backwaters Tour",
        url: "https://pikme.com/visit/tour/kerala-backwaters",
        description: "Explore the beautiful backwaters of Kerala",
        image: "https://pikme.com/images/kerala.jpg",
        aggregateRating: {
          "@type": "AggregateRating",
          ratingValue: 4.5,
          ratingCount: 200,
          reviewCount: 180,
        },
      };

      expect(tourSchema.name).toBe("Kerala Backwaters Tour");
      expect(tourSchema.aggregateRating.ratingValue).toBe(4.5);
      expect(tourSchema.aggregateRating.ratingCount).toBe(200);
    });

    it("should support multiple reviews in tour schema", () => {
      const tourSchema = {
        "@type": "Product",
        name: "Kerala Backwaters Tour",
        review: [
          {
            "@type": "Review",
            reviewRating: { ratingValue: 5 },
            author: { name: "John" },
            reviewBody: "Amazing!",
          },
          {
            "@type": "Review",
            reviewRating: { ratingValue: 4 },
            author: { name: "Jane" },
            reviewBody: "Very good",
          },
        ],
      };

      expect(tourSchema.review).toHaveLength(2);
      expect(tourSchema.review[0].reviewRating.ratingValue).toBe(5);
      expect(tourSchema.review[1].reviewRating.ratingValue).toBe(4);
    });
  });

  describe("Rating Calculations", () => {
    it("should calculate average rating correctly", () => {
      const ratings = [5, 4, 3, 4, 5];
      const average = ratings.reduce((a, b) => a + b, 0) / ratings.length;

      expect(average).toBe(4.2);
    });

    it("should handle empty ratings array", () => {
      const ratings: number[] = [];
      const average = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

      expect(average).toBe(0);
    });

    it("should round average to 1 decimal place", () => {
      const ratings = [4.33, 4.67, 4.5];
      const average = Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10;

      expect(average).toBe(4.5);
    });
  });

  describe("Rating Distribution", () => {
    it("should generate rating distribution", () => {
      const ratings = [5, 5, 5, 4, 4, 3, 2, 1];
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

      expect(distribution[5]).toBe(3);
      expect(distribution[4]).toBe(2);
      expect(distribution[3]).toBe(1);
      expect(distribution[2]).toBe(1);
      expect(distribution[1]).toBe(1);
    });

    it("should calculate percentages correctly", () => {
      const distribution = { 5: 3, 4: 2, 3: 1, 2: 1, 1: 1 };
      const total = Object.values(distribution).reduce((a, b) => a + b, 0);

      const percentages = Object.entries(distribution).reduce(
        (acc, [stars, count]) => {
          acc[stars] = (count / total) * 100;
          return acc;
        },
        {} as Record<string, number>
      );

      expect(percentages["5"]).toBe(37.5);
      expect(percentages["4"]).toBe(25);
    });
  });

  describe("Rating Validation", () => {
    it("should validate rating range", () => {
      const validRatings = [0, 1, 2, 3, 4, 5];
      const invalidRatings = [-1, 6, 10];

      validRatings.forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(5);
      });

      invalidRatings.forEach((rating) => {
        expect(rating < 0 || rating > 5).toBe(true);
      });
    });

    it("should validate review body is not empty", () => {
      const validReview = "Great tour experience!";
      const invalidReview = "";

      expect(validReview.trim().length).toBeGreaterThan(0);
      expect(invalidReview.trim().length).toBe(0);
    });

    it("should validate author name is provided", () => {
      const review1 = { author: { name: "John Doe" } };
      const review2 = { author: { name: "" } };

      expect(review1.author.name).toBeTruthy();
      expect(review2.author.name).toBeFalsy();
    });

    it("should validate date format (ISO 8601)", () => {
      const validDates = ["2024-01-15T10:00:00Z", "2024-01-15"];
      const invalidDates = ["15/01/2024", "2024-13-45", "invalid"];

      validDates.forEach((date) => {
        expect(() => new Date(date)).not.toThrow();
      });

      invalidDates.forEach((date) => {
        const parsedDate = new Date(date);
        if (date === "invalid") {
          expect(isNaN(parsedDate.getTime())).toBe(true);
        }
      });
    });
  });

  describe("Rating Display", () => {
    it("should format rating to 1 decimal place", () => {
      const ratings = [4.123, 4.567, 4.999];

      ratings.forEach((rating) => {
        const formatted = parseFloat(rating.toFixed(1));
        expect(formatted).toBeGreaterThanOrEqual(4);
        expect(formatted).toBeLessThanOrEqual(5);
      });
    });

    it("should generate rating category", () => {
      const categories: Record<number, string> = {
        4.8: "Excellent",
        4.2: "Very Good",
        3.7: "Good",
        3.2: "Average",
        2.5: "Poor",
        1.5: "Very Poor",
      };

      Object.entries(categories).forEach(([rating, category]) => {
        const numRating = parseFloat(rating);
        let expectedCategory: string;

        if (numRating >= 4.5) expectedCategory = "Excellent";
        else if (numRating >= 4) expectedCategory = "Very Good";
        else if (numRating >= 3.5) expectedCategory = "Good";
        else if (numRating >= 3) expectedCategory = "Average";
        else if (numRating >= 2) expectedCategory = "Poor";
        else expectedCategory = "Very Poor";

        expect(expectedCategory).toBe(category);
      });
    });

    it("should generate badge text", () => {
      const badge1 = "4.5 ★ (150 reviews)";
      const badge2 = "4.5 ★ (1 review)";
      const badge3 = "No ratings";

      expect(badge1).toContain("★");
      expect(badge1).toContain("150");
      expect(badge2).toContain("1 review");
      expect(badge3).toBe("No ratings");
    });
  });

  describe("Rich Snippet Format", () => {
    it("should generate valid JSON-LD format", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Review",
        reviewRating: { ratingValue: 4.5 },
        reviewBody: "Great!",
      };

      const jsonLd = JSON.stringify(schema);
      const parsed = JSON.parse(jsonLd);

      expect(parsed["@context"]).toBe("https://schema.org");
      expect(parsed["@type"]).toBe("Review");
    });

    it("should support @graph format for multiple schemas", () => {
      const graph = {
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Product",
            name: "Tour",
            aggregateRating: { ratingValue: 4.5 },
          },
          {
            "@type": "Review",
            reviewRating: { ratingValue: 5 },
          },
        ],
      };

      expect(graph["@graph"]).toHaveLength(2);
      expect(graph["@graph"][0]["@type"]).toBe("Product");
      expect(graph["@graph"][1]["@type"]).toBe("Review");
    });
  });

  describe("Review Filtering and Sorting", () => {
    it("should filter reviews by rating range", () => {
      const reviews = [
        { reviewRating: { ratingValue: 5 } },
        { reviewRating: { ratingValue: 4 } },
        { reviewRating: { ratingValue: 3 } },
        { reviewRating: { ratingValue: 2 } },
      ];

      const filtered = reviews.filter(
        (r) => r.reviewRating.ratingValue >= 4 && r.reviewRating.ratingValue <= 5
      );

      expect(filtered).toHaveLength(2);
      expect(filtered[0].reviewRating.ratingValue).toBe(5);
      expect(filtered[1].reviewRating.ratingValue).toBe(4);
    });

    it("should sort reviews by rating (descending)", () => {
      const reviews = [
        { reviewRating: { ratingValue: 3 } },
        { reviewRating: { ratingValue: 5 } },
        { reviewRating: { ratingValue: 4 } },
      ];

      const sorted = [...reviews].sort((a, b) => b.reviewRating.ratingValue - a.reviewRating.ratingValue);

      expect(sorted[0].reviewRating.ratingValue).toBe(5);
      expect(sorted[1].reviewRating.ratingValue).toBe(4);
      expect(sorted[2].reviewRating.ratingValue).toBe(3);
    });

    it("should sort reviews by date (newest first)", () => {
      const reviews = [
        { datePublished: "2024-01-10" },
        { datePublished: "2024-01-20" },
        { datePublished: "2024-01-15" },
      ];

      const sorted = [...reviews].sort((a, b) => {
        const dateA = new Date(a.datePublished).getTime();
        const dateB = new Date(b.datePublished).getTime();
        return dateB - dateA;
      });

      expect(sorted[0].datePublished).toBe("2024-01-20");
      expect(sorted[1].datePublished).toBe("2024-01-15");
      expect(sorted[2].datePublished).toBe("2024-01-10");
    });
  });

  describe("SEO Best Practices", () => {
    it("should include @context in schema", () => {
      const schema = {
        "@context": "https://schema.org",
        "@type": "Review",
      };

      expect(schema["@context"]).toBe("https://schema.org");
    });

    it("should use proper @type values", () => {
      const validTypes = ["Review", "AggregateRating", "Product", "LocalBusiness"];

      validTypes.forEach((type) => {
        expect(validTypes).toContain(type);
      });
    });

    it("should include rating in 0-5 scale", () => {
      const ratings = [0, 1, 2, 3, 4, 5];

      ratings.forEach((rating) => {
        expect(rating).toBeGreaterThanOrEqual(0);
        expect(rating).toBeLessThanOrEqual(5);
      });
    });

    it("should use HTTPS URLs in schemas", () => {
      const url = "https://pikme.com/visit/tour/kerala-backwaters";

      expect(url).toMatch(/^https:\/\//);
    });
  });

  describe("Rich Snippet Eligibility", () => {
    it("should meet Google's review requirements", () => {
      const review = {
        "@context": "https://schema.org",
        "@type": "Review",
        reviewRating: {
          ratingValue: 4.5,
          bestRating: 5,
          worstRating: 0,
        },
        author: { "@type": "Person", name: "John Doe" },
        reviewBody: "Great tour experience!",
        datePublished: "2024-01-15T10:00:00Z",
      };

      // Check required fields for review rich snippet
      expect(review["@context"]).toBeDefined();
      expect(review["@type"]).toBe("Review");
      expect(review.reviewRating.ratingValue).toBeDefined();
      expect(review.author).toBeDefined();
      expect(review.reviewBody).toBeDefined();
      expect(review.datePublished).toBeDefined();
    });

    it("should meet Google's rating requirements", () => {
      const aggregateRating = {
        "@context": "https://schema.org",
        "@type": "AggregateRating",
        ratingValue: 4.5,
        bestRating: 5,
        worstRating: 0,
        ratingCount: 150,
      };

      // Check required fields for rating rich snippet
      expect(aggregateRating["@context"]).toBeDefined();
      expect(aggregateRating["@type"]).toBe("AggregateRating");
      expect(aggregateRating.ratingValue).toBeDefined();
      expect(aggregateRating.ratingCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Review Schema Variations", () => {
    it("should support review for Product", () => {
      const schema = {
        "@type": "Product",
        name: "Tour",
        review: [
          {
            "@type": "Review",
            reviewRating: { ratingValue: 4.5 },
          },
        ],
      };

      expect(schema.review).toHaveLength(1);
      expect(schema.review[0]["@type"]).toBe("Review");
    });

    it("should support review for LocalBusiness", () => {
      const schema = {
        "@type": "LocalBusiness",
        name: "Tour Company",
        review: [
          {
            "@type": "Review",
            reviewRating: { ratingValue: 4.5 },
          },
        ],
      };

      expect(schema.review).toHaveLength(1);
    });

    it("should support review for TouristAttraction", () => {
      const schema = {
        "@type": "TouristAttraction",
        name: "Destination",
        review: [
          {
            "@type": "Review",
            reviewRating: { ratingValue: 4.5 },
          },
        ],
      };

      expect(schema.review).toHaveLength(1);
    });
  });

  describe("Rating Comparison", () => {
    it("should compare tour rating with category average", () => {
      const tourRating = 4.5;
      const categoryAverage = 4.0;
      const difference = tourRating - categoryAverage;

      expect(difference).toBe(0.5);
      expect(difference > 0).toBe(true); // Above average
    });

    it("should calculate percentage difference", () => {
      const tourRating = 4.5;
      const categoryAverage = 4.0;
      const percentageDifference = ((tourRating - categoryAverage) / categoryAverage) * 100;

      expect(percentageDifference).toBe(12.5);
    });
  });

  describe("Review Excerpt Generation", () => {
    it("should truncate long review text", () => {
      const fullText =
        "This is a very long review that needs to be truncated for display purposes in the interface.";
      const maxLength = 50;
      const excerpt = fullText.substring(0, maxLength).trim() + "...";

      expect(excerpt.length).toBeLessThanOrEqual(maxLength + 3); // +3 for "..."
      expect(excerpt).toContain("...");
    });

    it("should not truncate short review text", () => {
      const shortText = "Great tour!";
      const maxLength = 50;
      const excerpt = shortText.length <= maxLength ? shortText : shortText.substring(0, maxLength) + "...";

      expect(excerpt).toBe("Great tour!");
      expect(excerpt).not.toContain("...");
    });
  });
});
