import { useState, ReactNode } from 'react';
import { ChevronDown, ChevronUp, Code2, Map, Filter, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { PublicLayout } from '@/components/PublicLayout';

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const CollapsibleSection = ({ title, icon, children }: SectionProps) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="mb-8 border border-border rounded-lg overflow-hidden bg-card">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="text-primary">{icon}</div>
          <h2 className="text-xl font-bold text-foreground">{title}</h2>
        </div>
        {isOpen ? <ChevronUp className="text-primary" /> : <ChevronDown className="text-primary" />}
      </button>
      {isOpen && <div className="px-6 py-6 border-t border-border">{children}</div>}
    </div>
  );
};

const CodeBlock = ({ code, language = 'json' }: { code: string; language?: string }) => (
  <pre className="bg-muted p-4 rounded-lg overflow-x-auto border border-border my-4">
    <code className={`text-sm text-muted-foreground font-mono`}>{code}</code>
  </pre>
);

const FeatureCard = ({ title, description, status }: { title: string; description: string; status: 'completed' | 'in-progress' | 'planned' }) => {
  const statusConfig = {
    completed: { bg: 'bg-green-50 dark:bg-green-950', border: 'border-green-200 dark:border-green-800', icon: <CheckCircle2 className="text-green-600" size={20} /> },
    'in-progress': { bg: 'bg-red-50 dark:bg-red-950', border: 'border-red-200 dark:border-red-800', icon: <Zap className="text-red-600" size={20} /> },
    planned: { bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800', icon: <AlertCircle className="text-amber-600" size={20} /> },
  };

  const config = statusConfig[status];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-4 mb-4`}>
      <div className="flex items-start gap-3">
        <div className="mt-1">{config.icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-foreground mb-1">{title}</h4>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
};

export function SEOEnhancementGuide() {
  return (
    <PublicLayout>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-primary/20 via-primary/10 to-background py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              SEO Enhancement Roadmap
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Strategic improvements to boost search visibility, user engagement, and organic traffic for Pikme
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-2">654</div>
                <p className="text-sm text-muted-foreground">Destination URLs (Countries + States)</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-2">3,206</div>
                <p className="text-sm text-muted-foreground">Activity Pages Indexed</p>
              </div>
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="text-2xl font-bold text-primary mb-2">4</div>
                <p className="text-sm text-muted-foreground">Active Sitemaps</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb Schema Section */}
          <CollapsibleSection
            title="1. Breadcrumb Schema Markup"
            icon={<Code2 size={24} />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Overview</h3>
                <p className="text-muted-foreground mb-4">
                  Breadcrumb schema markup helps search engines understand your site's hierarchical structure and enables breadcrumb display in search results. This improves CTR and user navigation.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Current Status</h3>
                <FeatureCard
                  title="Breadcrumb Schema Implementation"
                  description="JSON-LD breadcrumb structured data already implemented on destination pages"
                  status="completed"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Implementation Details</h3>
                <p className="text-muted-foreground mb-4">
                  The breadcrumb schema is automatically generated for all destination pages following this hierarchy:
                </p>
                <ul className="space-y-2 text-muted-foreground mb-4">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Home</strong> → Destinations landing page</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>Country</strong> → /destinations/{'{country-slug}'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>State</strong> → /destinations/{'{country-slug}'}/{'{state-slug}'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span><strong>City</strong> → /destinations/{'{country-slug}'}/{'{state-slug}'}/{'{city-slug}'}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Example 1: Country-Level Breadcrumb</h3>
                <p className="text-sm text-muted-foreground mb-3">For destination pages at the country level:</p>
                <CodeBlock
                  code={`{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pikmepseo-bsflart4.manus.space"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Destinations",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "India",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations/india"
    }
  ]
}`}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Example 2: State-Level Breadcrumb</h3>
                <p className="text-sm text-muted-foreground mb-3">For destination pages at the state level:</p>
                <CodeBlock
                  code={`{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pikmepseo-bsflart4.manus.space"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Destinations",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "India",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations/india"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Kerala",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations/india/kerala"
    }
  ]
}`}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Example 3: City-Level Breadcrumb</h3>
                <p className="text-sm text-muted-foreground mb-3">For destination pages at the city level (deepest hierarchy):</p>
                <CodeBlock
                  code={`{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://pikmepseo-bsflart4.manus.space"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Destinations",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "India",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations/india"
    },
    {
      "@type": "ListItem",
      "position": 4,
      "name": "Kerala",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations/india/kerala"
    },
    {
      "@type": "ListItem",
      "position": 5,
      "name": "Kochi",
      "item": "https://pikmepseo-bsflart4.manus.space/destinations/india/kerala/kochi"
    }
  ]
}`}
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Implementation Guide</h3>
                <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-foreground mb-2">How to Add to Your Pages:</h4>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal list-inside">
                    <li>Add a <code className="bg-muted px-2 py-1 rounded text-xs font-mono">&lt;script type="application/ld+json"&gt;</code> tag in the page head</li>
                    <li>Paste the appropriate JSON-LD example based on your page level</li>
                    <li>Replace placeholder values with actual page titles and URLs</li>
                    <li>Ensure the "position" field increments sequentially</li>
                    <li>Test with <a href="https://search.google.com/test/rich-results" target="_blank" className="text-primary hover:underline">Google Rich Results Test</a></li>
                  </ol>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">React Component Example</h3>
                <p className="text-sm text-muted-foreground mb-3">Example of how to render breadcrumb schema in a React component:</p>
                <CodeBlock
                  code={`import { Helmet } from 'react-helmet';

