import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ComparisonMetric {
  label: string;
  currentValue: number;
  previousValue: number;
  format?: "number" | "percentage" | "currency";
  color?: "green" | "red" | "blue";
}

interface PeriodComparisonProps {
  currentPeriod: string;
  previousPeriod: string;
  metrics: ComparisonMetric[];
}

/**
 * Period Comparison Component
 * Displays metrics comparison between two date ranges
 */
export function PeriodComparison({
  currentPeriod,
  previousPeriod,
  metrics,
}: PeriodComparisonProps) {
  const formatValue = (value: number, format?: string) => {
    switch (format) {
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "currency":
        return `$${value.toFixed(2)}`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, percentage: 0, isPositive: true };
    const change = current - previous;
    const percentage = (change / previous) * 100;
    return {
      value: change,
      percentage,
      isPositive: change >= 0,
    };
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Period Comparison</CardTitle>
        <CardDescription>
          {currentPeriod} vs {previousPeriod}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {metrics.map((metric, index) => {
            const change = calculateChange(metric.currentValue, metric.previousValue);
            const changePercentage = change.percentage;

            return (
              <div
                key={index}
                className="border rounded-lg p-4 hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-slate-900">{metric.label}</h3>
                  <TrendBadge
                    isPositive={change.isPositive}
                    percentage={changePercentage}
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* Current Period */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Current Period</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatValue(metric.currentValue, metric.format)}
                    </p>
                  </div>

                  {/* Previous Period */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Previous Period</p>
                    <p className="text-2xl font-bold text-slate-600">
                      {formatValue(metric.previousValue, metric.format)}
                    </p>
                  </div>

                  {/* Change Value */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Change</p>
                    <p
                      className={`text-2xl font-bold ${
                        change.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {change.isPositive ? "+" : ""}
                      {formatValue(change.value, metric.format)}
                    </p>
                  </div>

                  {/* Percentage Change */}
                  <div>
                    <p className="text-xs text-slate-500 mb-1">% Change</p>
                    <p
                      className={`text-2xl font-bold ${
                        change.isPositive ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {change.isPositive ? "+" : ""}
                      {changePercentage.toFixed(1)}%
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3">
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        change.isPositive ? "bg-green-500" : "bg-red-500"
                      }`}
                      style={{
                        width: `${Math.min(Math.abs(changePercentage), 100)}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Trend Badge Component
 */
function TrendBadge({
  isPositive,
  percentage,
}: {
  isPositive: boolean;
  percentage: number;
}) {
  const absPercentage = Math.abs(percentage);

  if (absPercentage === 0) {
    return (
      <Badge variant="outline" className="gap-1">
        <Minus className="w-3 h-3" />
        No change
      </Badge>
    );
  }

  return (
    <Badge
      className={`gap-1 ${
        isPositive
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : "bg-red-100 text-red-800 hover:bg-red-100"
      }`}
    >
      {isPositive ? (
        <TrendingUp className="w-3 h-3" />
      ) : (
        <TrendingDown className="w-3 h-3" />
      )}
      {absPercentage.toFixed(1)}%
    </Badge>
  );
}
