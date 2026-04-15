import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, Trash2, Edit2, Play } from "lucide-react";
import { toast } from "sonner";

export function ReportScheduleConfig() {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    frequency: "daily" as const,
    dayOfWeek: 0,
    dayOfMonth: 1,
    time: "09:00",
    timezone: "UTC",
    reportType: "full" as const,
    dateRangeType: "last7days" as const,
    customDaysBack: 7,
    recipients: "",
    includeAttachment: true,
    attachmentFormat: "csv" as const,
    isActive: true,
  });

  const listSchedules = trpc.reportSchedules.list.useQuery();
  const createSchedule = trpc.reportSchedules.create.useMutation();
  const updateSchedule = trpc.reportSchedules.update.useMutation();
  const deleteSchedule = trpc.reportSchedules.delete.useMutation();
  const toggleActive = trpc.reportSchedules.toggleActive.useMutation();
  const triggerNow = trpc.reportSchedules.triggerNow.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const recipients = formData.recipients
      .split(",")
      .map((r) => r.trim())
      .filter((r) => r.length > 0);

    if (recipients.length === 0) {
      toast.error("Please add at least one recipient email");
      return;
    }

    try {
      if (editingId) {
        await updateSchedule.mutateAsync({
          id: editingId,
          data: {
            ...formData,
            recipients,
          },
        });
        toast.success("Schedule updated successfully");
      } else {
        await createSchedule.mutateAsync({
          ...formData,
          recipients,
        });
        toast.success("Schedule created successfully");
      }

      resetForm();
      listSchedules.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to save schedule");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;

    try {
      await deleteSchedule.mutateAsync({ id });
      toast.success("Schedule deleted successfully");
      listSchedules.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete schedule");
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, isActive: !isActive });
      toast.success(`Schedule ${!isActive ? "activated" : "deactivated"}`);
      listSchedules.refetch();
    } catch (error: any) {
      toast.error(error.message || "Failed to toggle schedule");
    }
  };

  const handleTriggerNow = async (id: string) => {
    try {
      await triggerNow.mutateAsync({ scheduleId: id });
      toast.success("Report generation triggered");
    } catch (error: any) {
      toast.error(error.message || "Failed to trigger report");
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      frequency: "daily",
      dayOfWeek: 0,
      dayOfMonth: 1,
      time: "09:00",
      timezone: "UTC",
      reportType: "full",
      dateRangeType: "last7days",
      customDaysBack: 7,
      recipients: "",
      includeAttachment: true,
      attachmentFormat: "csv",
      isActive: true,
    });
    setEditingId(null);
    setIsCreating(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Report Schedules</h1>
          <p className="text-gray-600">Configure automated analytics report delivery</p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} className="gap-2">
          <Plus className="w-4 h-4" />
          New Schedule
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Edit Schedule" : "Create New Schedule"}</CardTitle>
            <CardDescription>Set up automated report delivery</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Schedule Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Weekly Performance Report"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UTC">UTC</SelectItem>
                        <SelectItem value="America/New_York">Eastern Time</SelectItem>
                        <SelectItem value="America/Chicago">Central Time</SelectItem>
                        <SelectItem value="America/Denver">Mountain Time</SelectItem>
                        <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                        <SelectItem value="Europe/London">London</SelectItem>
                        <SelectItem value="Europe/Paris">Paris</SelectItem>
                        <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
              </div>

              {/* Schedule Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Schedule Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="frequency">Frequency *</Label>
                    <Select value={formData.frequency} onValueChange={(v: any) => setFormData({ ...formData, frequency: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="time">Time *</Label>
                    <Input
                      id="time"
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {formData.frequency === "weekly" && (
                  <div>
                    <Label htmlFor="dayOfWeek">Day of Week *</Label>
                    <Select value={formData.dayOfWeek.toString()} onValueChange={(v) => setFormData({ ...formData, dayOfWeek: parseInt(v) })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">Sunday</SelectItem>
                        <SelectItem value="1">Monday</SelectItem>
                        <SelectItem value="2">Tuesday</SelectItem>
                        <SelectItem value="3">Wednesday</SelectItem>
                        <SelectItem value="4">Thursday</SelectItem>
                        <SelectItem value="5">Friday</SelectItem>
                        <SelectItem value="6">Saturday</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.frequency === "monthly" && (
                  <div>
                    <Label htmlFor="dayOfMonth">Day of Month *</Label>
                    <Input
                      id="dayOfMonth"
                      type="number"
                      min="1"
                      max="31"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                )}
              </div>

              {/* Report Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Report Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reportType">Report Type *</Label>
                    <Select value={formData.reportType} onValueChange={(v: any) => setFormData({ ...formData, reportType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full">Full Report</SelectItem>
                        <SelectItem value="summary">Summary</SelectItem>
                        <SelectItem value="metrics">Metrics Only</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="providers">Providers</SelectItem>
                        <SelectItem value="errors">Errors</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateRangeType">Date Range *</Label>
                    <Select value={formData.dateRangeType} onValueChange={(v: any) => setFormData({ ...formData, dateRangeType: v })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="last7days">Last 7 Days</SelectItem>
                        <SelectItem value="last30days">Last 30 Days</SelectItem>
                        <SelectItem value="last90days">Last 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Recipients */}
              <div className="space-y-4">
                <h3 className="font-semibold">Recipients</h3>
                <div>
                  <Label htmlFor="recipients">Email Addresses * (comma-separated)</Label>
                  <Textarea
                    id="recipients"
                    value={formData.recipients}
                    onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                    placeholder="user@example.com, admin@example.com"
                    rows={3}
                    required
                  />
                </div>
              </div>

              {/* Attachment Settings */}
              <div className="space-y-4">
                <h3 className="font-semibold">Attachment Settings</h3>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="includeAttachment"
                      checked={formData.includeAttachment}
                      onCheckedChange={(checked) => setFormData({ ...formData, includeAttachment: checked as boolean })}
                    />
                    <Label htmlFor="includeAttachment">Include Attachment</Label>
                  </div>
                  {formData.includeAttachment && (
                    <Select value={formData.attachmentFormat} onValueChange={(v: any) => setFormData({ ...formData, attachmentFormat: v })}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="json">JSON</SelectItem>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" disabled={createSchedule.isPending || updateSchedule.isPending} className="gap-2">
                  {(createSchedule.isPending || updateSchedule.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingId ? "Update Schedule" : "Create Schedule"}
                </Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Schedules List */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Schedules</h2>
        {listSchedules.isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : listSchedules.data?.schedules && listSchedules.data.schedules.length > 0 ? (
          <div className="grid gap-4">
            {listSchedules.data.schedules.map((schedule: any) => (
              <Card key={schedule.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{schedule.name}</h3>
                      {schedule.description && <p className="text-sm text-gray-600">{schedule.description}</p>}
                    </div>
                    <Badge variant={schedule.isActive ? "default" : "secondary"}>{schedule.isActive ? "Active" : "Inactive"}</Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                    <div>
                      <p className="text-gray-600">Frequency</p>
                      <p className="font-medium capitalize">{schedule.frequency}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Time</p>
                      <p className="font-medium">{schedule.time}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Report Type</p>
                      <p className="font-medium capitalize">{schedule.reportType}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Recipients</p>
                      <p className="font-medium">{(schedule.recipients as string[])?.length || 0} emails</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTriggerNow(schedule.id)}
                      disabled={triggerNow.isPending}
                      className="gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Trigger Now
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleActive(schedule.id, schedule.isActive)}
                      disabled={toggleActive.isPending}
                    >
                      {schedule.isActive ? "Pause" : "Resume"}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setEditingId(schedule.id)} className="gap-2">
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(schedule.id)}
                      disabled={deleteSchedule.isPending}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6 text-center text-gray-600">
              No schedules configured yet. Create one to get started!
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
