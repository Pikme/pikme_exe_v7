import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Trash2, Edit3, Eye, LogIn, LogOut, Download, Upload, Clock } from "lucide-react";
import { useState } from "react";

interface TimelineEvent {
  id: number;
  userId: number;
  userName: string;
  userEmail?: string;
  action: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  description?: string;
  status: string;
  createdAt: Date;
  ipAddress?: string;
}

interface AuditLogTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
  onEventClick?: (event: TimelineEvent) => void;
}

const getActionIcon = (action: string) => {
  switch (action) {
    case "create":
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    case "update":
      return <Edit3 className="w-5 h-5 text-blue-600" />;
    case "delete":
      return <Trash2 className="w-5 h-5 text-red-600" />;
    case "export":
      return <Download className="w-5 h-5 text-purple-600" />;
    case "import":
      return <Upload className="w-5 h-5 text-orange-600" />;
    case "view":
      return <Eye className="w-5 h-5 text-gray-600" />;
    case "login":
      return <LogIn className="w-5 h-5 text-indigo-600" />;
    case "logout":
      return <LogOut className="w-5 h-5 text-slate-600" />;
    default:
      return <Clock className="w-5 h-5 text-gray-600" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case "create":
      return "bg-green-50 border-green-200 hover:bg-green-100";
    case "update":
      return "bg-blue-50 border-blue-200 hover:bg-blue-100";
    case "delete":
      return "bg-red-50 border-red-200 hover:bg-red-100";
    case "export":
      return "bg-purple-50 border-purple-200 hover:bg-purple-100";
    case "import":
      return "bg-orange-50 border-orange-200 hover:bg-orange-100";
    case "view":
      return "bg-gray-50 border-gray-200 hover:bg-gray-100";
    case "login":
      return "bg-indigo-50 border-indigo-200 hover:bg-indigo-100";
    case "logout":
      return "bg-slate-50 border-slate-200 hover:bg-slate-100";
    default:
      return "bg-gray-50 border-gray-200 hover:bg-gray-100";
  }
};

const getActionBadgeColor = (action: string) => {
  switch (action) {
    case "create":
      return "bg-green-100 text-green-800";
    case "update":
      return "bg-blue-100 text-blue-800";
    case "delete":
      return "bg-red-100 text-red-800";
    case "export":
      return "bg-purple-100 text-purple-800";
    case "import":
      return "bg-orange-100 text-orange-800";
    case "view":
      return "bg-gray-100 text-gray-800";
    case "login":
      return "bg-indigo-100 text-indigo-800";
    case "logout":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getEntityTypeBadgeColor = (entityType: string) => {
  switch (entityType) {
    case "tour":
      return "bg-indigo-100 text-indigo-800";
    case "location":
      return "bg-cyan-100 text-cyan-800";
    case "state":
      return "bg-teal-100 text-teal-800";
    case "country":
      return "bg-sky-100 text-sky-800";
    case "category":
      return "bg-amber-100 text-amber-800";
    case "activity":
      return "bg-pink-100 text-pink-800";
    case "attraction":
      return "bg-rose-100 text-rose-800";
    case "user":
      return "bg-violet-100 text-violet-800";
    case "system":
      return "bg-slate-100 text-slate-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatTime = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatDate = (date: Date) => {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const groupEventsByDate = (events: TimelineEvent[]) => {
  const grouped: { [key: string]: TimelineEvent[] } = {};
  events.forEach((event) => {
    const date = formatDate(event.createdAt);
    if (!grouped[date]) {
      grouped[date] = [];
    }
    grouped[date].push(event);
  });
  return grouped;
};

export function AuditLogTimeline({ events, isLoading, onEventClick }: AuditLogTimelineProps) {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [hoveredEventId, setHoveredEventId] = useState<number | null>(null);

  const groupedEvents = groupEventsByDate(events);
  const sortedDates = Object.keys(groupedEvents).sort((a, b) => {
    return new Date(b).getTime() - new Date(a).getTime();
  });

  const toggleDateExpansion = (date: string) => {
    const newExpanded = new Set(expandedDates);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDates(newExpanded);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Timeline</CardTitle>
          <CardDescription>Loading timeline events...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (events.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Audit Log Timeline</CardTitle>
          <CardDescription>No events to display</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No audit log events found for the selected filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Log Timeline</CardTitle>
        <CardDescription>
          {events.length} event{events.length !== 1 ? "s" : ""} across {sortedDates.length} day{sortedDates.length !== 1 ? "s" : ""}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sortedDates.map((date) => (
            <div key={date} className="border-l-2 border-gray-300 pl-6 relative">
              <button
                onClick={() => toggleDateExpansion(date)}
                className="flex items-center gap-2 mb-4 font-semibold text-gray-700 hover:text-gray-900 transition-colors"
              >
                <span className="text-lg">{expandedDates.has(date) ? "▼" : "▶"}</span>
                <span className="text-sm font-medium">{date}</span>
                <span className="text-xs text-gray-500 ml-auto">
                  {groupedEvents[date].length} event{groupedEvents[date].length !== 1 ? "s" : ""}
                </span>
              </button>

              {expandedDates.has(date) && (
                <div className="space-y-3">
                  {groupedEvents[date].map((event, index) => (
                    <div
                      key={event.id}
                      onClick={() => onEventClick?.(event)}
                      onMouseEnter={() => setHoveredEventId(event.id)}
                      onMouseLeave={() => setHoveredEventId(null)}
                      className={`
                        relative p-4 border-l-4 rounded-r-lg cursor-pointer transition-all
                        ${getActionColor(event.action)}
                        ${hoveredEventId === event.id ? "shadow-md scale-105 origin-left" : ""}
                      `}
                    >
                      <div className="absolute -left-8 top-5 w-5 h-5 bg-white border-4 border-gray-300 rounded-full" />

                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2">
                            {getActionIcon(event.action)}
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge className={getActionBadgeColor(event.action)}>
                                  {event.action.charAt(0).toUpperCase() + event.action.slice(1)}
                                </Badge>
                                <Badge className={getEntityTypeBadgeColor(event.entityType)}>
                                  {event.entityType}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <span className="text-xs text-gray-600 font-mono">{formatTime(event.createdAt)}</span>
                        </div>

                        <div className="text-sm text-gray-700">
                          <p className="font-medium">
                            {event.entityName ? `${event.entityName}` : `${event.entityType} #${event.entityId}`}
                          </p>
                          <p className="text-xs text-gray-600">
                            by {event.userName} {event.userEmail && `(${event.userEmail})`}
                          </p>
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-600 italic">{event.description}</p>
                        )}

                        {event.ipAddress && (
                          <p className="text-xs text-gray-500 font-mono">IP: {event.ipAddress}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
