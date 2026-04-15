/**
 * Scheduled Exports Page
 * Full page for managing scheduled exports with tRPC integration
 */

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Edit2, Trash2, Play, Pause, Mail, CheckCircle, AlertCircle, Clock } from "lucide-react";
import { ScheduleForm } from "@/components/engagement/ScheduleForm";
import { ExportHistoryViewer } from "@/components/engagement/ExportHistoryViewer";
import { AdminLayout } from "@/components/AdminLayout";
import {
  useScheduledExports,
  useCreateSchedule,
  useUpdateSchedule,
  useDeleteSchedule,
  useToggleSchedule,
  useExecuteSchedule,
  useSendTestEmail,
} from "@/hooks/useScheduledExports";

/**
 * Scheduled Exports Page Component
 */
export function ScheduledExportsPage() {
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [testEmailInput, setTestEmailInput] = useState("");
  const [activeTab, setActiveTab] = useState("schedules");

  // Data hooks
  const { schedules, isLoading: isLoadingSchedules, refetch: refetchSchedules } =
    useScheduledExports();

  // Action hooks
  const { create: createSchedule, isLoading: isCreating } = useCreateSchedule();
  const { update: updateSchedule, isLoading: isUpdating } = useUpdateSchedule();
  const { delete: deleteSchedule, isLoading: isDeleting } = useDeleteSchedule();
  const { toggle: toggleSchedule, isLoading: isToggling } = useToggleSchedule();
  const { execute: executeSchedule, isLoading: isExecuting } = useExecuteSchedule();
  const { sendTestEmail, isLoading: isSendingTest } = useSendTestEmail();

  const handleCreateSchedule = async (config: any) => {
    try {
      await createSchedule(config);
      setIsFormOpen(false);
      await refetchSchedules();
    } catch (error) {
      console.error("Error creating schedule:", error);
    }
  };

  const handleUpdateSchedule = async (config: any) => {
    if (!selectedSchedule) return;
    try {
      await updateSchedule(selectedSchedule.id, config);
      setSelectedSchedule(null);
      setIsFormOpen(false);
      await refetchSchedules();
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  const handleDeleteSchedule = async (id: number) => {
    if (!confirm("Are you sure you want to delete this schedule?")) return;
    try {
      await deleteSchedule(id);
      await refetchSchedules();
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };

  const handleToggleSchedule = async (id: number) => {
    try {
      await toggleSchedule(id);
      await refetchSchedules();
    } catch (error) {
      console.error("Error toggling schedule:", error);
    }
  };

  const handleExecuteSchedule = async (id: number) => {
    try {
      await executeSchedule(id);
      await refetchSchedules();
    } catch (error) {
      console.error("Error executing schedule:", error);
    }
  };

  const handleSendTestEmail = async (id: number) => {
    if (!testEmailInput) {
      alert("Please enter an email address");
      return;
    }
    try {
      await sendTestEmail(id, testEmailInput);
      setTestEmailInput("");
    } catch (error) {
      console.error("Error sending test email:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-red-500" />;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Scheduled Exports</h1>
        <p className="text-slate-600 mt-2">
          Manage automatic exports and email delivery to stakeholders
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Active Schedules</h2>
              <p className="text-sm text-slate-600">
                {schedules.length} schedule{schedules.length !== 1 ? "s" : ""} configured
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

          {isLoadingSchedules ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading schedules...</p>
            </div>
          ) : schedules.length === 0 ? (
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
            <div className="space-y-3">
              {schedules.map((schedule: any) => (
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
                              {schedule.recipients?.length || 0}
                            </p>
                          </div>
                        </div>

                        {schedule.nextExecutionAt && (
                          <div className="mt-4 text-xs text-slate-600">
                            <p>
                              Next execution:{" "}
                              {new Date(schedule.nextExecutionAt).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleExecuteSchedule(schedule.id)}
                          disabled={isExecuting}
                          title="Execute now"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedSchedule(schedule);
                            setIsFormOpen(true);
                          }}
                          disabled={isUpdating}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleSchedule(schedule.id)}
                          disabled={isToggling}
                        >
                          {schedule.isActive ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteSchedule(schedule.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <p className="text-xs text-slate-500 uppercase mb-2">
                        Send Test Email
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="email"
                          placeholder="test@example.com"
                          value={testEmailInput}
                          onChange={(e) => setTestEmailInput(e.target.value)}
                          className="flex-1 px-3 py-2 border rounded text-sm"
                        />
                        <Button
                          size="sm"
                          onClick={() => handleSendTestEmail(schedule.id)}
                          disabled={isSendingTest}
                          className="gap-2"
                        >
                          <Mail className="w-4 h-4" />
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Execution History</h2>
            <p className="text-sm text-slate-600">
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
              {schedules.map((schedule: any) => (
                <ExportHistoryViewer key={schedule.id} schedule={schedule} />
              ))}
            </div>
          )}
        </TabsContent>
       </Tabs>
      </div>
    </AdminLayout>
  );
}
export default ScheduledExportsPage;
