import { useEffect } from "react";
import type { CanonicalLink } from "@/lib/canonical";

interface CanonicalProps {
  href: string;
}

/**
 * Canonical Component
 * Injects canonical meta tag into the page head for duplicate content prevention
 *
 * Usage:
 * <Canonical href="https://pikme.com/visit/tour/kerala-backwaters" />
 */
export function Canonical({ href }: CanonicalProps) {
  useEffect(() => {
    // Remove existing canonical tags
    const existingCanonical = document.querySelector('link[rel="canonical"]');
    if (existingCanonical) {
      existingCanonical.remove();
    }

    // Add new canonical tag
    const linkElement = document.createElement("link");
    linkElement.rel = "canonical";
    linkElement.href = href;
    document.head.appendChild(linkElement);

    // Cleanup function
    return () => {
      const newCanonical = document.querySelector('link[rel="canonical"]');
      if (newCanonical) {
        newCanonical.remove();
      }
    };
  }, [href]);

  // This component doesn't render anything visible
  return null;
}

interface CanonicalProviderProps {
  baseUrl: string;
  children: React.ReactNode;
}

/**
 * CanonicalProvider Component
 * Provides canonical context for child components
 */
export function CanonicalProvider({ baseUrl, children }: CanonicalProviderProps) {
  return <>{children}</>;
}

interface CanonicalDebugProps {
  href: string;
  show?: boolean;
}

/**
 * CanonicalDebug Component
 * Development utility to visualize canonical configuration
 */
export function CanonicalDebug({ href, show = false }: CanonicalDebugProps) {
  if (!show || process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 left-4 bg-gray-900 text-white p-4 rounded-lg max-w-sm max-h-96 overflow-auto text-xs font-mono z-50"
      style={{ opacity: 0.9 }}
    >
      <div className="font-bold mb-2">Canonical Debug</div>
      <div className="space-y-2">
        <div>
          <span className="text-blue-400">href:</span>
          <span className="text-gray-400"> </span>
          <span className="text-green-400 break-words">{href}</span>
        </div>
        <div className="text-gray-500 text-xs">
          <div>Protocol: {new URL(href).protocol}</div>
          <div>Hostname: {new URL(href).hostname}</div>
          <div>Pathname: {new URL(href).pathname}</div>
          {new URL(href).search && <div>Search: {new URL(href).search}</div>}
        </div>
      </div>
    </div>
  );
}

interface CanonicalListProps {
  href: string;
  className?: string;
}

/**
 * CanonicalList Component
 * Renders canonical URL for reference/debugging
 */
export function CanonicalList({ href, className = "" }: CanonicalListProps) {
  return (
    <div className={`canonical-list ${className}`}>
      <h3 className="font-semibold mb-2">Canonical URL</h3>
      <code className="bg-gray-100 px-2 py-1 rounded text-sm break-words block">{href}</code>
    </div>
  );
}

interface CanonicalValidationProps {
  href: string;
  show?: boolean;
}

/**
 * CanonicalValidation Component
 * Shows validation status of canonical URL
 */
