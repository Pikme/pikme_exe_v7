import { useRoute } from 'wouter';
import { trpc } from '@/lib/trpc';
import { useEffect } from 'react';
import { PublicLayout } from '@/components/PublicLayout';

export default function StateDetail() {
  const [match, params] = useRoute('/states/:slug');
  const slug = params?.slug as string;

  // Use the new getBySlugAnyCountry query that searches across all countries
  const { data: state, isLoading, error } = trpc.states.getBySlugAnyCountry.useQuery(
    { slug },
    { enabled: !!slug }
  );

  // Fetch tours for this state
  const { data: tours } = trpc.tours.list.useQuery(
    { limit: 100 },
    { enabled: !!state?.id }
  );

  // Update document title and meta tags
  useEffect(() => {
    if (state) {
      document.title = state.metaTitle || `${state.name} Tours`;
      
      // Update or create meta description
      let descMeta = document.querySelector('meta[name="description"]');
      if (!descMeta) {
        descMeta = document.createElement('meta');
        descMeta.setAttribute('name', 'description');
        document.head.appendChild(descMeta);
      }
      descMeta.setAttribute('content', state.metaDescription || `Explore tours in ${state.name}`);
      
      // Update or create meta keywords
      let keywordsMeta = document.querySelector('meta[name="keywords"]');
      if (!keywordsMeta) {
        keywordsMeta = document.createElement('meta');
        keywordsMeta.setAttribute('name', 'keywords');
        document.head.appendChild(keywordsMeta);
      }
      keywordsMeta.setAttribute('content', state.metaKeywords || `${state.name} tours`);
    }
  }, [state]);

  if (!match) return null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading state details...</p>
        </div>
      </div>
    );
  }

  if (error || !state) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-8">State not found</p>
          <a href="/states" className="text-red-600 hover:text-red-800 font-semibold">
            Back to States
          </a>
        </div>
      </div>
    );
  }

  // Filter tours for this state
  const stateTours = tours?.filter(tour => tour.stateId === state.id) || [];

  return (
    <PublicLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">{state.name}</h1>
          <p className="text-xl opacity-90">Explore amazing tours and experiences</p>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-200 py-4">
        <div className="container mx-auto px-4">
          <a href="/" className="text-red-600 hover:text-red-800">Home</a>
          {' / '}
          <a href="/states" className="text-red-600 hover:text-red-800">States</a>
          {' / '}
          <span className="text-gray-600">{state.name}</span>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {state.description && (
          <div className="mb-12 bg-white p-8 rounded-lg shadow">
            <p className="text-gray-700 text-lg leading-relaxed">{state.description}</p>
          </div>
        )}

        {/* Tours Section */}
        <div>
          <h2 className="text-3xl font-bold mb-8">Tours in {state.name}</h2>
          
          {stateTours.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stateTours.map((tour) => (
                <div key={tour.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
                  {tour.image && (
                    <img
                      src={tour.image}
                      alt={tour.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-4">
                    <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2">{tour.description}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-red-600">₹{tour.price}</span>
                      <a
                        href={`/tour/${tour.slug}`}
                        className="text-red-600 hover:text-red-800 font-semibold"
                      >
                        View Details →
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg">
              <p className="text-gray-600 text-lg">No tours found in this state.</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </PublicLayout>
  );
}
