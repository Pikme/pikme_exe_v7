import { Star, ExternalLink } from 'lucide-react';
import { trpc } from '@/lib/trpc';

const defaultReviews = [
  {
    platform: 'Google Reviews',
    starRating: 4.8,
    reviewCount: 150,
    reviewLink: 'https://www.google.com/search?hl=en-IN&gl=in&q=5th,+Pikme,+780,+20th+Main,+Cross,+Bashyam+Circle,+Rajajinagar,+Bengaluru,+Karnataka+560010&ludocid=16503268862997181362&lsig=AB86z5VL0WTwIlLeIuLRk4Caa7m0#lrd=0x3bae17bf9b545b2f:0xe5076397c3b633b2,1',
  },
  {
    platform: 'TrustPilot',
    starRating: 4.7,
    reviewCount: 320,
    reviewLink: 'https://www.trustpilot.com/review/pikme.org',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${
            i < Math.floor(rating)
              ? 'fill-yellow-400 text-yellow-400'
              : i < rating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  );
}

export function ReviewWidgets() {
  const { data: widgets = [] } = trpc.homePageSettings.getAllReviewWidgets.useQuery(undefined, {
    refetchInterval: 5000,
    staleTime: 2000,
  });

  // Use database widgets if available, otherwise use defaults
  const displayWidgets = widgets.length > 0 ? widgets : defaultReviews;

  return (
    <div className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted by Thousands</h3>
          <p className="text-gray-600">See what our customers say about us</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {displayWidgets.map((review) => (
            <div
              key={review.platform}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">{review.platform}</h4>
                  <StarRating rating={review.starRating} />
                </div>
                <span className="text-lg font-bold text-gray-900">{review.starRating}</span>
              </div>

              {review.reviewCount && review.reviewCount > 0 && (
                <p className="text-sm text-gray-600 mb-4">
                  Based on {review.reviewCount.toLocaleString()} reviews
                </p>
              )}

              <a
                href={review.reviewLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
              >
                Read Reviews
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Have a great experience with us? Share your review on any platform
          </p>
        </div>
      </div>
    </div>
  );
}
