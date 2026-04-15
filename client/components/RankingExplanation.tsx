import React, { useState } from "react";
import { useRankingExplanation } from "@/hooks/useFeatureFlag";
import { FeatureGate } from "@/components/FeatureGate";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, TrendingUp, Users, Zap } from "lucide-react";

interface RankingExplanationProps {
  locationId: number;
  variant: "control" | "treatment";
  compact?: boolean;
}

/**
 * Component that displays why a location ranks high
 * Only shows for treatment group when ranking_explanations flag is enabled
 */
export function RankingExplanation({
  locationId,
  variant,
  compact = false,
}: RankingExplanationProps) {
  const { explanation, loading } = useRankingExplanation(locationId, variant);

  if (loading || !explanation) {
    return null;
  }

  return (
    <FeatureGate flag="ranking_explanations">
      {compact ? (
        <CompactExplanation explanation={explanation} />
      ) : (
        <DetailedExplanation explanation={explanation} />
      )}
    </FeatureGate>
  );
}

interface ExplanationProps {
  explanation: string;
}

/**
 * Compact explanation shown inline with results
 */
function CompactExplanation({ explanation }: ExplanationProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="cursor-help">
            <HelpCircle className="w-3 h-3 mr-1" />
            Why ranked here?
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{explanation}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

/**
 * Detailed explanation with icons and metrics
 */
function DetailedExplanation({ explanation }: ExplanationProps) {
  const [expanded, setExpanded] = useState(false);

  // Parse explanation to extract metrics
  const metrics = parseExplanation(explanation);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-start gap-3">
        <Zap className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="flex-grow">
          <h4 className="font-semibold text-blue-900 mb-2">
            Why this result ranks high
          </h4>
          <p className="text-sm text-blue-800 mb-3">{explanation}</p>

          {metrics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {metrics.map((metric, index) => (
                <MetricBadge key={index} metric={metric} />
              ))}
            </div>
          )}

          {expanded && (
            <div className="mt-3 pt-3 border-t border-blue-200 text-xs text-blue-700">
              <p>
                This result is ranked based on real user engagement data including
                views, clicks, and conversions. Higher engagement indicates better
                relevance to similar users.
              </p>
            </div>
          )}

          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            {expanded ? "Show less" : "Learn more"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface MetricBadgeProps {
  metric: {
    type: "views" | "engagement" | "conversion" | "recent";
    value: string;
  };
}

/**
 * Badge showing individual metric
 */
function MetricBadge({ metric }: MetricBadgeProps) {
  const icons = {
    views: <Users className="w-3 h-3" />,
    engagement: <TrendingUp className="w-3 h-3" />,
    conversion: <Zap className="w-3 h-3" />,
    recent: <TrendingUp className="w-3 h-3" />,
  };

  const colors = {
    views: "bg-blue-100 text-blue-700",
    engagement: "bg-green-100 text-green-700",
    conversion: "bg-purple-100 text-purple-700",
    recent: "bg-orange-100 text-orange-700",
  };

  return (
    <Badge variant="outline" className={`${colors[metric.type]} gap-1`}>
      {icons[metric.type]}
      <span>{metric.value}</span>
    </Badge>
  );
}

/**
 * Parse explanation string to extract metrics
 */
function parseExplanation(explanation: string): Array<{
  type: "views" | "engagement" | "conversion" | "recent";
  value: string;
}> {
  const metrics = [];

  // Look for view count
  const viewMatch = explanation.match(/(\d+)\+?\s*views?/i);
  if (viewMatch) {
    metrics.push({
      type: "views",
      value: `${viewMatch[1]}+ views`,
    });
  }

  // Look for engagement rate
  const engagementMatch = explanation.match(/(\d+\.?\d*)%?\s*(?:engagement|CTR|click)/i);
  if (engagementMatch) {
    metrics.push({
      type: "engagement",
      value: `${engagementMatch[1]}% engagement`,
    });
  }

  // Look for conversion rate
  const conversionMatch = explanation.match(/(\d+\.?\d*)%?\s*conversion/i);
  if (conversionMatch) {
    metrics.push({
      type: "conversion",
      value: `${conversionMatch[1]}% conversions`,
    });
  }

  // Look for recency
  if (explanation.toLowerCase().includes("recent")) {
    metrics.push({
      type: "recent",
      value: "Recently popular",
    });
  }

  return metrics;
}

/**
 * Explanation badge for result cards
 */
interface ExplanationBadgeProps {
  explanation: string | null;
  variant?: "control" | "treatment";
}

export function ExplanationBadge({
  explanation,
  variant = "treatment",
}: ExplanationBadgeProps) {
  if (!explanation || variant === "control") {
    return null;
  }

  return (
    <FeatureGate flag="ranking_explanations">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge className="bg-blue-600 hover:bg-blue-700 cursor-help">
              <HelpCircle className="w-3 h-3 mr-1" />
              Ranked
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <p className="max-w-xs">{explanation}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </FeatureGate>
  );
}

/**
 * Inline explanation shown below search results
 */
interface InlineExplanationProps {
  explanation: string;
  locationName: string;
}

export function InlineExplanation({
  explanation,
  locationName,
}: InlineExplanationProps) {
  return (
    <FeatureGate flag="ranking_explanations">
      <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 rounded">
        <p className="text-sm text-blue-900">
          <span className="font-semibold">{locationName}</span> ranks high because:{" "}
          <span className="text-blue-700">{explanation}</span>
        </p>
      </div>
    </FeatureGate>
  );
}