export function CanonicalValidation({ href, show = false }: CanonicalValidationProps) {
  if (!show) {
    return null;
  }

  const issues: string[] = [];

  // Check HTTPS
  if (!href.startsWith("https://")) {
    issues.push("Must use HTTPS");
  }

  // Check valid URL
  try {
    new URL(href);
  } catch {
    issues.push("Invalid URL format");
  }

  // Check for tracking parameters
  if (href.includes("utm_") || href.includes("fbclid") || href.includes("gclid")) {
    issues.push("Contains tracking parameters");
  }

  const isValid = issues.length === 0;

  return (
    <div className={`canonical-validation p-2 rounded text-sm ${isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
      <div className="font-semibold mb-1">{isValid ? "✓ Valid Canonical" : "✗ Canonical Issues"}</div>
      {issues.length > 0 && (
        <ul className="list-disc list-inside">
          {issues.map((issue, index) => (
            <li key={index}>{issue}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface CanonicalComparisonProps {
  currentUrl: string;
  canonicalUrl: string;
  show?: boolean;
}

/**
 * CanonicalComparison Component
 * Shows comparison between current URL and canonical
 */
export function CanonicalComparison({
  currentUrl,
  canonicalUrl,
  show = false,
}: CanonicalComparisonProps) {
  if (!show) {
    return null;
  }

  const isSelfReferential = currentUrl === canonicalUrl;

  return (
    <div className="canonical-comparison p-3 rounded bg-gray-50 text-sm space-y-2">
      <div>
        <span className="font-semibold">Current URL:</span>
        <code className="block bg-white p-1 rounded mt-1 break-words text-xs">{currentUrl}</code>
      </div>
      <div>
        <span className="font-semibold">Canonical URL:</span>
        <code className="block bg-white p-1 rounded mt-1 break-words text-xs">{canonicalUrl}</code>
      </div>
      {isSelfReferential && (
        <div className="text-green-700 text-xs">✓ Self-referential (page is canonical)</div>
      )}
      {!isSelfReferential && (
        <div className="text-blue-700 text-xs">→ Points to different URL (consolidation)</div>
      )}
    </div>
  );
}

interface CanonicalBadgeProps {
  href: string;
  className?: string;
}

/**
 * CanonicalBadge Component
 * Shows canonical status badge
 */
export function CanonicalBadge({ href, className = "" }: CanonicalBadgeProps) {
  const isValid = href.startsWith("https://");

  return (
    <div
      className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
        isValid ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      } ${className}`}
    >
      <span>{isValid ? "✓" : "✗"}</span>
      <span>Canonical</span>
    </div>
  );
}

interface CanonicalInfoProps {
  href: string;
  pageType?: string;
  className?: string;
}

/**
 * CanonicalInfo Component
 * Shows canonical URL information
 */
export function CanonicalInfo({ href, pageType, className = "" }: CanonicalInfoProps) {
  const url = new URL(href);

  return (
    <div className={`canonical-info text-sm space-y-1 ${className}`}>
      {pageType && <div className="text-gray-600">Page Type: {pageType}</div>}
      <div className="text-gray-600">Domain: {url.hostname}</div>
      <div className="text-gray-600">Path: {url.pathname}</div>
      {url.search && <div className="text-gray-600">Parameters: {url.search}</div>}
    </div>
  );
}

interface CanonicalMultipleProps {
  links: CanonicalLink[];
}

/**
 * CanonicalMultiple Component
 * Handles multiple canonical links (though typically only one should exist)
 */
export function CanonicalMultiple({ links }: CanonicalMultipleProps) {
  useEffect(() => {
    // Remove existing canonical tags
    const existingCanonicals = document.querySelectorAll('link[rel="canonical"]');
    existingCanonicals.forEach((link) => link.remove());

    // Add new canonical tags (typically only one)
    links.forEach((link) => {
      const linkElement = document.createElement("link");
      linkElement.rel = "canonical";
      linkElement.href = link.href;
      document.head.appendChild(linkElement);
    });

    return () => {
      const newCanonicals = document.querySelectorAll('link[rel="canonical"]');
      newCanonicals.forEach((link) => link.remove());
    };
  }, [links]);

  return null;
}

interface CanonicalMetaProps {
  href: string;
}

/**
 * CanonicalMeta Component
 * Alternative to Canonical that works with meta tags
 */
export function CanonicalMeta({ href }: CanonicalMetaProps) {
  useEffect(() => {
    // Create a container for canonical meta tag
    let container = document.getElementById("canonical-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "canonical-container";
      container.style.display = "none";
      document.head.appendChild(container);
    }

    // Clear existing links
    container.innerHTML = "";

    // Add new canonical link
    const linkElement = document.createElement("link");
    linkElement.rel = "canonical";
    linkElement.href = href;
    container.appendChild(linkElement);

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [href]);

  return null;
}
