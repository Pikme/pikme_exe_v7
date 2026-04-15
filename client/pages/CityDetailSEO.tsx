import { useRoute } from "wouter";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import CityDetail from "./CityDetail";

export default function CityDetailSEO() {
  const [match, params] = useRoute("/states/:stateSlug/cities/:citySlug");
  const stateSlug = params?.stateSlug as string;
  const citySlug = params?.citySlug as string;

  // Fetch state and city for SEO
  const { data: states } = trpc.states.list.useQuery({ limit: 500 });
  const state = states?.find((s: any) => s.slug === stateSlug);

  const { data: cities } = trpc.locations.listByState.useQuery(
    { stateId: state?.id || 0, limit: 500 },
    { enabled: !!state }
  );
  const city = cities?.find((c: any) => c.slug === citySlug);

  // Generate SEO metadata
  const seoData = useMemo(() => {
    if (!state || !city) return null;

    return {
      title: `${city.name} Tours in ${state.name} | Pikme Tours`,
      description: city.metaDescription || `Explore tours and travel packages in ${city.name}, ${state.name}. Discover the best attractions and activities.`,
      keywords: city.metaKeywords || `${city.name} tours, ${city.name} travel, ${city.name} packages, ${state.name} tourism`,
      canonical: `https://pikme.com/states/${stateSlug}/cities/${citySlug}`,
      ogTitle: `${city.name} Tours | ${state.name}`,
      ogDescription: city.metaDescription || `Explore tours in ${city.name}`,
      ogUrl: `https://pikme.com/states/${stateSlug}/cities/${citySlug}`,
    };
  }, [state, city, stateSlug, citySlug]);

  if (!match) return null;

  // Update document head
  if (seoData) {
    if (typeof document !== "undefined") {
      document.title = seoData.title;

      // Update or create meta tags
      const updateMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("name", name);
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
      };

      const updateOgMeta = (property: string, content: string) => {
        let meta = document.querySelector(`meta[property="${property}"]`);
        if (!meta) {
          meta = document.createElement("meta");
          meta.setAttribute("property", property);
          document.head.appendChild(meta);
        }
        meta.setAttribute("content", content);
      };

      updateMeta("description", seoData.description);
      updateMeta("keywords", seoData.keywords);
      updateOgMeta("og:title", seoData.ogTitle);
      updateOgMeta("og:description", seoData.ogDescription);
      updateOgMeta("og:url", seoData.ogUrl);

      // Update canonical
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", seoData.canonical);
    }
  }

  return <CityDetail />;
}
