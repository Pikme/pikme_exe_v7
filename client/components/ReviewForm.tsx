import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

interface ReviewFormProps {
  tourId: number;
  onSuccess?: () => void;
}

export function ReviewForm({ tourId, onSuccess }: ReviewFormProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    title: '',
    text: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createReviewMutation = trpc.reviews.create.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createReviewMutation.mutateAsync({
        tourId,
        rating,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        title: formData.title,
        text: formData.text,
      });

      toast({
        title: 'Success',
        description: 'Review submitted successfully! It will be reviewed before publishing.',
      });

      // Reset form
      setRating(0);
      setFormData({
        guestName: '',
        guestEmail: '',
        title: '',
        text: '',
      });

      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Share Your Experience</CardTitle>
        <CardDescription>Help other travelers by sharing your thoughts about this tour</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    size={32}
                    className={`${
                      star <= (hoveredRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    } transition-colors`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Guest Name */}
          <div className="space-y-2">
            <label htmlFor="guestName" className="text-sm font-medium">
              Your Name *
            </label>
            <Input
              id="guestName"
              placeholder="Enter your name"
              value={formData.guestName}
              onChange={(e) => setFormData({ ...formData, guestName: e.target.value })}
              required
              minLength={2}
              maxLength={255}
            />
          </div>

          {/* Guest Email */}
          <div className="space-y-2">
            <label htmlFor="guestEmail" className="text-sm font-medium">
              Your Email *
            </label>
            <Input
              id="guestEmail"
              type="email"
              placeholder="Enter your email"
              value={formData.guestEmail}
              onChange={(e) => setFormData({ ...formData, guestEmail: e.target.value })}
              required
            />
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Review Title
            </label>
            <Input
              id="title"
              placeholder="Summarize your experience (e.g., 'Amazing trip!')"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              maxLength={255}
            />
          </div>

          {/* Review Text */}
          <div className="space-y-2">
            <label htmlFor="text" className="text-sm font-medium">
              Your Review
            </label>
            <Textarea
              id="text"
              placeholder="Share details about your experience, what you liked, what could be improved, etc."
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
              minLength={10}
              maxLength={5000}
              rows={5}
            />
            <p className="text-xs text-gray-500">
              {formData.text.length}/5000 characters
            </p>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || createReviewMutation.isPending}
            className="w-full"
          >
            {isSubmitting || createReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
          </Button>

          <p className="text-xs text-gray-500">
            Your review will be reviewed before being published on the website.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
