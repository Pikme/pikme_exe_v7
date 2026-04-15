import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRecipientsList, usePagination } from "@/hooks/useEngagementAnalytics";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight, Search, Mail } from "lucide-react";

/**
 * Recipient Profiles Component
 * Displays recipient engagement profiles and activity
 */
export function RecipientProfiles() {
  const [searchEmail, setSearchEmail] = useState("");
  const [sortBy, setSortBy] = useState<"engagement" | "opens" | "clicks" | "recent">("engagement");
  const pagination = usePagination(15);

  const { data: recipientsData, isLoading } = useRecipientsList(
    pagination.limit,
    pagination.offset,
    sortBy
  );

  // Mock data for demonstration
  const mockRecipients = [
    {
      recipientEmail: "john.doe@example.com",
      totalEvents: 45,
      openCount: 28,
      clickCount: 12,
      bounceCount: 2,
      complaintCount: 0,
      engagementRate: 88.9,
      lastEventAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      firstEventAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
    {
      recipientEmail: "jane.smith@example.com",
      totalEvents: 38,
      openCount: 24,
      clickCount: 9,
      bounceCount: 1,
      complaintCount: 0,
      engagementRate: 86.8,
      lastEventAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      firstEventAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
    },
    {
      recipientEmail: "bob.wilson@example.com",
      totalEvents: 52,
      openCount: 35,
      clickCount: 18,
      bounceCount: 3,
      complaintCount: 1,
      engagementRate: 84.6,
      lastEventAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
      firstEventAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000),
    },
    {
      recipientEmail: "alice.johnson@example.com",
      totalEvents: 31,
      openCount: 18,
      clickCount: 6,
      bounceCount: 2,
      complaintCount: 0,
      engagementRate: 77.4,
      lastEventAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      firstEventAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    },
    {
      recipientEmail: "charlie.brown@example.com",
      totalEvents: 28,
      openCount: 14,
      clickCount: 4,
      bounceCount: 5,
      complaintCount: 2,
      engagementRate: 64.3,
      lastEventAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      firstEventAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    },
  ];

  const recipients = recipientsData?.recipients || mockRecipients;
  const total = recipientsData?.total || mockRecipients.length;

  // Filter by search
  const filteredRecipients = recipients.filter((r) =>
    r.recipientEmail.toLowerCase().includes(searchEmail.toLowerCase())
  );

  const getEngagementBadge = (rate: number) => {
    if (rate >= 80) return { label: "Highly Engaged", color: "bg-green-100 text-green-800" };
    if (rate >= 60) return { label: "Engaged", color: "bg-blue-100 text-blue-800" };
    if (rate >= 40) return { label: "Moderate", color: "bg-yellow-100 text-yellow-800" };
    return { label: "Low Engagement", color: "bg-red-100 text-red-800" };
  };

  return (
    <div className="space-y-6">
      {/* Search and Sort */}
      <Card>
        <CardHeader>
          <CardTitle>Recipient Profiles</CardTitle>
          <CardDescription>Email recipient engagement and activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by email address..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Sort Options */}
            <div className="flex flex-wrap gap-2">
              {(["engagement", "opens", "clicks", "recent"] as const).map((option) => (
                <Button
                  key={option}
                  variant={sortBy === option ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSortBy(option)}
                  className="capitalize"
                >
                  Sort by {option === "recent" ? "Recent" : option}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recipients List */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredRecipients.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-600">No recipients found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredRecipients.map((recipient) => {
                const engagement = getEngagementBadge(recipient.engagementRate);
                return (
                  <RecipientRow
                    key={recipient.recipientEmail}
                    recipient={recipient}
                    engagementBadge={engagement}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Showing {pagination.offset + 1} to{" "}
          {Math.min(pagination.offset + pagination.limit, total)} of {total} recipients
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.handlePrevPage}
            disabled={pagination.offset === 0}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={pagination.handleNextPage}
            disabled={pagination.offset + pagination.limit >= total}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Recipient Row Component
 */
function RecipientRow({
  recipient,
  engagementBadge,
}: {
  recipient: any;
  engagementBadge: { label: string; color: string };
}) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="w-4 h-4 text-slate-400" />
            <h3 className="font-semibold text-slate-900">{recipient.recipientEmail}</h3>
            <Badge className={engagementBadge.color}>{engagementBadge.label}</Badge>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            <MetricItem label="Opens" value={recipient.openCount} color="blue" />
            <MetricItem label="Clicks" value={recipient.clickCount} color="green" />
            <MetricItem label="Bounces" value={recipient.bounceCount} color="red" />
            <MetricItem label="Complaints" value={recipient.complaintCount} color="orange" />
            <MetricItem label="Total Events" value={recipient.totalEvents} color="slate" />
          </div>
        </div>

        {/* Engagement Rate */}
        <div className="flex-shrink-0 text-right">
          <div className="text-2xl font-bold text-slate-900">
            {recipient.engagementRate.toFixed(1)}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Engagement Rate</p>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-600">
          <div>
            <p className="font-medium text-slate-900">Last Activity</p>
            <p>{formatDate(recipient.lastEventAt)}</p>
          </div>
          <div className="text-right">
            <p className="font-medium text-slate-900">First Activity</p>
            <p>{formatDate(recipient.firstEventAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Item Component
 */
function MetricItem({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "blue" | "green" | "red" | "orange" | "slate";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
    orange: "bg-orange-50 text-orange-700",
    slate: "bg-slate-50 text-slate-700",
  };

  return (
    <div className={`p-2 rounded ${colorClasses[color]} text-center`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
