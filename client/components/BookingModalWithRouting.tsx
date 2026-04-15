import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  tourId: number;
  tourName: string;
}

interface RoutingStatus {
  applied: boolean;
  assignedToUserId?: number;
  assignedToName?: string;
  score?: number;
  error?: string;
  loading: boolean;
}

export function BookingModalWithRouting({
  isOpen,
  onClose,
  tourId,
  tourName,
}: BookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routingStatus, setRoutingStatus] = useState<RoutingStatus>({
    applied: false,
    loading: false,
  });
  const [manualOverride, setManualOverride] = useState<string>("");
  const [showManualOverride, setShowManualOverride] = useState(false);

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

  // Fetch team members for manual override
  const { data: teamMembers } = trpc.routing.getTeamMembers.useQuery(undefined, {
    enabled: showManualOverride,
  });

  const createEnquiryMutation = trpc.bookingEnquiries.create.useMutation({
    onSuccess: (data: any) => {
      // Extract routing information from response
      const routingInfo = data.autoRoutingApplied
        ? `automatically assigned to ${data.assignedToUserName || "a team member"} (score: ${data.routingScore?.toFixed(1) || "N/A"})`
        : data.routingError
          ? `routing failed: ${data.routingError}`
          : "no automatic routing applied";

      toast({
        title: "Success",
        description: `Your booking enquiry has been sent successfully and ${routingInfo}. We will contact you soon!`,
      });

      // Update routing status display
      if (data.autoRoutingApplied) {
        setRoutingStatus({
          applied: true,
          assignedToUserId: data.assignedToUserId,
          assignedToName: data.assignedToUserName,
          score: data.routingScore,
          loading: false,
        });
      }

      resetForm();
      setTimeout(onClose, 2000);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit booking enquiry",
        variant: "destructive",
      });
      setRoutingStatus({
        applied: false,
        error: error.message,
        loading: false,
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
    setRoutingStatus({ applied: false, loading: false });
    setManualOverride("");
    setShowManualOverride(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setRoutingStatus({ applied: false, loading: true });

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
        manualAssignmentUserId: manualOverride ? parseInt(manualOverride) : undefined,
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
            Fill in your details below and we'll automatically assign your enquiry to the best team
            member
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
          <div className="space-y-3 border-b pb-4">
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

          {/* Routing Status Display */}
          {routingStatus.loading && (
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
                  <div>
                    <p className="font-medium text-blue-900">Routing enquiry...</p>
                    <p className="text-sm text-blue-700">
                      Finding the best team member for your request
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {routingStatus.applied && !routingStatus.loading && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-900">Auto-routed successfully</p>
                    <p className="text-sm text-green-700">
                      Assigned to {routingStatus.assignedToName} (match score:{" "}
                      {routingStatus.score?.toFixed(1) || "N/A"}%)
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {routingStatus.error && !routingStatus.loading && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  <div>
                    <p className="font-medium text-amber-900">Routing unavailable</p>
                    <p className="text-sm text-amber-700">{routingStatus.error}</p>
                    <button
                      type="button"
                      onClick={() => setShowManualOverride(!showManualOverride)}
                      className="text-sm text-amber-700 underline hover:text-amber-800 mt-1"
                    >
                      {showManualOverride ? "Hide" : "Assign manually"}
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Manual Override Section */}
          {showManualOverride && (
            <Card className="bg-gray-50 border-gray-200">
              <CardHeader>
                <CardTitle className="text-sm">Manual Assignment</CardTitle>
                <CardDescription>
                  Optionally assign this enquiry to a specific team member
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={manualOverride} onValueChange={setManualOverride}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers?.map((member: any) => (
                      <SelectItem key={member.id} value={member.id.toString()}>
                        {member.name} ({member.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

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
