import React, { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface VariantDistributionPreviewProps {
  flagName: string;
  rolloutPercentage: number;
  enabled: boolean;
  sampleSize?: number;
}

/**
 * Component showing real-time variant distribution preview
 */
export function VariantDistributionPreview({
  flagName,
  rolloutPercentage,
  enabled,
  sampleSize = 10000,
}: VariantDistributionPreviewProps) {
  const controlPercentage = enabled ? 100 - rolloutPercentage : 100;
  const treatmentPercentage = enabled ? rolloutPercentage : 0;

  const controlCount = Math.round((controlPercentage / 100) * sampleSize);
  const treatmentCount = Math.round((treatmentPercentage / 100) * sampleSize);

  const pieData = [
    {
      name: "Control",
      value: controlPercentage,
      count: controlCount,
    },
    {
      name: "Treatment",
      value: treatmentPercentage,
      count: treatmentCount,
    },
  ].filter((item) => item.value > 0);

  const barData = [
    {
      name: "Control",
      users: controlCount,
      percentage: controlPercentage,
    },
    {
      name: "Treatment",
      users: treatmentCount,
      percentage: treatmentPercentage,
    },
  ];

  const COLORS = ["#8b5cf6", "#3b82f6"];

  return (
    <div className="space-y-4">
      {/* Status */}
      <Card className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">{flagName}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {enabled ? (
                <>
                  Feature is <span className="font-medium">enabled</span> with{" "}
                  <span className="font-medium">{rolloutPercentage}%</span> rollout
                </>
              ) : (
                <>
                  Feature is <span className="font-medium">disabled</span>
                </>
              )}
            </p>
          </div>
          <Badge variant={enabled ? "default" : "outline"}>
            {enabled ? "Active" : "Inactive"}
          </Badge>
        </div>
      </Card>

      {/* Pie Chart */}
      {enabled && rolloutPercentage > 0 && rolloutPercentage < 100 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Variant Distribution</h4>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value}%`}
                contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Bar Chart */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">
          Expected User Distribution (out of {sampleSize.toLocaleString()} users)
        </h4>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => value.toLocaleString()}
              labelFormatter={(label) => `${label} Group`}
            />
            <Bar dataKey="users" fill="#3b82f6" name="Users" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="p-4 border-purple-200 bg-purple-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-purple-600"></div>
            <h5 className="font-medium text-purple-900">Control Group</h5>
          </div>
          <p className="text-2xl font-bold text-purple-900">
            {controlPercentage}%
          </p>
          <p className="text-sm text-purple-700 mt-1">
            {controlCount.toLocaleString()} users
          </p>
          <p className="text-xs text-purple-600 mt-2">
            Uses default ranking algorithm
          </p>
        </Card>

        <Card className="p-4 border-blue-200 bg-blue-50">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-blue-600"></div>
            <h5 className="font-medium text-blue-900">Treatment Group</h5>
          </div>
          <p className="text-2xl font-bold text-blue-900">
            {treatmentPercentage}%
          </p>
          <p className="text-sm text-blue-700 mt-1">
            {treatmentCount.toLocaleString()} users
          </p>
          <p className="text-xs text-blue-600 mt-2">
            Uses new engagement-based ranking
          </p>
        </Card>
      </div>

      {/* Rollout Timeline */}
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-3">Rollout Timeline</h4>
        <div className="space-y-2">
          <RolloutMilestone
            percentage={0}
            label="Feature Disabled"
            active={!enabled}
          />
          <RolloutMilestone
            percentage={25}
            label="Early Access (25%)"
            active={enabled && rolloutPercentage >= 25}
          />
          <RolloutMilestone
            percentage={50}
            label="Half Rollout (50%)"
            active={enabled && rolloutPercentage >= 50}
          />
          <RolloutMilestone
            percentage={75}
            label="Broad Rollout (75%)"
            active={enabled && rolloutPercentage >= 75}
          />
          <RolloutMilestone
            percentage={100}
            label="Full Rollout (100%)"
            active={enabled && rolloutPercentage === 100}
          />
        </div>
      </Card>

      {/* Recommendations */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Rollout Recommendations</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Start with 5-10% to test for unexpected issues with real traffic
          </li>
          <li>
            • Monitor metrics for 24-48 hours before increasing rollout
          </li>
          <li>
            • Increase in 25% increments to gradually validate performance
          </li>
          <li>
            • Reach 100% only after confirming positive impact on key metrics
          </li>
        </ul>
      </Card>
    </div>
  );
}

/**
 * Individual rollout milestone
 */
interface RolloutMilestoneProps {
  percentage: number;
  label: string;
  active: boolean;
}

function RolloutMilestone({ percentage, label, active }: RolloutMilestoneProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-12 text-right">
        <span className={`text-sm font-medium ${active ? "text-blue-600" : "text-gray-400"}`}>
          {percentage}%
        </span>
      </div>
      <div className="flex-grow">
        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all ${
              active ? "bg-blue-600" : "bg-gray-300"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
      <div className="flex-grow">
        <span className={`text-sm ${active ? "text-blue-900 font-medium" : "text-gray-500"}`}>
          {label}
        </span>
      </div>
      {active && (
        <Badge className="bg-blue-600">Current</Badge>
      )}
    </div>
  );
}

/**
 * Comparison view for multiple flags
 */
interface MultipleDistributionProps {
  flags: Array<{
    name: string;
    rolloutPercentage: number;
    enabled: boolean;
  }>;
}

export function MultipleVariantDistribution({ flags }: MultipleDistributionProps) {
  const data = flags.map((flag) => ({
    name: flag.name,
    control: flag.enabled ? 100 - flag.rolloutPercentage : 100,
    treatment: flag.enabled ? flag.rolloutPercentage : 0,
  }));

  return (
    <Card className="p-4">
      <h4 className="font-medium text-gray-900 mb-3">All Flags Distribution</h4>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip
            formatter={(value) => `${value}%`}
            contentStyle={{ backgroundColor: "#fff", border: "1px solid #ccc" }}
          />
          <Legend />
          <Bar dataKey="control" fill="#8b5cf6" name="Control" />
          <Bar dataKey="treatment" fill="#3b82f6" name="Treatment" />
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
}
