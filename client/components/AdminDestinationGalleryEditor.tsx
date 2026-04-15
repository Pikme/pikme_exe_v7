import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function AdminDestinationGalleryEditor() {
  const [cards, setCards] = useState<Array<{
    cardNumber: number;
    imageUrl: string;
    title: string;
    description?: string;
  }>>([
    { cardNumber: 1, imageUrl: '', title: '', description: '' },
    { cardNumber: 2, imageUrl: '', title: '', description: '' },
    { cardNumber: 3, imageUrl: '', title: '', description: '' },
  ]);

  const [isInitialized, setIsInitialized] = useState(false);
  const hasInitializedRef = useRef(false);

  const { data: galleryData = [] } = trpc.homePageSettings.getAllDestinationGallery.useQuery(undefined, {
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const updateMutation = trpc.homePageSettings.updateDestinationGalleryCard.useMutation({
    onSuccess: () => {
      toast.success('Card saved successfully');
    },
    onError: (error) => {
      toast.error('Failed to save card: ' + (error.message || 'Unknown error'));
    },
  });

  // Only initialize cards once from database
  useEffect(() => {
    if (galleryData && galleryData.length > 0 && !hasInitializedRef.current) {
      const updatedCards = cards.map(card => {
        const galleryCard = galleryData.find(g => g.cardNumber === card.cardNumber);
        return galleryCard ? {
          cardNumber: galleryCard.cardNumber,
          imageUrl: galleryCard.imageUrl,
          title: galleryCard.title,
          description: galleryCard.description,
        } : card;
      });
      setCards(updatedCards);
      hasInitializedRef.current = true;
      setIsInitialized(true);
    }
  }, []);

  const handleCardChange = (cardNumber: number, field: string, value: string) => {
    setCards(cards.map(card =>
      card.cardNumber === cardNumber
        ? { ...card, [field]: value }
        : card
    ));
  };

  const handleSaveCard = async (cardNumber: number) => {
    const card = cards.find(c => c.cardNumber === cardNumber);
    if (!card || !card.imageUrl || !card.title) {
      toast.error('Image URL and Title are required');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        cardNumber,
        imageUrl: card.imageUrl,
        title: card.title,
        description: card.description,
      });
    } catch (error) {
      console.error('Error saving card:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-600 mb-4">
        <p>Edit the 3 destination gallery cards that appear in the lower body section of the homepage.</p>
      </div>

      {cards.map((card) => (
        <Card key={card.cardNumber}>
          <CardHeader>
            <CardTitle>Card {card.cardNumber}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Image URL *</label>
                <Input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={card.imageUrl}
                  onChange={(e) => handleCardChange(card.cardNumber, 'imageUrl', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  type="text"
                  placeholder="Destination title"
                  value={card.title}
                  onChange={(e) => handleCardChange(card.cardNumber, 'title', e.target.value)}
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  placeholder="Destination description"
                  value={card.description || ''}
                  onChange={(e) => handleCardChange(card.cardNumber, 'description', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Image Preview */}
            {card.imageUrl && (
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2">Preview</label>
                <div className="w-full h-40 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={card.imageUrl}
                    alt={card.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x160?text=Invalid+URL';
                    }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={() => handleSaveCard(card.cardNumber)}
              disabled={updateMutation.isPending}
              className="w-full"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Card'
              )}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
