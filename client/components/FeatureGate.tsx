import React, { ReactNode } from "react";
import { useFlag, useFlagVariant } from "@/contexts/FeatureFlagContext";
import type { FeatureFlagName } from "@/contexts/FeatureFlagContext";

interface FeatureGateProps {
  flag: FeatureFlagName;
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders children based on feature flag status
 * Shows fallback content if flag is disabled
 */
export function FeatureGate({ flag, children, fallback }: FeatureGateProps) {
  const enabled = useFlag(flag);

  if (!enabled) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface VariantProps {
  flag: FeatureFlagName;
  control?: ReactNode;
  treatment?: ReactNode;
}

/**
 * Component that renders different content based on A/B test variant
 * Useful for showing different UI for control vs treatment groups
 */
export function VariantSwitch({ flag, control, treatment }: VariantProps) {
  const variant = useFlagVariant(flag);

  if (variant === "treatment") {
    return <>{treatment}</>;
  }

  return <>{control}</>;
}

interface ConditionalProps {
  flag: FeatureFlagName;
  variant?: "control" | "treatment";
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that renders content only if flag is enabled AND variant matches
 * Useful for showing specific UI only to treatment group
 */
export function ConditionalRender({
  flag,
  variant,
  children,
  fallback,
}: ConditionalProps) {
  const enabled = useFlag(flag);
  const currentVariant = useFlagVariant(flag);

  const shouldRender =
    enabled && (!variant || currentVariant === variant);

  if (!shouldRender) {
    return fallback || null;
  }

  return <>{children}</>;
}

interface FeatureListProps {
  flags: FeatureFlagName[];
  children: (flags: Map<FeatureFlagName, boolean>) => ReactNode;
}

/**
 * Component that provides all flag states to children via render prop
 * Useful for complex conditional rendering logic
 */
export function FeatureList({ flags, children }: FeatureListProps) {
  const flagStates = new Map<FeatureFlagName, boolean>();

  // eslint-disable-next-line react-hooks/rules-of-hooks
  flags.forEach((flag) => {
    flagStates.set(flag, useFlag(flag));
  });

  return <>{children(flagStates)}</>;
}

interface FeatureBadgeProps {
  flag: FeatureFlagName;
  label?: string;
  className?: string;
}

/**
 * Component that displays a badge showing which variant user is in
 * Useful for debugging and testing
 */
export function FeatureBadge({
  flag,
  label = "Variant",
  className = "",
}: FeatureBadgeProps) {
  const variant = useFlagVariant(flag);
  const enabled = useFlag(flag);

  if (!enabled) {
    return null;
  }

  const variantColor =
    variant === "treatment"
      ? "bg-blue-100 text-blue-800"
      : "bg-gray-100 text-gray-800";

  return (
    <span
      className={`inline-block px-2 py-1 text-xs font-semibold rounded ${variantColor} ${className}`}
    >
      {label}: {variant}
    </span>
  );
}

interface FeatureTooltipProps {
  flag: FeatureFlagName;
  children: ReactNode;
  tooltipText?: string;
}

/**
 * Component that wraps children with a tooltip showing feature flag info
 * Useful for highlighting experimental features
 */
export function FeatureTooltip({
  flag,
  children,
  tooltipText = "This feature is being tested",
}: FeatureTooltipProps) {
  const variant = useFlagVariant(flag);
  const enabled = useFlag(flag);

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="relative inline-block group">
      {children}
      {variant === "treatment" && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-blue-600 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
          {tooltipText}
        </div>
      )}
    </div>
  );
}
