import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";

export interface AuditLogEntry {
  id: number;
  flagName: string;
  changeType: "toggle" | "rollout_update" | "description_update" | "created" | "deleted" | "batch_update";
  changes: Record<string, any>;
  userId: number;
  userName: string;
  createdAt: Date;
}

interface FlagAuditLogProps {
  entries: AuditLogEntry[];
  isLoading?: boolean;
  onLoadMore?: () => void;
}

/**
 * Component displaying flag change history and audit log
 */
export function FlagAuditLog({
  entries,
  isLoading = false,
  onLoadMore,
}: FlagAuditLogProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [filterFlag, setFilterFlag] = useState("");
  const [filterType, setFilterType] = useState("");

  const filteredEntries = entries.filter(
    (entry) =>
      (filterFlag === "" || entry.flagName.includes(filterFlag)) &&
      (filterType === "" || entry.changeType === filterType)
  );

  const changeTypeColors: Record<string, string> = {
    toggle: "bg-yellow-100 text-yellow-800",
    rollout_update: "bg-blue-100 text-blue-800",
    description_update: "bg-purple-100 text-purple-800",
    created: "bg-green-100 text-green-800",
    deleted: "bg-red-100 text-red-800",
    batch_update: "bg-indigo-100 text-indigo-800",
  };

  const changeTypeLabels: Record<string, string> = {
    toggle: "Toggled",
    rollout_update: "Rollout Updated",
    description_update: "Description Updated",
    created: "Created",
    deleted: "Deleted",
    batch_update: "Batch Updated",
  };

  return (
    <Card className="p-4">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Change History</h3>

        {/* Filters */}
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Filter by flag name..."
            value={filterFlag}
            onChange={(e) => setFilterFlag(e.target.value)}
            className="max-w-xs"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">All changes</option>
            <option value="toggle">Toggled</option>
            <option value="rollout_update">Rollout Updated</option>
            <option value="description_update">Description Updated</option>
            <option value="created">Created</option>
            <option value="deleted">Deleted</option>
            <option value="batch_update">Batch Updated</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Flag</TableHead>
              <TableHead>Change Type</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading history...
                </TableCell>
              </TableRow>
            ) : filteredEntries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No changes found
                </TableCell>
              </TableRow>
            ) : (
              filteredEntries.map((entry) => (
                <React.Fragment key={entry.id}>
                  <TableRow className="hover:bg-gray-50">
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(expandedId === entry.id ? null : entry.id)
                        }
                        className="p-0"
                      >
                        {expandedId === entry.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    </TableCell>
                    <TableCell className="font-medium">{entry.flagName}</TableCell>
                    <TableCell>
                      <Badge className={changeTypeColors[entry.changeType]}>
                        {changeTypeLabels[entry.changeType]}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {entry.userName}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(entry.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setExpandedId(expandedId === entry.id ? null : entry.id)
                        }
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>

                  {/* Expanded Details */}
                  {expandedId === entry.id && (
                    <TableRow className="bg-gray-50">
                      <TableCell colSpan={6}>
                        <ChangeDetails entry={entry} />
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Load More */}
      {onLoadMore && (
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={onLoadMore} disabled={isLoading}>
            Load More
          </Button>
        </div>
      )}
    </Card>
  );
}

/**
 * Detailed change information
 */
function ChangeDetails({ entry }: { entry: AuditLogEntry }) {
  return (
    <div className="space-y-3 py-3">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Change Details</h4>
        <div className="bg-white border border-gray-200 rounded p-3 font-mono text-sm">
          <pre className="overflow-x-auto">
            {JSON.stringify(entry.changes, null, 2)}
          </pre>
        </div>
      </div>

      {/* Change Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-gray-600 font-medium">Changed By</p>
          <p className="text-sm text-gray-900">{entry.userName}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 font-medium">Changed At</p>
          <p className="text-sm text-gray-900">
            {new Date(entry.createdAt).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Change Interpretation */}
      <ChangeInterpretation entry={entry} />
    </div>
  );
}

/**
 * Human-readable interpretation of changes
 */
function ChangeInterpretation({ entry }: { entry: AuditLogEntry }) {
  const { changeType, changes, flagName } = entry;

  let message = "";

  switch (changeType) {
    case "toggle":
      message = changes.enabled
        ? `Enabled the "${flagName}" feature flag`
        : `Disabled the "${flagName}" feature flag`;
      break;
    case "rollout_update":
      message = `Updated rollout percentage to ${changes.rolloutPercentage}%`;
      break;
    case "description_update":
      message = `Updated description to "${changes.description || "(empty)"}"`;
      break;
    case "created":
      message = `Created new feature flag "${flagName}"`;
      break;
    case "deleted":
      message = `Deleted the "${flagName}" feature flag`;
      break;
    case "batch_update":
      message = `Batch updated ${Object.keys(changes).length} properties`;
      break;
  }

  return (
    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
      <p className="text-sm text-blue-900">{message}</p>
    </div>
  );
}

/**
 * Timeline view of changes
 */
interface AuditTimelineProps {
  entries: AuditLogEntry[];
}

export function AuditTimeline({ entries }: AuditTimelineProps) {
  const groupedByDate = entries.reduce(
    (acc, entry) => {
      const date = new Date(entry.createdAt).toLocaleDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(entry);
      return acc;
    },
    {} as Record<string, AuditLogEntry[]>
  );

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Timeline</h3>

      <div className="space-y-6">
        {Object.entries(groupedByDate).map(([date, dayEntries]) => (
          <div key={date}>
            <h4 className="font-medium text-gray-900 mb-3">{date}</h4>
            <div className="space-y-2 border-l-2 border-gray-200 pl-4">
              {dayEntries.map((entry) => (
                <TimelineItem key={entry.id} entry={entry} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/**
 * Individual timeline item
 */
function TimelineItem({ entry }: { entry: AuditLogEntry }) {
  const changeTypeColors: Record<string, string> = {
    toggle: "bg-yellow-100 text-yellow-800",
    rollout_update: "bg-blue-100 text-blue-800",
    description_update: "bg-purple-100 text-purple-800",
    created: "bg-green-100 text-green-800",
    deleted: "bg-red-100 text-red-800",
    batch_update: "bg-indigo-100 text-indigo-800",
  };

  const changeTypeLabels: Record<string, string> = {
    toggle: "Toggled",
    rollout_update: "Rollout Updated",
    description_update: "Description Updated",
    created: "Created",
    deleted: "Deleted",
    batch_update: "Batch Updated",
  };

  return (
    <div className="flex gap-3">
      <div className="pt-1">
        <div className="w-3 h-3 rounded-full bg-blue-600 -ml-5"></div>
      </div>
      <div className="flex-grow pb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{entry.flagName}</span>
          <Badge className={changeTypeColors[entry.changeType]}>
            {changeTypeLabels[entry.changeType]}
          </Badge>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          by {entry.userName} at {new Date(entry.createdAt).toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}

/**
 * Format date for display
 */
function formatDate(date: Date | string): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return d.toLocaleDateString();
}
