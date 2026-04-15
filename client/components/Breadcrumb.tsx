import { Link } from "wouter";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
  showDashboard?: boolean;
}

export function Breadcrumb({ items, className = "", showDashboard = false }: BreadcrumbProps) {
  return (
    <nav className={`flex items-center gap-2 text-sm text-gray-600 mb-6 ${className}`} aria-label="Breadcrumb">
      {showDashboard && (
        <>
          <Link href="/admin" className="hover:text-gray-900 transition-colors">
            Dashboard
          </Link>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </>
      )}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {index > 0 && showDashboard === false && <ChevronRight className="w-4 h-4 text-gray-400" />}
          {item.href ? (
            <Link href={item.href} className="hover:text-gray-900 transition-colors hover:underline">
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 font-medium">{item.label}</span>
          )}
        </div>
      ))}
    </nav>
  );
}

/**
 * Generate breadcrumb items for tour detail pages
 */
export function generateTourBreadcrumbs(tourData: {
  name: string;
  country?: string;
  category?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Tours", href: "/tours" },
  ];

  if (tourData.country) {
    items.push({
      label: `${tourData.country} Tours`,
      href: `/destinations/${tourData.country.toLowerCase()}`,
    });
  }

  if (tourData.category) {
    items.push({
      label: `${tourData.category} Tours`,
      href: `/categories/${tourData.category.toLowerCase().replace(/\s+/g, '-')}`,
    });
  }

  items.push({
    label: tourData.name,
  });

  return items;
}

/**
 * Generate breadcrumb items for destination pages
 */
export function generateDestinationBreadcrumbs(destination: {
  name: string;
  parentName?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Destinations", href: "/destinations" },
  ];

  if (destination.parentName) {
    items.push({
      label: destination.parentName,
      href: `/destinations/${destination.parentName.toLowerCase()}`,
    });
  }

  items.push({
    label: destination.name,
  });

  return items;
}

/**
 * Generate breadcrumb items for category pages
 */
export function generateCategoryBreadcrumbs(category: {
  name: string;
}): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Categories", href: "/categories" },
    { label: category.name },
  ];
}

/**
 * Generate breadcrumb items for activity pages
 */
export function generateActivityBreadcrumbs(activity: {
  name: string;
}): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Activities", href: "/activities" },
    { label: activity.name },
  ];
}

/**
 * Generate breadcrumb items for state pages
 */
export function generateStateBreadcrumbs(state: {
  name: string;
  country?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "States", href: "/states" },
  ];

  if (state.country) {
    items.push({
      label: state.country,
      href: `/countries/${state.country.toLowerCase()}`,
    });
  }

  items.push({
    label: state.name,
  });

  return items;
}

/**
 * Generate breadcrumb items for city/location pages
 */
export function generateCityBreadcrumbs(city: {
  name: string;
  state?: string;
  stateSlug?: string;
}): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "States", href: "/states" },
  ];

  if (city.state && city.stateSlug) {
    items.push({
      label: city.state,
      href: `/states/${city.stateSlug}`,
    });
    items.push({
      label: "Cities",
      href: `/states/${city.stateSlug}/cities`,
    });
  }

  items.push({
    label: city.name,
  });

  return items;
}

/**
 * Generate breadcrumb items for countries listing page
 */
export function generateCountriesBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Destinations" },
  ];
}

/**
 * Generate breadcrumb items for states listing page
 */
export function generateStatesListBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "States" },
  ];
}

/**
 * Generate breadcrumb items for categories listing page
 */
export function generateCategoriesListBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Categories" },
  ];
}

/**
 * Generate breadcrumb items for activities listing page
 */
export function generateActivitiesListBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Activities" },
  ];
}

/**
 * Generate breadcrumb items for tours listing page
 */
export function generateToursListBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Home", href: "/" },
    { label: "Tours" },
  ];
}

/**
 * Generate breadcrumb items for admin dashboard
 */
export function generateAdminDashboardBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Admin Dashboard" },
  ];
}

/**
 * Generate breadcrumb items for admin analytics page
 */
export function generateAdminAnalyticsBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Analytics" },
  ];
}

/**
 * Generate breadcrumb items for admin SEO settings page
 */
export function generateAdminSEOSettingsBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "SEO Settings" },
  ];
}

/**
 * Generate breadcrumb items for admin tours management page
 */
export function generateAdminToursBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Tours Management" },
  ];
}

/**
 * Generate breadcrumb items for admin locations management page
 */
export function generateAdminLocationsBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Locations Management" },
  ];
}

/**
 * Generate breadcrumb items for admin states management page
 */
export function generateAdminStatesBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "States Management" },
  ];
}

/**
 * Generate breadcrumb items for admin cities management page
 */
export function generateAdminCitiesBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Cities Management" },
  ];
}

/**
 * Generate breadcrumb items for admin categories management page
 */
export function generateAdminCategoriesBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Categories Management" },
  ];
}

/**
 * Generate breadcrumb items for admin import page
 */
export function generateAdminImportBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "CSV Import" },
  ];
}

/**
 * Generate breadcrumb items for admin feature flags page
 */
export function generateAdminFeatureFlagsBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Feature Flags" },
  ];
}

/**
 * Generate breadcrumb items for admin audit log page
 */
export function generateAdminAuditLogBreadcrumbs(): BreadcrumbItem[] {
  return [
    { label: "Dashboard", href: "/admin" },
    { label: "Audit Log" },
  ];
}
