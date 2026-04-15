import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Trash2, Star } from 'lucide-react';

export function AdminReviewWidgetsEditor() {
  const [platform, setPlatform] = useState('');
  const [starRating, setStarRating] = useState('5');
  const [reviewCount, setReviewCount] = useState('0');
  const [reviewLink, setReviewLink] = useState('');
  const [editingPlatform, setEditingPlatform] = useState<string | null>(null);

  const { data: widgets = [], refetch } = trpc.homePageSettings.getAllReviewWidgets.useQuery(undefined, {
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const createMutation = trpc.homePageSettings.createOrUpdateReviewWidget.useMutation({
    onSuccess: () => {
      setPlatform('');
      setStarRating('5');
      setReviewCount('0');
      setReviewLink('');
      setEditingPlatform(null);
      refetch();
    },
  });

  const deleteMutation = trpc.homePageSettings.deleteReviewWidget.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!platform || !reviewLink) {
      alert('Platform and Review Link are required');
      return;
    }

    await createMutation.mutateAsync({
      platform,
      starRating: parseFloat(starRating),
      reviewCount: parseInt(reviewCount),
      reviewLink,
    });
  };

  const handleEdit = (widget: any) => {
    setPlatform(widget.platform);
    setStarRating(widget.starRating.toString());
    setReviewCount(widget.reviewCount.toString());
    setReviewLink(widget.reviewLink);
    setEditingPlatform(widget.platform);
  };

  const handleDelete = (platform: string) => {
    if (confirm('Are you sure you want to delete this review widget?')) {
      deleteMutation.mutate({ platform });
    }
  };

  const renderStars = (rating: number) => {
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
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingPlatform ? 'Edit Review Widget' : 'Add New Review Widget'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Platform Name *</label>
              <Input
                type="text"
                placeholder="e.g., Google Reviews, TrustPilot"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                disabled={editingPlatform !== null}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Star Rating (0-5) *</label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  placeholder="4.8"
                  value={starRating}
                  onChange={(e) => setStarRating(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Review Count</label>
                <Input
                  type="number"
                  min="0"
                  placeholder="150"
                  value={reviewCount}
                  onChange={(e) => setReviewCount(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Review Link *</label>
              <Input
                type="url"
                placeholder="https://example.com/reviews"
                value={reviewLink}
                onChange={(e) => setReviewLink(e.target.value)}
                required
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending}>
                {editingPlatform ? 'Update' : 'Add'} Widget
              </Button>
              {editingPlatform && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPlatform('');
                    setStarRating('5');
                    setReviewCount('0');
                    setReviewLink('');
                    setEditingPlatform(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review Widgets ({widgets.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {widgets.length === 0 ? (
            <p className="text-gray-500">No review widgets yet</p>
          ) : (
            <div className="space-y-4">
              {widgets.map((widget) => (
                <div key={widget.platform} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-grow">
                    <h3 className="font-semibold">{widget.platform}</h3>
                    <div className="flex items-center gap-2 mt-2">
                      {renderStars(widget.starRating)}
                      <span className="font-bold">{widget.starRating}</span>
                    </div>
                    {widget.reviewCount > 0 && (
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {widget.reviewCount.toLocaleString()} reviews
                      </p>
                    )}
                    <a
                      href={widget.reviewLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
                    >
                      View Reviews →
                    </a>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(widget)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(widget.platform)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
