import React, { useState, useEffect } from "react";
import { useRankingVariant } from "@/hooks/useFeatureFlag";
import { FeatureGate, VariantSwitch, FeatureBadge } from "@/components/FeatureGate";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface SearchResult {
  locationId: number;
  name: string;
  description?: string;
  image?: string;
  slug: string;
  score?: number;
  variant?: "control" | "treatment";
  explanation?: string;
}

interface RankedSearchResultsProps {
  results: SearchResult[];
  isLoading?: boolean;
  onResultClick?: (result: SearchResult) => void;
}

/**
 * Component that displays search results with ranking variant awareness
 * Shows different UI based on whether user is in control or treatment group
 */
export function RankedSearchResults({
  results,
  isLoading = false,
  onResultClick,
}: RankedSearchResultsProps) {
  const { variant } = useRankingVariant();
  const [displayResults, setDisplayResults] = useState<SearchResult[]>(results);

  useEffect(() => {
    setDisplayResults(results);
  }, [results]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="p-4 animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Show variant badge in treatment group */}
      <FeatureGate flag="new_search_ranking">
        {variant === "treatment" && (
          <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <FeatureBadge flag="new_search_ranking" label="Ranking" />
            <p className="text-sm text-blue-700">
              Results ranked by engagement and popularity
            </p>
          </div>
        )}
      </FeatureGate>

      {/* Display results */}
      {displayResults.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500">No results found</p>
        </Card>
      ) : (
        displayResults.map((result, index) => (
          <SearchResultCard
            key={result.locationId}
            result={result}
            index={index}
            variant={variant}
            onResultClick={onResultClick}
          />
        ))
      )}
    </div>
  );
}

interface SearchResultCardProps {
  result: SearchResult;
  index: number;
  variant: "control" | "treatment";
  onResultClick?: (result: SearchResult) => void;
}

/**
 * Individual search result card with ranking-aware UI
 */
function SearchResultCard({
  result,
  index,
  variant,
  onResultClick,
}: SearchResultCardProps) {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
      <div className="flex gap-4">
        {/* Image */}
        {result.image && (
          <div className="flex-shrink-0 w-24 h-24 bg-gray-200 rounded-lg overflow-hidden">
            <img
              src={result.image}
              alt={result.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex-grow" onClick={() => onResultClick?.(result)}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-grow">
              <h3 className="font-semibold text-lg text-gray-900">
                {result.name}
              </h3>
              {result.description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                  {result.description}
                </p>
              )}
            </div>

            {/* Ranking info for treatment group */}
            <FeatureGate flag="new_search_ranking">
              {variant === "treatment" && (
                <div className="flex-shrink-0 text-right">
                  {result.score !== undefined && (
                    <div className="text-sm text-gray-500">
                      Score: {result.score.toFixed(1)}
                    </div>
                  )}
                  {result.explanation && (
                    <Badge variant="secondary" className="mt-2">
                      {result.explanation}
                    </Badge>
                  )}
                </div>
              )}
            </FeatureGate>
          </div>

          {/* Show different ranking indicators based on variant */}
          <VariantSwitch
            flag="new_search_ranking"
            control={
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="outline">#{index + 1}</Badge>
                <span className="text-xs text-gray-500">Default ranking</span>
              </div>
            }
            treatment={
              <div className="mt-3 flex items-center gap-2">
                <Badge variant="default">#{index + 1}</Badge>
                <span className="text-xs text-blue-600">
                  Ranked by engagement
                </span>
              </div>
            }
          />

          {/* Show ranking explanations if enabled */}
          <FeatureGate flag="ranking_explanations">
            {result.explanation && (
              <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                💡 {result.explanation}
              </div>
            )}
          </FeatureGate>
        </div>
      </div>

      {/* Action button */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => window.open(`/visit/tour/${result.slug}`, '_blank')}
          className="w-full justify-start"
        >
          View Details →
        </Button>
      </div>
    </Card>
  );
}

/**
 * Comparison view showing control vs treatment results side-by-side
 * Useful for admin testing
 */
interface ComparisonViewProps {
  controlResults: SearchResult[];
  treatmentResults: SearchResult[];
  isLoading?: boolean;
}

export function RankingComparisonView({
  controlResults,
  treatmentResults,
  isLoading = false,
}: ComparisonViewProps) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900">
          Control (Default Ranking)
        </h3>
        <RankedSearchResults results={controlResults} isLoading={isLoading} />
      </div>
      <div>
        <h3 className="font-semibold text-lg mb-4 text-gray-900">
          Treatment (Engagement-Based)
        </h3>
        <RankedSearchResults results={treatmentResults} isLoading={isLoading} />
      </div>
    </div>
  );
}
