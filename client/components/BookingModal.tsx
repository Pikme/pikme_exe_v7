import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: number;
  tourName: string;
}

export function BookingModal({ isOpen, onClose, tourId, tourName }: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    country: "",
    numberOfTravelers: 1,
    preferredStartDate: "",
    preferredEndDate: "",
    specialRequests: "",
  });

  const createEnquiryMutation = trpc.bookingEnquiries.create.useMutation({
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Your booking enquiry has been sent successfully. We will contact you soon!",
      });
      resetForm();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking enquiry",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "numberOfTravelers" ? parseInt(value) || 1 : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      country: "",
      numberOfTravelers: 1,
      preferredStartDate: "",
      preferredEndDate: "",
      specialRequests: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await createEnquiryMutation.mutateAsync({
        tourId,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        numberOfTravelers: formData.numberOfTravelers,
        preferredStartDate: formData.preferredStartDate,
        preferredEndDate: formData.preferredEndDate,
        specialRequests: formData.specialRequests,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Book {tourName}</DialogTitle>
          <DialogDescription>
            Fill in your details below and we'll get back to you with pricing and availability
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Personal Information */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-sm">Personal Information</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  placeholder="John"
                />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                placeholder="United States"
              />
            </div>
          </div>

          {/* Travel Details */}
          <div className="space-y-3 border-b pb-4">
            <h3 className="font-semibold text-sm">Travel Details</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="numberOfTravelers">Number of Travelers *</Label>
                <Input
                  id="numberOfTravelers"
                  name="numberOfTravelers"
                  type="number"
                  min="1"
                  value={formData.numberOfTravelers}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="preferredStartDate">Preferred Start Date</Label>
                <Input
                  id="preferredStartDate"
                  name="preferredStartDate"
                  type="date"
                  value={formData.preferredStartDate}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="preferredEndDate">Preferred End Date</Label>
                <Input
                  id="preferredEndDate"
                  name="preferredEndDate"
                  type="date"
                  value={formData.preferredEndDate}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Additional Information</h3>
            <div>
              <Label htmlFor="specialRequests">Special Requests or Questions</Label>
              <Textarea
                id="specialRequests"
                name="specialRequests"
                value={formData.specialRequests}
                onChange={handleInputChange}
                placeholder="Tell us about any special requirements, dietary restrictions, or questions..."
                rows={4}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? "Submitting..." : "Send Enquiry"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