function DestinationPage({ country, state, city }) {
  const breadcrumbItems = [
    { position: 1, name: 'Home', url: 'https://pikmepseo-bsflart4.manus.space' },
    { position: 2, name: 'Destinations', url: 'https://pikmepseo-bsflart4.manus.space/destinations' }
  ];

  if (country) {
    breadcrumbItems.push({
      position: 3,
      name: country.name,
      url: 'https://pikmepseo-bsflart4.manus.space/destinations/' + country.slug
    });
  }

  if (state && country) {
    breadcrumbItems.push({
      position: 4,
      name: state.name,
      url: 'https://pikmepseo-bsflart4.manus.space/destinations/' + country.slug + '/' + state.slug
    });
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map(item => ({
      '@type': 'ListItem',
      position: item.position,
      name: item.name,
      item: item.url
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
}`}
                  language="jsx"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Validation & Testing</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Test with <a href="https://search.google.com/test/rich-results" target="_blank" className="text-primary hover:underline">Google Rich Results Test</a> to validate schema markup</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Verify breadcrumb display in Google Search Console under "Enhancements"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Monitor CTR improvements in Search Console over 30 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">✓</span>
                    <span>Use <a href="https://schema.org/BreadcrumbList" target="_blank" className="text-primary hover:underline">Schema.org BreadcrumbList documentation</a> for reference</span>
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* City Detail Pages Section */}
          <CollapsibleSection
            title="2. City Detail Pages Implementation"
            icon={<Map size={24} />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Overview</h3>
                <p className="text-muted-foreground mb-4">
                  Create dedicated landing pages for major cities with rich content, images, and related tours. This expands your crawlable content, improves keyword targeting, and provides better user experience.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Current Status</h3>
                <FeatureCard
                  title="City Detail Pages"
                  description="Basic city pages implemented with loading skeletons and featured tours section"
                  status="in-progress"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Recommended Content Structure</h3>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Hero Section</h4>
                    <p className="text-sm text-muted-foreground">High-quality city image with overlay text, city name, and tagline</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Quick Facts</h4>
                    <p className="text-sm text-muted-foreground">Best time to visit, climate, altitude, distance from major cities</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">About Section</h4>
                    <p className="text-sm text-muted-foreground">200-300 word description of city's attractions, culture, and significance</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Featured Tours</h4>
                    <p className="text-sm text-muted-foreground">3-6 recommended tours with images, prices, and duration</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Things to Do</h4>
                    <p className="text-sm text-muted-foreground">Activity categories available in this city with images</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Gallery</h4>
                    <p className="text-sm text-muted-foreground">6-12 high-quality images showcasing city attractions</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Related Destinations</h4>
                    <p className="text-sm text-muted-foreground">Nearby cities and states for extended trips</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Implementation Priority</h3>
                <div className="space-y-3">
                  <FeatureCard
                    title="Phase 1: Top 20 Cities"
                    description="Chiang Mai, Bangkok, Phuket, Bali, Delhi, Mumbai, Goa, Jaipur, Kerala, Rajasthan"
                    status="planned"
                  />
                  <FeatureCard
                    title="Phase 2: Next 50 Cities"
                    description="Medium-traffic cities with good tour availability"
                    status="planned"
                  />
                  <FeatureCard
                    title="Phase 3: Remaining Cities"
                    description="All cities with at least 3 tours or activities"
                    status="planned"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">SEO Benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Target long-tail keywords like "things to do in Chiang Mai"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Increase internal linking opportunities</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Improve user engagement and time on site</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Create rich snippets and featured snippets opportunities</span>
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Tour Search Filters Section */}
          <CollapsibleSection
            title="3. Advanced Tour Search Filters"
            icon={<Filter size={24} />}
          >
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Overview</h3>
                <p className="text-muted-foreground mb-4">
                  Implement advanced filtering capabilities to help users find tours matching their preferences. This improves user experience, increases conversion rates, and creates more indexable content variations.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Current Status</h3>
                <FeatureCard
                  title="Basic Tour Listing"
                  description="Tours page with basic display and sorting capabilities"
                  status="completed"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Recommended Filter Features</h3>
                <div className="space-y-3">
                  <FeatureCard
                    title="💰 Price Range Filter"
                    description="Allow users to filter tours by price range (₹5,000-₹50,000+). Helps budget-conscious users find suitable tours, increases conversion"
                    status="planned"
                  />
                  <FeatureCard
                    title="⏱️ Duration Filter"
                    description="Filter by trip length (1-3 days, 4-7 days, 8-14 days, 15+ days). Users can quickly find tours matching their available time"
                    status="planned"
                  />
                  <FeatureCard
                    title="🎯 Difficulty Level Filter"
                    description="Filter by difficulty (Easy, Moderate, Challenging, Extreme). Helps users find tours matching their fitness level"
                    status="planned"
                  />
                  <FeatureCard
                    title="⭐ Rating Filter"
                    description="Filter by minimum rating (4+, 4.5+, 5 stars). Users can find highly-rated tours, builds trust"
                    status="planned"
                  />
                  <FeatureCard
                    title="🏷️ Category Filter"
                    description="Filter by activity type (Adventure, Beach, Cultural, Spiritual, etc.). Users find tours matching their interests"
                    status="planned"
                  />
                  <FeatureCard
                    title="📍 Destination Filter"
                    description="Filter by country, state, or city. Users can explore tours in specific regions"
                    status="planned"
                  />
                  <FeatureCard
                    title="📅 Season Filter"
                    description="Filter by best season (Spring, Summer, Monsoon, Winter). Users find tours available during their preferred season"
                    status="planned"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">Implementation Approach</h3>
                <div className="space-y-3">
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 1: Database Schema Update</h4>
                    <p className="text-sm text-muted-foreground">Add filter fields to tours table: difficulty, season, estimated_rating</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 2: Backend Procedures</h4>
                    <p className="text-sm text-muted-foreground">Create tRPC procedures for filtered tour queries with pagination</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 3: Frontend Components</h4>
                    <p className="text-sm text-muted-foreground">Build filter UI with checkboxes, sliders, and dropdowns</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-semibold text-foreground mb-2">Step 4: URL Parameters</h4>
                    <p className="text-sm text-muted-foreground">Implement URL-based filtering for shareable filter combinations</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-foreground mb-3">SEO Benefits</h3>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Create unique filtered pages for long-tail keywords</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Improve user engagement metrics (lower bounce rate)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Increase time on site and pages per session</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">→</span>
                    <span>Generate shareable filter URLs for social media</span>
                  </li>
                </ul>
              </div>
            </div>
          </CollapsibleSection>

          {/* Implementation Timeline */}
          <div className="mt-12 bg-gradient-to-r from-primary/10 to-primary/5 border border-border rounded-lg p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Recommended Implementation Timeline</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">1</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Week 1-2: City Detail Pages (Top 20)</h3>
                  <p className="text-sm text-muted-foreground">Create city pages for high-traffic destinations with complete content structure</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">2</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Week 3-4: Tour Search Filters</h3>
                  <p className="text-sm text-muted-foreground">Implement price, duration, and difficulty filters with URL parameters</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">3</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Week 5-6: Expand City Pages</h3>
                  <p className="text-sm text-muted-foreground">Create pages for remaining 50+ cities with automated content generation</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">4</div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">Week 7-8: Monitoring & Optimization</h3>
                  <p className="text-sm text-muted-foreground">Monitor rankings, user engagement, and iterate based on analytics</p>
                </div>
              </div>
            </div>
          </div>

          {/* Expected Results */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">Expected Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Organic Traffic</h3>
                    <p className="text-sm text-muted-foreground">30-50% increase in organic traffic from long-tail keywords targeting specific cities and tour types</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Keyword Rankings</h3>
                    <p className="text-sm text-muted-foreground">Top 10 rankings for 50+ new long-tail keywords related to cities and tour types</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">👥</span>
                  <div>
                    <h3 className="font-semibold text-foreground">User Engagement</h3>
                    <p className="text-sm text-muted-foreground">25-40% improvement in average session duration and pages per session</p>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">💰</span>
                  <div>
                    <h3 className="font-semibold text-foreground">Conversion Rate</h3>
                    <p className="text-sm text-muted-foreground">15-25% improvement in tour booking rate through better user targeting</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="mt-12 bg-gradient-to-r from-primary to-primary/80 rounded-lg p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-3">Ready to Implement?</h2>
            <p className="mb-6 opacity-90">
              These SEO enhancements are designed to significantly boost your organic visibility and user engagement. Start with city detail pages and tour filters to see immediate improvements.
            </p>
            <a href="#" className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors">
              Contact for Implementation
            </a>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
}
