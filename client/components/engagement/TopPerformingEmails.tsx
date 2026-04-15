import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTopEmails, usePagination } from "@/hooks/useEngagementAnalytics";
import { Badge } from "@/components/ui/badge";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Top Performing Emails Component
 * Displays the highest engagement emails
 */
export function TopPerformingEmails() {
  const pagination = usePagination(10);
  const { data: emails, isLoading } = useTopEmails(pagination.limit, pagination.offset);

  const mockEmails = [
    {
      id: 1,
      emailHistoryId: 101,
      subject: "Limited Time Offer: 50% Off Your Next Purchase",
      openCount: 1245,
      clickCount: 389,
      openRate: 45.2,
      clickRate: 15.8,
      engagementScore: 92,
      uniqueOpenCount: 892,
      uniqueClickCount: 234,
      bounceCount: 12,
      complaintCount: 2,
    },
    {
      id: 2,
      emailHistoryId: 102,
      subject: "New Features Released: Check Out What's New",
      openCount: 1089,
      clickCount: 312,
      openRate: 42.1,
      clickRate: 12.4,
      engagementScore: 88,
      uniqueOpenCount: 756,
      uniqueClickCount: 198,
      bounceCount: 8,
      complaintCount: 1,
    },
    {
      id: 3,
      emailHistoryId: 103,
      subject: "Your Personalized Recommendations",
      openCount: 956,
      clickCount: 287,
      openRate: 38.9,
      clickRate: 11.7,
      engagementScore: 85,
      uniqueOpenCount: 654,
      uniqueClickCount: 167,
      bounceCount: 15,
      complaintCount: 3,
    },
    {
      id: 4,
      emailHistoryId: 104,
      subject: "Welcome to Our Community",
      openCount: 845,
      clickCount: 201,
      openRate: 35.2,
      clickRate: 8.4,
      engagementScore: 78,
      uniqueOpenCount: 512,
      uniqueClickCount: 98,
      bounceCount: 22,
      complaintCount: 5,
    },
    {
      id: 5,
      emailHistoryId: 105,
      subject: "Your Monthly Report",
      openCount: 723,
      clickCount: 156,
      openRate: 30.1,
      clickRate: 6.5,
      engagementScore: 72,
      uniqueOpenCount: 421,
      uniqueClickCount: 67,
      bounceCount: 18,
      complaintCount: 2,
    },
  ];

  const displayEmails = emails || mockEmails;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Emails</CardTitle>
          <CardDescription>Emails with the highest engagement scores</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <div className="space-y-4">
              {displayEmails.map((email, index) => (
                <EmailPerformanceRow key={email.id || index} email={email} rank={index + 1} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-600">
          Page {pagination.page} of {Math.ceil((displayEmails?.length || 0) / pagination.limit)}
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
            disabled={pagination.offset + pagination.limit >= (displayEmails?.length || 0)}
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
 * Email Performance Row Component
 */
function EmailPerformanceRow({
  email,
  rank,
}: {
  email: any;
  rank: number;
}) {
  const getScoreBadgeColor = (score: number) => {
    if (score >= 85) return "bg-green-100 text-green-800";
    if (score >= 70) return "bg-blue-100 text-blue-800";
    if (score >= 50) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="border rounded-lg p-4 hover:bg-slate-50 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                #{rank}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900 line-clamp-2">
                {email.subject}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Email ID: {email.emailHistoryId}
              </p>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-3">
            <MetricBadge label="Opens" value={email.openCount} color="blue" />
            <MetricBadge label="Clicks" value={email.clickCount} color="green" />
            <MetricBadge label="Open Rate" value={`${email.openRate?.toFixed(1) || 0}%`} color="blue" />
            <MetricBadge label="Click Rate" value={`${email.clickRate?.toFixed(1) || 0}%`} color="green" />
            <MetricBadge label="Bounces" value={email.bounceCount} color="red" />
          </div>
        </div>

        {/* Engagement Score */}
        <div className="flex-shrink-0 text-right">
          <Badge className={`${getScoreBadgeColor(email.engagementScore)} text-sm font-bold px-3 py-1`}>
            {email.engagementScore}
          </Badge>
          <p className="text-xs text-slate-500 mt-2">Engagement</p>
        </div>
      </div>

      {/* Additional Details */}
      <div className="mt-3 pt-3 border-t border-slate-200">
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
          <div>
            <p className="text-slate-500">Unique Opens</p>
            <p className="font-semibold text-slate-900">{email.uniqueOpenCount}</p>
          </div>
          <div>
            <p className="text-slate-500">Unique Clicks</p>
            <p className="font-semibold text-slate-900">{email.uniqueClickCount}</p>
          </div>
          <div>
            <p className="text-slate-500">Complaints</p>
            <p className="font-semibold text-slate-900">{email.complaintCount}</p>
          </div>
          <div>
            <p className="text-slate-500">CTR</p>
            <p className="font-semibold text-slate-900">
              {email.openCount > 0
                ? ((email.clickCount / email.openCount) * 100).toFixed(1)
                : 0}
              %
            </p>
          </div>
          <div>
            <p className="text-slate-500">Bounce Rate</p>
            <p className="font-semibold text-slate-900">
              {email.bounceCount > 0 ? ((email.bounceCount / (email.openCount + email.bounceCount)) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div>
            <p className="text-slate-500">Status</p>
            <p className="font-semibold text-green-600">Active</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Metric Badge Component
 */
function MetricBadge({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: "blue" | "green" | "red";
}) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };

  return (
    <div className={`p-2 rounded ${colorClasses[color]} text-center`}>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}
