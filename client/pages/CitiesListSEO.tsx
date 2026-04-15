import { useRoute } from "wouter";
import { useMemo } from "react";
import { trpc } from "@/lib/trpc";
import CitiesList from "./CitiesList";

export default function CitiesListSEO() {
  const [match, params] = useRoute("/states/:stateSlug/cities");
  const stateSlug = params?.stateSlug as string;

  // Fetch state for SEO
  const { data: states } = trpc.states.list.useQuery({ limit: 500 });
  const state = states?.find((s: any) => s.slug === stateSlug);

  // Generate SEO metadata
  const seoData = useMemo(() => {
    if (!state) return null;

    return {
      title: `Cities in ${state.name} | Pikme Tours`,
      description: `Explore cities and destinations in ${state.name}. Discover popular tourist attractions, travel guides, and tour packages for ${state.name}.`,
      keywords: `${state.name} cities, ${state.name} destinations, ${state.name} tourism, travel to ${state.name}, ${state.name} tour packages`,
      canonical: `https://pikme.com/states/${stateSlug}/cities`,
      ogTitle: `Cities in ${state.name}`,
      ogDescription: `Explore cities and destinations in ${state.name}`,
      ogUrl: `https://pikme.com/states/${stateSlug}/cities`,
    };
  }, [state, stateSlug]);

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

  return <CitiesList />;
}
