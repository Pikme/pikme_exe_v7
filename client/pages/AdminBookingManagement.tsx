import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Download, Trash2, Eye, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface TeamMember {
  id: number;
  name: string | null;
  email: string | null;
}

interface Enquiry {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  tourId: number;
  numberOfTravelers: number;
  status: "new" | "contacted" | "booked" | "rejected";
  createdAt: Date;
  contactedAt: Date | null;
  assignedTo: number | null;
  tourName: string | null;
}

const statusColors: Record<string, string> = {
  new: "bg-red-100 text-red-800",
  contacted: "bg-yellow-100 text-yellow-800",
  booked: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function AdminBookingManagement() {
  const { toast } = useToast();
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [notes, setNotes] = useState("");

  // Fetch enquiries
  const { data: enquiriesData, isLoading, refetch } = trpc.bookingEnquiriesAdmin.list.useQuery({
    status: selectedStatus as any,
    search: searchTerm,
    limit: pageSize,
    offset: page * pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch statistics
  const { data: stats } = trpc.bookingEnquiriesAdmin.getStats.useQuery();

  // Mutations
  const updateStatusMutation = trpc.bookingEnquiriesAdmin.updateStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Status updated successfully" });
      refetch();
    },
  });

  const updateNotesMutation = trpc.bookingEnquiriesAdmin.updateNotes.useMutation({
    onSuccess: () => {
      toast({ title: "Notes updated successfully" });
      refetch();
    },
  });

  const bulkUpdateMutation = trpc.bookingEnquiriesAdmin.bulkUpdateStatus.useMutation({
    onSuccess: () => {
      toast({ title: "Bulk update completed" });
      setSelectedIds(new Set());
      refetch();
    },
  });

  const bulkDeleteMutation = trpc.bookingEnquiriesAdmin.bulkDelete.useMutation({
    onSuccess: () => {
      toast({ title: "Enquiries deleted successfully" });
      setSelectedIds(new Set());
      refetch();
    },
  });

  const exportMutation = trpc.bookingEnquiriesAdmin.exportCSV.useQuery(
    { status: selectedStatus as any },
    { enabled: false }
  );

  const enquiries = enquiriesData?.enquiries || [];
  const total = enquiriesData?.total || 0;
  const totalPages = Math.ceil(total / pageSize);

  const handleSelectAll = () => {
    if (selectedIds.size === enquiries.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(enquiries.map((e) => e.id)));
    }
  };

  const handleSelectEnquiry = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleViewDetails = (enquiry: Enquiry) => {
    setSelectedEnquiry(enquiry);
    setNotes(enquiry.notes || "");
    setShowDetailModal(true);
  };

  const handleStatusChange = (status: string) => {
    if (selectedEnquiry) {
      updateStatusMutation.mutate(
        { id: selectedEnquiry.id, status: status as any },
        {
          onSuccess: () => {
            setSelectedEnquiry({
              ...selectedEnquiry,
              status: status as any,
            });
          },
        }
      );
    }
  };

  const handleSaveNotes = () => {
    if (selectedEnquiry) {
      updateNotesMutation.mutate({
        id: selectedEnquiry.id,
        notes,
      });
    }
  };

  const handleBulkStatusUpdate = (status: string) => {
    bulkUpdateMutation.mutate({
      ids: Array.from(selectedIds),
      status: status as any,
    });
  };

  const handleBulkDelete = () => {
    if (confirm("Are you sure you want to delete these enquiries?")) {
      bulkDeleteMutation.mutate(Array.from(selectedIds));
    }
  };

  const handleExport = async () => {
    const csvData = await exportMutation.refetch();
    if (csvData.data) {
      const blob = new Blob([csvData.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `booking-enquiries-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Enquiries</h1>
          <p className="text-muted-foreground">
            Manage and track all customer booking enquiries
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Enquiries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.new || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contacted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.contacted || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Booked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.booked || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.conversionRate || 0}%</div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Search</label>
                <Input
                  placeholder="Search by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                />
              </div>

              <div className="flex items-end gap-2">
                <Button variant="outline" onClick={() => handleExport()}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  {selectedIds.size} enquiries selected
                </p>
                <div className="flex gap-2">
                  <Select onValueChange={handleBulkStatusUpdate}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Change Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Mark as New</SelectItem>
                      <SelectItem value="contacted">Mark as Contacted</SelectItem>
                      <SelectItem value="booked">Mark as Booked</SelectItem>
                      <SelectItem value="rejected">Mark as Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBulkDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Table */}
        <Card>
          <CardHeader>
            <CardTitle>Enquiries List</CardTitle>
            <CardDescription>
              Showing {enquiries.length} of {total} enquiries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">
                      <Checkbox
                        checked={selectedIds.size === enquiries.length && enquiries.length > 0}
                        onCheckedChange={handleSelectAll}
                      />
                    </th>
                    <th className="text-left py-3 px-4 font-medium">Customer</th>
                    <th className="text-left py-3 px-4 font-medium">Tour</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Date</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8">
                        Loading...
                      </td>
                    </tr>
                  ) : enquiries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-muted-foreground">
                        No enquiries found
                      </td>
                    </tr>
                  ) : (
                    enquiries.map((enquiry) => (
                      <tr key={enquiry.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <Checkbox
                            checked={selectedIds.has(enquiry.id)}
                            onCheckedChange={() => handleSelectEnquiry(enquiry.id)}
                          />
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium">
                              {enquiry.firstName} {enquiry.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{enquiry.email}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">{enquiry.tourName || "N/A"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge className={statusColors[enquiry.status]}>
                            {enquiry.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-sm">
                            {new Date(enquiry.createdAt).toLocaleDateString()}
                          </p>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewDetails(enquiry)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange("contacted")}
                                >
                                  Mark as Contacted
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange("booked")}
                                >
                                  Mark as Booked
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleStatusChange("rejected")}
                                >
                                  Mark as Rejected
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Page {page + 1} of {totalPages || 1}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages - 1}
                  onClick={() => setPage(page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detail Modal */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Enquiry Details</DialogTitle>
            <DialogDescription>
              View and manage enquiry information
            </DialogDescription>
          </DialogHeader>

          {selectedEnquiry && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div>
                <h3 className="font-semibold mb-3">Customer Information</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="text-sm text-muted-foreground">Name</label>
                    <p className="font-medium">
                      {selectedEnquiry.firstName} {selectedEnquiry.lastName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Email</label>
                    <p className="font-medium">{selectedEnquiry.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Phone</label>
                    <p className="font-medium">{selectedEnquiry.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground">Travelers</label>
                    <p className="font-medium">{selectedEnquiry.numberOfTravelers}</p>
                  </div>
                </div>
              </div>

              {/* Tour Information */}
              <div>
                <h3 className="font-semibold mb-3">Tour Information</h3>
                <div>
                  <label className="text-sm text-muted-foreground">Tour</label>
                  <p className="font-medium">{selectedEnquiry.tourName || "N/A"}</p>
                </div>
              </div>

              {/* Status */}
              <div>
                <h3 className="font-semibold mb-3">Status</h3>
                <Select value={selectedEnquiry.status} onValueChange={handleStatusChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="booked">Booked</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Notes */}
              <div>
                <h3 className="font-semibold mb-3">Admin Notes</h3>
                <textarea
                  className="w-full border rounded-md p-2 text-sm"
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add internal notes..."
                />
                <Button className="mt-2" onClick={handleSaveNotes}>
                  Save Notes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
