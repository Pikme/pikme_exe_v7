import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";

interface ExportHistoryViewerProps {
  schedule: any;
}

/**
 * Export History Viewer Component
 * Displays execution history for a scheduled export
 */
export function ExportHistoryViewer({ schedule }: ExportHistoryViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Mock history data
  const history = [
    {
      id: 1,
      executionTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: "completed",
      deliveryStatus: "sent",
      recordCount: 1250,
      errorMessage: null,
    },
    {
      id: 2,
      executionTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: "completed",
      deliveryStatus: "sent",
      recordCount: 1180,
      errorMessage: null,
    },
    {
      id: 3,
      executionTime: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      status: "completed",
      deliveryStatus: "sent",
      recordCount: 1050,
      errorMessage: null,
    },
    {
      id: 4,
      executionTime: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000),
      status: "failed",
      deliveryStatus: "failed",
      recordCount: null,
      errorMessage: "Email delivery failed for some recipients",
    },
  ];

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

  const getDeliveryStatusBadge = (status: string) => {
    const statusConfig: Record<string, { bg: string; text: string }> = {
      sent: { bg: "bg-green-100", text: "text-green-700" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-700" },
      failed: { bg: "bg-red-100", text: "text-red-700" },
      bounced: { bg: "bg-orange-100", text: "text-orange-700" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return `${config.bg} ${config.text}`;
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between hover:bg-slate-50 p-3 -m-3 rounded"
        >
          <div className="flex items-start gap-3 flex-1 text-left">
            <div className="flex-1">
              <h4 className="font-semibold">{schedule.name}</h4>
              <p className="text-sm text-slate-600">
                {schedule.scheduleType.charAt(0).toUpperCase() + schedule.scheduleType.slice(1)} at{" "}
                {schedule.timeOfDay}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <p className="text-sm font-medium">{history.length} executions</p>
              <p className="text-xs text-slate-600">
                Last: {history[0]?.executionTime.toLocaleDateString()}
              </p>
            </div>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </div>
        </button>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t space-y-2">
            {history.length === 0 ? (
              <p className="text-sm text-slate-600 text-center py-4">No execution history</p>
            ) : (
              history.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {getStatusIcon(record.status)}
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {record.executionTime.toLocaleString()}
                      </p>
                      {record.recordCount && (
                        <p className="text-xs text-slate-600">
                          {record.recordCount} records exported
                        </p>
                      )}
                      {record.errorMessage && (
                        <p className="text-xs text-red-600">{record.errorMessage}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getDeliveryStatusBadge(
                        record.deliveryStatus
                      )}`}
                    >
                      {record.deliveryStatus.charAt(0).toUpperCase() +
                        record.deliveryStatus.slice(1)}
                    </span>
                  </div>
                </div>
              ))
            )}

            {history.length > 0 && (
              <Button variant="outline" className="w-full mt-3" size="sm">
                View Full History
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default ExportHistoryViewer;
