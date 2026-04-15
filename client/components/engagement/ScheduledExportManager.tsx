import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Clock, Mail, CheckCircle, AlertCircle } from "lucide-react";
import { ScheduleForm } from "./ScheduleForm";
import { ExportHistoryViewer } from "./ExportHistoryViewer";

interface ScheduledExport {
  id: number;
  name: string;
  description?: string;
  exportType: string;
  exportFormat: string;
  scheduleType: string;
  timeOfDay: string;
  isActive: boolean;
  nextExecutionAt?: Date;
  lastExecutedAt?: Date;
  recipients: Array<{ email: string; name?: string }>;
}

interface ExportHistory {
  id: number;
  executionTime: Date;
  status: "pending" | "processing" | "completed" | "failed";
  deliveryStatus: "pending" | "sent" | "failed" | "bounced";
  recordCount?: number;
  errorMessage?: string;
}

/**
 * Scheduled Export Manager Component
 * Manages creation, editing, and monitoring of scheduled exports
 */
export function ScheduledExportManager() {
  const [schedules, setSchedules] = useState<ScheduledExport[]>([
    {
      id: 1,
      name: "Weekly Engagement Report",
      description: "Comprehensive engagement metrics sent every Monday",
      exportType: "comprehensive",
      exportFormat: "csv",
      scheduleType: "weekly",
      timeOfDay: "09:00",
      isActive: true,
      nextExecutionAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      lastExecutedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      recipients: [
        { email: "manager@example.com", name: "Manager" },
        { email: "analytics@example.com", name: "Analytics Team" },
      ],
    },
    {
      id: 2,
      name: "Daily Summary",
      description: "Quick daily summary of key metrics",
      exportType: "summary",
      exportFormat: "json",
      scheduleType: "daily",
      timeOfDay: "08:00",
      isActive: true,
      nextExecutionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      lastExecutedAt: new Date(),
      recipients: [{ email: "ceo@example.com", name: "CEO" }],
    },
  ]);

  const [selectedSchedule, setSelectedSchedule] = useState<ScheduledExport | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("schedules");

  const handleCreateSchedule = (config: any) => {
    const newSchedule: ScheduledExport = {
      id: Math.max(...schedules.map((s) => s.id), 0) + 1,
      ...config,
      isActive: true,
      nextExecutionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    setSchedules([...schedules, newSchedule]);
    setIsFormOpen(false);
  };

  const handleUpdateSchedule = (config: any) => {
    if (!selectedSchedule) return;
    const updated = schedules.map((s) =>
      s.id === selectedSchedule.id ? { ...s, ...config } : s
    );
    setSchedules(updated);
    setSelectedSchedule(null);
    setIsFormOpen(false);
  };

  const handleDeleteSchedule = (id: number) => {
    setSchedules(schedules.filter((s) => s.id !== id));
  };

  const handleToggleActive = (id: number) => {
    const updated = schedules.map((s) =>
      s.id === id ? { ...s, isActive: !s.isActive } : s
    );
    setSchedules(updated);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules">Scheduled Exports</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Scheduled Exports</h3>
              <p className="text-sm text-slate-600 mt-1">
                Manage automatic exports and email delivery to stakeholders
              </p>
            </div>
            <Button
              onClick={() => {
                setSelectedSchedule(null);
                setIsFormOpen(true);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Schedule
            </Button>
          </div>

          {isFormOpen && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedSchedule ? "Edit Schedule" : "Create New Schedule"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScheduleForm
                  initialData={selectedSchedule}
                  onSubmit={
                    selectedSchedule ? handleUpdateSchedule : handleCreateSchedule
                  }
                  onCancel={() => {
                    setIsFormOpen(false);
                    setSelectedSchedule(null);
                  }}
                />
              </CardContent>
            </Card>
          )}

          <div className="space-y-3">
            {schedules.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <p className="text-slate-600">No scheduled exports yet</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setIsFormOpen(true)}
                  >
                    Create First Schedule
                  </Button>
                </CardContent>
              </Card>
            ) : (
              schedules.map((schedule) => (
                <Card key={schedule.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h4 className="font-semibold text-lg">{schedule.name}</h4>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              schedule.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            {schedule.isActive ? "Active" : "Inactive"}
                          </span>
                        </div>
                        {schedule.description && (
                          <p className="text-sm text-slate-600 mt-1">
                            {schedule.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Type</p>
                            <p className="text-sm font-medium capitalize">
                              {schedule.exportType}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Schedule</p>
                            <p className="text-sm font-medium capitalize">
                              {schedule.scheduleType} at {schedule.timeOfDay}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Format</p>
                            <p className="text-sm font-medium uppercase">
                              {schedule.exportFormat}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 uppercase">Recipients</p>
                            <p className="text-sm font-medium">
                              {schedule.recipients.length} recipient
                              {schedule.recipients.length !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4">
                          <p className="text-xs text-slate-500 uppercase mb-2">Recipients</p>
                          <div className="flex flex-wrap gap-2">
                            {schedule.recipients.map((recipient, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 rounded text-xs"
                              >
                                <Mail className="w-3 h-3" />
                                {recipient.name || recipient.email}
                              </span>
                            ))}
                          </div>
                        </div>

                        {schedule.nextExecutionAt && (
                          <div className="mt-4 text-xs text-slate-600">
                            <p>
                              Next execution:{" "}
                              {schedule.nextExecutionAt.toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsFormOpen(true);
                          }}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleToggleActive(schedule.id)
                          }
                        >
                          {schedule.isActive ? "Pause" : "Resume"}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold">Execution History</h3>
            <p className="text-sm text-slate-600 mt-1">
              View past export executions and delivery status
            </p>
          </div>

          {schedules.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-slate-600">No scheduled exports to show history for</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <ExportHistoryViewer key={schedule.id} schedule={schedule} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default ScheduledExportManager;
