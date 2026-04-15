import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus } from "lucide-react";

interface ScheduleFormProps {
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

/**
 * Schedule Form Component
 * Form for creating and editing scheduled exports
 */
export function ScheduleForm({ initialData, onSubmit, onCancel }: ScheduleFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    description: initialData?.description || "",
    exportType: initialData?.exportType || "summary",
    exportFormat: initialData?.exportFormat || "csv",
    scheduleType: initialData?.scheduleType || "daily",
    timeOfDay: initialData?.timeOfDay || "09:00",
    dayOfWeek: initialData?.dayOfWeek || 1,
    dayOfMonth: initialData?.dayOfMonth || 1,
    recipients: initialData?.recipients || [],
  });

  const [newRecipient, setNewRecipient] = useState({ email: "", name: "" });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddRecipient = () => {
    if (!newRecipient.email) return;

    setFormData((prev) => ({
      ...prev,
      recipients: [...prev.recipients, newRecipient],
    }));
    setNewRecipient({ email: "", name: "" });
  };

  const handleRemoveRecipient = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recipients: prev.recipients.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || formData.recipients.length === 0) {
      alert("Please fill in all required fields");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Basic Information</h3>

        <div>
          <Label htmlFor="name">Schedule Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="e.g., Weekly Engagement Report"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Optional description of this schedule"
            rows={3}
          />
        </div>
      </div>

      {/* Export Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Export Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="exportType">Export Type</Label>
            <Select value={formData.exportType} onValueChange={(v) => handleChange("exportType", v)}>
              <SelectTrigger id="exportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Summary Report</SelectItem>
                <SelectItem value="metrics">Engagement Metrics</SelectItem>
                <SelectItem value="trends">Engagement Trends</SelectItem>
                <SelectItem value="recipients">Recipient Profiles</SelectItem>
                <SelectItem value="emails">Email Performance</SelectItem>
                <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="exportFormat">Export Format</Label>
            <Select value={formData.exportFormat} onValueChange={(v) => handleChange("exportFormat", v)}>
              <SelectTrigger id="exportFormat">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Schedule Settings */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Schedule Settings</h3>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="scheduleType">Schedule Type</Label>
            <Select value={formData.scheduleType} onValueChange={(v) => handleChange("scheduleType", v)}>
              <SelectTrigger id="scheduleType">
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
            <Label htmlFor="timeOfDay">Time of Day</Label>
            <Input
              id="timeOfDay"
              type="time"
              value={formData.timeOfDay}
              onChange={(e) => handleChange("timeOfDay", e.target.value)}
            />
          </div>
        </div>

        {formData.scheduleType === "weekly" && (
          <div>
            <Label htmlFor="dayOfWeek">Day of Week</Label>
            <Select value={String(formData.dayOfWeek)} onValueChange={(v) => handleChange("dayOfWeek", parseInt(v))}>
              <SelectTrigger id="dayOfWeek">
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

        {formData.scheduleType === "monthly" && (
          <div>
            <Label htmlFor="dayOfMonth">Day of Month</Label>
            <Select value={String(formData.dayOfMonth)} onValueChange={(v) => handleChange("dayOfMonth", parseInt(v))}>
              <SelectTrigger id="dayOfMonth">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <SelectItem key={day} value={String(day)}>
                    Day {day}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Recipients */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">Recipients *</h3>

        <div className="space-y-3">
          {formData.recipients.map((recipient, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded">
              <div>
                <p className="font-medium text-sm">{recipient.name || recipient.email}</p>
                <p className="text-xs text-slate-600">{recipient.email}</p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleRemoveRecipient(idx)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-3 p-4 bg-slate-50 rounded">
          <div>
            <Label htmlFor="recipientEmail">Email Address</Label>
            <Input
              id="recipientEmail"
              type="email"
              value={newRecipient.email}
              onChange={(e) => setNewRecipient({ ...newRecipient, email: e.target.value })}
              placeholder="recipient@example.com"
            />
          </div>

          <div>
            <Label htmlFor="recipientName">Name (Optional)</Label>
            <Input
              id="recipientName"
              value={newRecipient.name}
              onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
              placeholder="Recipient Name"
            />
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleAddRecipient}
          >
            <Plus className="w-4 h-4" />
            Add Recipient
          </Button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Update Schedule" : "Create Schedule"}
        </Button>
      </div>
    </form>
  );
}

export default ScheduleForm;
