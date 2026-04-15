import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { useToast } from '@/hooks/use-toast';

interface BookingFormProps {
  tourId: number;
  tourName: string;
  tourPrice: number;
  onSuccess?: (bookingId: number) => void;
}

export function BookingForm({ tourId, tourName, tourPrice, onSuccess }: BookingFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    guestName: '',
    guestEmail: '',
    guestPhone: '',
    numberOfGuests: 1,
    startDate: '',
    endDate: '',
    specialRequests: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createBookingMutation = trpc.bookings.create.useMutation();

  const totalPrice = tourPrice * formData.numberOfGuests;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate) {
      toast({
        title: 'Error',
        description: 'Please select a start date',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createBookingMutation.mutateAsync({
        tourId,
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone,
        numberOfGuests: formData.numberOfGuests,
        startDate: formData.startDate,
        endDate: formData.endDate,
        totalPrice,
        specialRequests: formData.specialRequests,
      });

      toast({
        title: 'Success',
        description: 'Booking created successfully! Proceeding to payment...',
      });

      onSuccess?.(result.bookingId);

      // Reset form
      setFormData({
        guestName: '',
        guestEmail: '',
        guestPhone: '',
        numberOfGuests: 1,
        startDate: '',
        endDate: '',
        specialRequests: '',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Book {tourName}</CardTitle>
        <CardDescription>Complete your tour reservation</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Guest Name */}
          <div className="space-y-2">
            <label htmlFor="guestName" className="text-sm font-medium">
              Full Name *
            </label>
            <Input
              id="guestName"
              placeholder="Enter your full name"
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
              Email Address *
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

          {/* Guest Phone */}
          <div className="space-y-2">
            <label htmlFor="guestPhone" className="text-sm font-medium">
              Phone Number
            </label>
            <Input
              id="guestPhone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.guestPhone}
              onChange={(e) => setFormData({ ...formData, guestPhone: e.target.value })}
              maxLength={20}
            />
          </div>

          {/* Number of Guests */}
          <div className="space-y-2">
            <label htmlFor="numberOfGuests" className="text-sm font-medium">
              Number of Guests *
            </label>
            <Input
              id="numberOfGuests"
              type="number"
              min="1"
              value={formData.numberOfGuests}
              onChange={(e) =>
                setFormData({ ...formData, numberOfGuests: parseInt(e.target.value) || 1 })
              }
              required
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              Start Date *
            </label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
          </div>

          {/* End Date */}
          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              End Date
            </label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>

          {/* Special Requests */}
          <div className="space-y-2">
            <label htmlFor="specialRequests" className="text-sm font-medium">
              Special Requests
            </label>
            <Textarea
              id="specialRequests"
              placeholder="Any special requests or dietary requirements?"
              value={formData.specialRequests}
              onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
              maxLength={5000}
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <Card className="bg-blue-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Price per person:</span>
                  <span className="font-semibold">₹{tourPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Number of guests:</span>
                  <span className="font-semibold">{formData.numberOfGuests}</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-lg">
                  <span>Total Price:</span>
                  <span className="font-bold text-blue-600">₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || createBookingMutation.isPending}
            className="w-full"
            size="lg"
          >
            {isSubmitting || createBookingMutation.isPending
              ? 'Processing...'
              : 'Proceed to Payment'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            You will be redirected to our secure payment gateway to complete your booking.
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
