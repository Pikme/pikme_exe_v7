import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  RotateCcw,
  Trash2,
  Download,
} from "lucide-react";

interface WebhookEvent {
  id: string;
  provider: string;
  eventType: string;
  status: "delivered" | "failed" | "pending";
  timestamp: Date;
  processingTime: number;
  error?: string;
  retryCount: number;
}

interface WebhookEventHistoryProps {
  onReplaySelected?: (eventIds: string[]) => void;
}

export function WebhookEventHistory({ onReplaySelected }: WebhookEventHistoryProps) {
  const [events, setEvents] = useState<WebhookEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<WebhookEvent[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  // Filter states
  const [providerFilter, setProviderFilter] = useState<string>("all");
  const [eventTypeFilter, setEventTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });

  // Pagination
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadEvents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [events, providerFilter, eventTypeFilter, statusFilter, searchQuery, dateRange]);

  const loadEvents = async () => {
    setLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockEvents: WebhookEvent[] = Array.from({ length: 150 }, (_, i) => ({
        id: `event-${i}`,
        provider: ["sendgrid", "ses", "mailgun"][Math.floor(Math.random() * 3)],
        eventType: ["delivered", "open", "click", "bounce"][Math.floor(Math.random() * 4)],
        status: i % 15 === 0 ? "failed" : i % 20 === 0 ? "pending" : "delivered",
        timestamp: new Date(Date.now() - Math.random() * 604800000), // Last 7 days
        processingTime: Math.random() * 1000 + 50,
        error: i % 15 === 0 ? "Connection timeout" : undefined,
        retryCount: Math.floor(Math.random() * 3),
      }));

      setEvents(mockEvents);
    } catch (error) {
      console.error("Failed to load events:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...events];

    // Provider filter
    if (providerFilter !== "all") {
      filtered = filtered.filter((e) => e.provider === providerFilter);
    }

    // Event type filter
    if (eventTypeFilter !== "all") {
      filtered = filtered.filter((e) => e.eventType === eventTypeFilter);
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    // Search query
    if (searchQuery) {
      filtered = filtered.filter(
        (e) =>
          e.id.includes(searchQuery) ||
          e.error?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Date range
    if (dateRange.start) {
      const startDate = new Date(dateRange.start);
      filtered = filtered.filter((e) => e.timestamp >= startDate);
    }

    if (dateRange.end) {
      const endDate = new Date(dateRange.end);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((e) => e.timestamp <= endDate);
    }

    // Sort by timestamp descending
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    setFilteredEvents(filtered);
    setPage(1);
  };

  const toggleEventSelection = (eventId: string) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(eventId)) {
      newSelected.delete(eventId);
    } else {
      newSelected.add(eventId);
    }
    setSelectedEvents(newSelected);
  };

  const toggleAllSelection = () => {
    if (selectedEvents.size === paginatedEvents.length) {
      setSelectedEvents(new Set());
    } else {
      const allIds = new Set(paginatedEvents.map((e) => e.id));
      setSelectedEvents(allIds);
    }
  };

  const handleReplay = () => {
    if (selectedEvents.size > 0 && onReplaySelected) {
      onReplaySelected(Array.from(selectedEvents));
      setSelectedEvents(new Set());
    }
  };

  const handleClearFilters = () => {
    setProviderFilter("all");
    setEventTypeFilter("all");
    setStatusFilter("all");
    setSearchQuery("");
    setDateRange({ start: "", end: "" });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "delivered":
        return <Badge className="bg-green-100 text-green-800">Delivered</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const paginatedEvents = filteredEvents.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);

  const failedEvents = filteredEvents.filter((e) => e.status === "failed");

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEvents.length}</div>
            <p className="text-xs text-muted-foreground">Matching filters</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Failed Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{failedEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              {filteredEvents.length > 0
                ? Math.round((failedEvents.length / filteredEvents.length) * 100)
                : 0}
              % failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{selectedEvents.size}</div>
            <p className="text-xs text-muted-foreground">For replay</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleReplay}
              disabled={selectedEvents.size === 0}
              className="w-full"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Replay ({selectedEvents.size})
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearFilters}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Provider Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Provider</label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Providers</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="ses">AWS SES</SelectItem>
                  <SelectItem value="mailgun">Mailgun</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Event Type Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Event Type</label>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="open">Opened</SelectItem>
                  <SelectItem value="click">Clicked</SelectItem>
                  <SelectItem value="bounce">Bounced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <Input
                placeholder="Search by ID or error..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={dateRange.start}
                onChange={(e) =>
                  setDateRange({ ...dateRange, start: e.target.value })
                }
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">End Date</label>
              <Input
                type="date"
                value={dateRange.end}
                onChange={(e) =>
                  setDateRange({ ...dateRange, end: e.target.value })
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events Table */}
      <Card>
        <CardHeader>
          <CardTitle>Webhook Events</CardTitle>
          <CardDescription>
            Showing {paginatedEvents.length} of {filteredEvents.length} events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={
                        paginatedEvents.length > 0 &&
                        selectedEvents.size === paginatedEvents.length
                      }
                      onCheckedChange={toggleAllSelection}
                    />
                  </TableHead>
                  <TableHead>Event ID</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Processing Time</TableHead>
                  <TableHead>Retries</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Loading events...
                    </TableCell>
                  </TableRow>
                ) : paginatedEvents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No events found
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedEvents.map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedEvents.has(event.id)}
                          onCheckedChange={() => toggleEventSelection(event.id)}
                        />
                      </TableCell>
                      <TableCell className="font-mono text-sm">{event.id}</TableCell>
                      <TableCell className="capitalize">{event.provider}</TableCell>
                      <TableCell className="capitalize">{event.eventType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(event.status)}
                          {getStatusBadge(event.status)}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {event.timestamp.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">{event.processingTime.toFixed(0)}ms</TableCell>
                      <TableCell className="text-sm">{event.retryCount}</TableCell>
                      <TableCell className="text-sm text-red-600">
                        {event.error || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
