import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, RotateCcw } from "lucide-react";

export interface AuditLogSettings {
  itemsPerPage: number;
  defaultViewMode: "table" | "timeline";
  defaultAction: string;
  defaultEntityType: string;
  autoRefresh: boolean;
  autoRefreshInterval: number;
  showTimestamps: boolean;
  showUserAgent: boolean;
  showIPAddress: boolean;
  compactMode: boolean;
  dateRangePreset: "all" | "today" | "week" | "month" | "custom";
  customDateRangeStart?: string;
  customDateRangeEnd?: string;
}

const DEFAULT_SETTINGS: AuditLogSettings = {
  itemsPerPage: 50,
  defaultViewMode: "table",
  defaultAction: "",
  defaultEntityType: "",
  autoRefresh: false,
  autoRefreshInterval: 30,
  showTimestamps: true,
  showUserAgent: false,
  showIPAddress: true,
  compactMode: false,
  dateRangePreset: "all",
};

const STORAGE_KEY = "auditLogSettings";

interface AuditLogSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (settings: AuditLogSettings) => void;
}

export function AuditLogSettingsModal({
  isOpen,
  onClose,
  onSave,
}: AuditLogSettingsModalProps) {
  const [settings, setSettings] = useState<AuditLogSettings>(DEFAULT_SETTINGS);
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        } catch (error) {
          console.error("Failed to parse audit log settings:", error);
          setSettings(DEFAULT_SETTINGS);
        }
      }
    }
  }, [isOpen]);

  const handleSettingChange = (key: keyof AuditLogSettings, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    }
    onSave(settings);
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
    setHasChanges(true);
  };

  const handleClose = () => {
    if (hasChanges) {
      if (confirm("You have unsaved changes. Are you sure you want to close?")) {
        setHasChanges(false);
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Audit Log Settings
          </DialogTitle>
          <DialogDescription>
            Customize your audit log viewing experience and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="display">Display</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="refresh">Auto-Refresh</TabsTrigger>
          </TabsList>

          {/* Display Settings */}
          <TabsContent value="display" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">View Preferences</CardTitle>
                <CardDescription>Customize how audit logs are displayed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="itemsPerPage">Items Per Page</Label>
                  <Select
                    value={settings.itemsPerPage.toString()}
                    onValueChange={(value) =>
                      handleSettingChange("itemsPerPage", parseInt(value))
                    }
                  >
                    <SelectTrigger id="itemsPerPage">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 items</SelectItem>
                      <SelectItem value="25">25 items</SelectItem>
                      <SelectItem value="50">50 items</SelectItem>
                      <SelectItem value="100">100 items</SelectItem>
                      <SelectItem value="200">200 items</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultViewMode">Default View Mode</Label>
                  <Select
                    value={settings.defaultViewMode}
                    onValueChange={(value) =>
                      handleSettingChange(
                        "defaultViewMode",
                        value as "table" | "timeline"
                      )
                    }
                  >
                    <SelectTrigger id="defaultViewMode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Table View</SelectItem>
                      <SelectItem value="timeline">Timeline View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Display Options</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showTimestamps"
                      checked={settings.showTimestamps}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showTimestamps", checked)
                      }
                    />
                    <Label htmlFor="showTimestamps" className="font-normal cursor-pointer">
                      Show Timestamps
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showIPAddress"
                      checked={settings.showIPAddress}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showIPAddress", checked)
                      }
                    />
                    <Label htmlFor="showIPAddress" className="font-normal cursor-pointer">
                      Show IP Address
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showUserAgent"
                      checked={settings.showUserAgent}
                      onCheckedChange={(checked) =>
                        handleSettingChange("showUserAgent", checked)
                      }
                    />
                    <Label htmlFor="showUserAgent" className="font-normal cursor-pointer">
                      Show User Agent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="compactMode"
                      checked={settings.compactMode}
                      onCheckedChange={(checked) =>
                        handleSettingChange("compactMode", checked)
                      }
                    />
                    <Label htmlFor="compactMode" className="font-normal cursor-pointer">
                      Compact Mode
                    </Label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Filter Settings */}
          <TabsContent value="filters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Default Filters</CardTitle>
                <CardDescription>Set default filter values for quick access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultAction">Default Action Filter</Label>
                  <Select
                    value={settings.defaultAction}
                    onValueChange={(value) =>
                      handleSettingChange("defaultAction", value)
                    }
                  >
                    <SelectTrigger id="defaultAction">
                      <SelectValue placeholder="No filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No filter</SelectItem>
                      <SelectItem value="create">Create</SelectItem>
                      <SelectItem value="update">Update</SelectItem>
                      <SelectItem value="delete">Delete</SelectItem>
                      <SelectItem value="export">Export</SelectItem>
                      <SelectItem value="import">Import</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="defaultEntityType">Default Entity Type Filter</Label>
                  <Select
                    value={settings.defaultEntityType}
                    onValueChange={(value) =>
                      handleSettingChange("defaultEntityType", value)
                    }
                  >
                    <SelectTrigger id="defaultEntityType">
                      <SelectValue placeholder="No filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">No filter</SelectItem>
                      <SelectItem value="tour">Tour</SelectItem>
                      <SelectItem value="destination">Destination</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="report">Report</SelectItem>
                      <SelectItem value="schedule">Schedule</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateRangePreset">Default Date Range</Label>
                  <Select
                    value={settings.dateRangePreset}
                    onValueChange={(value) =>
                      handleSettingChange(
                        "dateRangePreset",
                        value as AuditLogSettings["dateRangePreset"]
                      )
                    }
                  >
                    <SelectTrigger id="dateRangePreset">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">Last 7 Days</SelectItem>
                      <SelectItem value="month">Last 30 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {settings.dateRangePreset === "custom" && (
                  <div className="space-y-3 pt-2 border-t">
                    <div className="space-y-2">
                      <Label htmlFor="customStart">Start Date</Label>
                      <Input
                        id="customStart"
                        type="date"
                        value={settings.customDateRangeStart || ""}
                        onChange={(e) =>
                          handleSettingChange("customDateRangeStart", e.target.value)
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customEnd">End Date</Label>
                      <Input
                        id="customEnd"
                        type="date"
                        value={settings.customDateRangeEnd || ""}
                        onChange={(e) =>
                          handleSettingChange("customDateRangeEnd", e.target.value)
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Auto-Refresh Settings */}
          <TabsContent value="refresh" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Auto-Refresh Settings</CardTitle>
                <CardDescription>Automatically refresh audit logs at intervals</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRefresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) =>
                      handleSettingChange("autoRefresh", checked)
                    }
                  />
                  <Label htmlFor="autoRefresh" className="font-normal cursor-pointer">
                    Enable Auto-Refresh
                  </Label>
                </div>

                {settings.autoRefresh && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="refreshInterval">Refresh Interval (seconds)</Label>
                    <Select
                      value={settings.autoRefreshInterval.toString()}
                      onValueChange={(value) =>
                        handleSettingChange("autoRefreshInterval", parseInt(value))
                      }
                    >
                      <SelectTrigger id="refreshInterval">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10 seconds</SelectItem>
                        <SelectItem value="30">30 seconds</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                        <SelectItem value="600">10 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <p className="text-sm text-gray-600 mb-3">
                    Auto-refresh will periodically fetch new audit logs in the background
                    without interrupting your current view.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={!hasChanges}>
              Save Settings
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
