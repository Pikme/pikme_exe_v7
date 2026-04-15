import { useEffect } from "react";
import type { HreflangLink } from "@/lib/hreflang";

interface HreflangProps {
  links: HreflangLink[];
}

/**
 * Hreflang Component
 * Injects hreflang meta tags into the page head for international SEO
 *
 * Usage:
 * <Hreflang links={generateAllHreflangLinks("https://pikme.com")} />
 */
export function Hreflang({ links }: HreflangProps) {
  useEffect(() => {
    // Remove existing hreflang tags
    const existingLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingLinks.forEach((link) => link.remove());

    // Add new hreflang tags
    links.forEach((link) => {
      const linkElement = document.createElement("link");
      linkElement.rel = "alternate";
      linkElement.hreflang = link.hreflang;
      linkElement.href = link.href;
      document.head.appendChild(linkElement);
    });

    // Cleanup function
    return () => {
      const newLinks = document.querySelectorAll('link[rel="alternate"][hreflang]');
      newLinks.forEach((link) => link.remove());
    };
  }, [links]);

  // This component doesn't render anything visible
  return null;
}

interface HreflangProviderProps {
  baseUrl: string;
  children: React.ReactNode;
}

/**
 * HreflangProvider Component
 * Provides hreflang context for child components
 * Can be used to wrap the entire app or specific sections
 */
export function HreflangProvider({ baseUrl, children }: HreflangProviderProps) {
  return <>{children}</>;
}

interface LocaleSwitcherProps {
  currentLocale: string;
  onLocaleChange: (locale: string) => void;
  locales: Array<{ locale: string; label: string }>;
  className?: string;
}

/**
 * LocaleSwitcher Component
 * UI component for users to switch between language/region variants
 *
 * Usage:
 * <LocaleSwitcher
 *   currentLocale="en-IN"
 *   onLocaleChange={(locale) => setLocale(locale)}
 *   locales={getAllLocales()}
 * />
 */
export function LocaleSwitcher({
  currentLocale,
  onLocaleChange,
  locales,
  className = "",
}: LocaleSwitcherProps) {
  return (
    <div className={`locale-switcher ${className}`}>
      <label htmlFor="locale-select" className="text-sm font-medium">
        Language & Region:
      </label>
      <select
        id="locale-select"
        value={currentLocale}
        onChange={(e) => onLocaleChange(e.target.value)}
        className="ml-2 px-3 py-1 border rounded text-sm"
      >
        {locales.map((locale) => (
          <option key={locale.locale} value={locale.locale}>
            {locale.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface HreflangMetaProps {
  links: HreflangLink[];
}

/**
 * HreflangMeta Component
 * Alternative to Hreflang that works with meta tags
 * Useful for SSR or static generation
 */
export function HreflangMeta({ links }: HreflangMetaProps) {
  useEffect(() => {
    // Create a container for hreflang meta tags
    let container = document.getElementById("hreflang-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "hreflang-container";
      container.style.display = "none";
      document.head.appendChild(container);
    }

    // Clear existing links
    container.innerHTML = "";

    // Add new hreflang links
    links.forEach((link) => {
      const linkElement = document.createElement("link");
      linkElement.rel = "alternate";
      linkElement.hreflang = link.hreflang;
      linkElement.href = link.href;
      container?.appendChild(linkElement);
    });

    return () => {
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [links]);

  return null;
}

interface HreflangDebugProps {
  links: HreflangLink[];
  show?: boolean;
}

/**
 * HreflangDebug Component
 * Development utility to visualize hreflang configuration
 * Only renders in development mode
 */
export function HreflangDebug({ links, show = false }: HreflangDebugProps) {
  if (!show || process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <div
      className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg max-w-xs max-h-96 overflow-auto text-xs font-mono z-50"
      style={{ opacity: 0.9 }}
    >
      <div className="font-bold mb-2">hreflang Debug</div>
      <div className="space-y-1">
        {links.map((link, index) => (
          <div key={index} className="break-words">
            <span className="text-blue-400">{link.hreflang}</span>
            <span className="text-gray-400"> → </span>
            <span className="text-green-400">{link.href}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface HreflangListProps {
  links: HreflangLink[];
  className?: string;
}

/**
 * HreflangList Component
 * Renders a list of hreflang links for reference/debugging
 */
export function HreflangList({ links, className = "" }: HreflangListProps) {
  return (
    <div className={`hreflang-list ${className}`}>
      <h3 className="font-semibold mb-2">hreflang Links</h3>
      <ul className="space-y-1 text-sm">
        {links.map((link, index) => (
          <li key={index} className="break-words">
            <code className="bg-gray-100 px-2 py-1 rounded">
              {link.hreflang}: {link.href}
            </code>
          </li>
        ))}
      </ul>
    </div>
  );
}

interface HreflangBreadcrumbProps {
  currentLocale: string;
  availableLocales: string[];
  onLocaleChange: (locale: string) => void;
  className?: string;
}

/**
 * HreflangBreadcrumb Component
 * Displays current locale and provides quick access to other variants
 */
export function HreflangBreadcrumb({
  currentLocale,
  availableLocales,
  onLocaleChange,
  className = "",
}: HreflangBreadcrumbProps) {
  return (
    <div className={`hreflang-breadcrumb flex items-center gap-2 text-sm ${className}`}>
      <span className="text-gray-600">Viewing in:</span>
      <span className="font-semibold">{currentLocale}</span>
      {availableLocales.length > 1 && (
        <>
          <span className="text-gray-400">|</span>
          <div className="flex gap-1">
            {availableLocales.map((locale) => (
              <button
                key={locale}
                onClick={() => onLocaleChange(locale)}
                className={`px-2 py-1 rounded text-xs ${
                  locale === currentLocale
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {locale}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
