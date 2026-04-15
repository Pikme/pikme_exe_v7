import React, { useState, useEffect } from "react";
import { Sparkles, Loader, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

export interface TagSuggestion {
  name: string;
  confidence: number;
  reasoning: string;
  category?: string;
}

interface TagSuggestionsPanelProps {
  description: string;
  existingTags?: string[];
  onSelectTag?: (tag: string) => void;
  onSelectMultipleTags?: (tags: string[]) => void;
  minConfidence?: number;
}

export const TagSuggestionsPanel: React.FC<TagSuggestionsPanelProps> = ({
  description,
  existingTags = [],
  onSelectTag,
  onSelectMultipleTags,
  minConfidence = 0.6,
}) => {
  const [suggestions, setSuggestions] = useState<TagSuggestion[]>([]);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showReasoning, setShowReasoning] = useState<Set<string>>(new Set());

  const suggestTagsMutation = trpc.locations.suggestTags.useQuery(
    {
      description,
      existingTags,
    },
    {
      enabled: !!description && description.length > 10,
      staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    }
  );

  useEffect(() => {
    if (suggestTagsMutation.isLoading) {
      setIsLoading(true);
      setError(null);
    } else if (suggestTagsMutation.isError) {
      setIsLoading(false);
      setError("Failed to generate tag suggestions. Please try again.");
    } else if (suggestTagsMutation.data) {
      setIsLoading(false);
      const filtered = suggestTagsMutation.data.suggestions.filter(
        (s) => s.confidence >= minConfidence
      );
      setSuggestions(filtered);
      setError(null);
    }
  }, [suggestTagsMutation.isLoading, suggestTagsMutation.data, suggestTagsMutation.isError, minConfidence]);

  const handleToggleTag = (tagName: string) => {
    const newSelected = new Set(selectedTags);
    if (newSelected.has(tagName)) {
      newSelected.delete(tagName);
    } else {
      newSelected.add(tagName);
    }
    setSelectedTags(newSelected);
    onSelectTag?.(tagName);
  };

  const handleSelectAll = () => {
    const allTags = new Set(suggestions.map((s) => s.name));
    setSelectedTags(allTags);
    onSelectMultipleTags?.(Array.from(allTags));
  };

  const handleClearSelection = () => {
    setSelectedTags(new Set());
  };

  const handleApplySelected = () => {
    if (selectedTags.size > 0) {
      onSelectMultipleTags?.(Array.from(selectedTags));
    }
  };

  const toggleReasoning = (tagName: string) => {
    const newShow = new Set(showReasoning);
    if (newShow.has(tagName)) {
      newShow.delete(tagName);
    } else {
      newShow.add(tagName);
    }
    setShowReasoning(newShow);
  };

  const getConfidenceBadgeColor = (confidence: number) => {
    if (confidence >= 0.85) return "bg-green-100 text-green-800";
    if (confidence >= 0.7) return "bg-blue-100 text-blue-800";
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-gray-100 text-gray-800";
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.85) return "High";
    if (confidence >= 0.7) return "Good";
    if (confidence >= 0.6) return "Fair";
    return "Low";
  };

  if (!description || description.length < 10) {
    return (
      <Card className="p-4 bg-gray-50 border border-dashed">
        <p className="text-sm text-gray-600 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Enter a description (at least 10 characters) to get tag suggestions
        </p>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4 border-2 border-blue-200 bg-blue-50">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI-Powered Tag Suggestions</h3>
        </div>
        {isLoading && <Loader className="w-4 h-4 animate-spin text-blue-600" />}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="p-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-blue-600 animate-pulse" />
            <p className="text-sm text-gray-600">Analyzing description...</p>
          </div>
          <p className="text-xs text-gray-500">This may take a few seconds</p>
        </div>
      )}

      {/* Suggestions List */}
      {!isLoading && suggestions.length > 0 && (
        <>
          <div className="space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.name}
                className="p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedTags.has(suggestion.name)}
                    onChange={() => handleToggleTag(suggestion.name)}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-gray-900">
                        {suggestion.name}
                      </span>
                      <Badge
                        className={`text-xs font-semibold ${getConfidenceBadgeColor(
                          suggestion.confidence
                        )}`}
                      >
                        {getConfidenceLabel(suggestion.confidence)}{" "}
                        {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                      {suggestion.category && (
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      )}
                    </div>
                    <button
                      onClick={() => toggleReasoning(suggestion.name)}
                      className="mt-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showReasoning.has(suggestion.name)
                        ? "Hide reasoning"
                        : "Show reasoning"}
                    </button>
                    {showReasoning.has(suggestion.name) && (
                      <p className="mt-2 text-sm text-gray-700 bg-blue-50 p-2 rounded border border-blue-100">
                        {suggestion.reasoning}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2 border-t border-gray-200">
            <Button
              size="sm"
              variant="outline"
              onClick={handleSelectAll}
              className="flex-1"
            >
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Select All
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleClearSelection}
              className="flex-1"
            >
              Clear
            </Button>
            {selectedTags.size > 0 && (
              <Button
                size="sm"
                onClick={handleApplySelected}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Apply {selectedTags.size} Tag{selectedTags.size !== 1 ? "s" : ""}
              </Button>
            )}
          </div>
        </>
      )}

      {/* No Suggestions State */}
      {!isLoading && suggestions.length === 0 && !error && (
        <div className="p-4 text-center">
          <AlertCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            No tag suggestions available for this description
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Try adding more details to get better suggestions
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="pt-2 border-t border-gray-200">
        <p className="text-xs text-gray-600 flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          Suggestions are powered by AI and may require manual review
        </p>
      </div>
    </Card>
  );
};
