import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export function NotificationSettingsPage() {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  // Fetch preferences
  const { data: preferences, isLoading } = trpc.notifications.getPreferences.useQuery();

  // Update preferences mutation
  const updatePreferencesMutation = trpc.notifications.updatePreferences.useMutation({
    onSuccess: () => {
      setIsSaving(false);
      toast({
        title: "Success",
        description: "Notification preferences updated",
      });
    },
    onError: (error) => {
      setIsSaving(false);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const [formData, setFormData] = useState({
    enquiryAssignedEmail: true,
    enquiryAssignedInApp: true,
    enquiryUpdatedEmail: true,
    enquiryUpdatedInApp: true,
    enquiryCompletedEmail: false,
    enquiryCompletedInApp: true,
    teamMessageEmail: true,
    teamMessageInApp: true,
    systemAlertEmail: false,
    systemAlertInApp: true,
    quietHoursStart: "",
    quietHoursEnd: "",
  });

  // Initialize form with preferences
  useEffect(() => {
    if (preferences) {
      setFormData({
        enquiryAssignedEmail: preferences.enquiryAssignedEmail ?? true,
        enquiryAssignedInApp: preferences.enquiryAssignedInApp ?? true,
        enquiryUpdatedEmail: preferences.enquiryUpdatedEmail ?? true,
        enquiryUpdatedInApp: preferences.enquiryUpdatedInApp ?? true,
        enquiryCompletedEmail: preferences.enquiryCompletedEmail ?? false,
        enquiryCompletedInApp: preferences.enquiryCompletedInApp ?? true,
        teamMessageEmail: preferences.teamMessageEmail ?? true,
        teamMessageInApp: preferences.teamMessageInApp ?? true,
        systemAlertEmail: preferences.systemAlertEmail ?? false,
        systemAlertInApp: preferences.systemAlertInApp ?? true,
        quietHoursStart: preferences.quietHoursStart || "",
        quietHoursEnd: preferences.quietHoursEnd || "",
      });
    }
  }, [preferences]);

  const handleToggle = (key: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };

  const handleTimeChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    await updatePreferencesMutation.mutateAsync(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-red-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Notification Settings</h1>
          <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
        </div>

        {/* Enquiry Assigned */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Enquiry Assigned</CardTitle>
            <CardDescription>Notifications when new enquiries are assigned to you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enquiryAssignedEmail">Email notifications</Label>
              <Switch
                id="enquiryAssignedEmail"
                checked={formData.enquiryAssignedEmail}
                onCheckedChange={() => handleToggle("enquiryAssignedEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enquiryAssignedInApp">In-app notifications</Label>
              <Switch
                id="enquiryAssignedInApp"
                checked={formData.enquiryAssignedInApp}
                onCheckedChange={() => handleToggle("enquiryAssignedInApp")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enquiry Updated */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Enquiry Updated</CardTitle>
            <CardDescription>Notifications when enquiries you're handling are updated</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enquiryUpdatedEmail">Email notifications</Label>
              <Switch
                id="enquiryUpdatedEmail"
                checked={formData.enquiryUpdatedEmail}
                onCheckedChange={() => handleToggle("enquiryUpdatedEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enquiryUpdatedInApp">In-app notifications</Label>
              <Switch
                id="enquiryUpdatedInApp"
                checked={formData.enquiryUpdatedInApp}
                onCheckedChange={() => handleToggle("enquiryUpdatedInApp")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Enquiry Completed */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Enquiry Completed</CardTitle>
            <CardDescription>Notifications when enquiries are converted to bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="enquiryCompletedEmail">Email notifications</Label>
              <Switch
                id="enquiryCompletedEmail"
                checked={formData.enquiryCompletedEmail}
                onCheckedChange={() => handleToggle("enquiryCompletedEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="enquiryCompletedInApp">In-app notifications</Label>
              <Switch
                id="enquiryCompletedInApp"
                checked={formData.enquiryCompletedInApp}
                onCheckedChange={() => handleToggle("enquiryCompletedInApp")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Team Message */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Team Messages</CardTitle>
            <CardDescription>Notifications for team communications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="teamMessageEmail">Email notifications</Label>
              <Switch
                id="teamMessageEmail"
                checked={formData.teamMessageEmail}
                onCheckedChange={() => handleToggle("teamMessageEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="teamMessageInApp">In-app notifications</Label>
              <Switch
                id="teamMessageInApp"
                checked={formData.teamMessageInApp}
                onCheckedChange={() => handleToggle("teamMessageInApp")}
              />
            </div>
          </CardContent>
        </Card>

        {/* System Alerts */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">System Alerts</CardTitle>
            <CardDescription>Important system notifications and maintenance alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="systemAlertEmail">Email notifications</Label>
              <Switch
                id="systemAlertEmail"
                checked={formData.systemAlertEmail}
                onCheckedChange={() => handleToggle("systemAlertEmail")}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="systemAlertInApp">In-app notifications</Label>
              <Switch
                id="systemAlertInApp"
                checked={formData.systemAlertInApp}
                onCheckedChange={() => handleToggle("systemAlertInApp")}
              />
            </div>
          </CardContent>
        </Card>

        {/* Quiet Hours */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Quiet Hours</CardTitle>
            <CardDescription>
              Email notifications will not be sent during these hours. In-app notifications are not affected.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quietHoursStart">Start Time</Label>
                <Input
                  id="quietHoursStart"
                  type="time"
                  value={formData.quietHoursStart}
                  onChange={(e) => handleTimeChange("quietHoursStart", e.target.value)}
                  placeholder="18:00"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 18:00</p>
              </div>
              <div>
                <Label htmlFor="quietHoursEnd">End Time</Label>
                <Input
                  id="quietHoursEnd"
                  type="time"
                  value={formData.quietHoursEnd}
                  onChange={(e) => handleTimeChange("quietHoursEnd", e.target.value)}
                  placeholder="09:00"
                />
                <p className="text-xs text-gray-500 mt-1">e.g., 09:00 (next day)</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {formData.quietHoursStart && formData.quietHoursEnd
                ? `Quiet hours: ${formData.quietHoursStart} to ${formData.quietHoursEnd}`
                : "No quiet hours set"}
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex gap-3">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-red-600 hover:bg-red-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Preferences"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
