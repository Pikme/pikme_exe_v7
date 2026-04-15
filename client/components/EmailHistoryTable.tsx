import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  Filter,
  RotateCcw,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

interface EmailHistoryTableProps {
  data: any[];
  total: number;
  loading: boolean;
  limit: number;
  offset: number;
  onPageChange: (offset: number) => void;
  onFilterChange: (filters: any) => void;
  onRefresh: () => void;
  onViewDetails: (email: any) => void;
}

/**
 * Email History Table Component
 * Displays email history with filtering and pagination
 */
export const EmailHistoryTable: React.FC<EmailHistoryTableProps> = ({
  data,
  total,
  loading,
  limit,
  offset,
  onPageChange,
  onFilterChange,
  onRefresh,
  onViewDetails,
}) => {
  const [filters, setFilters] = useState({
    templateType: "",
    status: "",
    recipientEmail: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      templateType: "",
      status: "",
      recipientEmail: "",
    });
    onFilterChange({
      templateType: "",
      status: "",
      recipientEmail: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTemplateTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      enquiry_assigned: "bg-blue-100 text-blue-800",
      enquiry_updated: "bg-amber-100 text-amber-800",
      enquiry_completed: "bg-green-100 text-green-800",
      team_message: "bg-purple-100 text-purple-800",
      system_alert: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.ceil(total / limit);
  const hasNextPage = offset + limit < total;
  const hasPrevPage = offset > 0;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
            {(filters.templateType || filters.status || filters.recipientEmail) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Template Type Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Template Type</label>
              <Select value={filters.templateType} onValueChange={(v) => handleFilterChange("templateType", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All types</SelectItem>
                  <SelectItem value="enquiry_assigned">Enquiry Assigned</SelectItem>
                  <SelectItem value="enquiry_updated">Enquiry Updated</SelectItem>
                  <SelectItem value="enquiry_completed">Enquiry Completed</SelectItem>
                  <SelectItem value="team_message">Team Message</SelectItem>
                  <SelectItem value="system_alert">System Alert</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Status Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(v) => handleFilterChange("status", v)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Recipient Email Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Recipient Email</label>
              <Input
                placeholder="Search email..."
                value={filters.recipientEmail}
                onChange={(e) => handleFilterChange("recipientEmail", e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Email History</CardTitle>
              <CardDescription>
                Showing {data.length} of {total} emails
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Template Type</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Recipient</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : data.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No emails found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.map((email) => (
                    <TableRow key={email.id}>
                      <TableCell>
                        <Badge className={getTemplateTypeColor(email.templateType)}>
                          {email.templateType.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{email.subject}</TableCell>
                      <TableCell className="max-w-xs truncate">{email.recipientEmail}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(email.status)}>
                          {email.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {email.sentAt
                          ? formatDistanceToNow(new Date(email.sentAt), { addSuffix: true })
                          : "-"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {email.htmlSize ? `${Math.round(email.htmlSize / 1024)}KB` : "-"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewDetails(email)}
                          className="gap-2"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Page {currentPage} of {totalPages} ({total} total)
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(Math.max(0, offset - limit))}
            disabled={!hasPrevPage || loading}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(offset + limit)}
            disabled={!hasNextPage || loading}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmailHistoryTable;
