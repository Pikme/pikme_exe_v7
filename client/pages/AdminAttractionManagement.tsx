import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Edit2, Trash2, Search, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { AttractionsCSVImport } from "@/components/AttractionsCSVImport";
import { AdminLayout } from "@/components/AdminLayout";

const ATTRACTION_TYPES = [
  "landmark",
  "restaurant",
  "museum",
  "temple",
  "monument",
  "park",
  "cafe",
  "shopping",
  "other",
];

interface FormData {
  locationId: number;
  name: string;
  slug: string;
  type: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  openingHours: string;
  closedOn: string;
  latitude: string;
  longitude: string;
  image: string;
  rating: string;
  reviewCount: string;
  entryFee: string;
  estimatedVisitTime: string;
  bestTimeToVisit: string;
  highlights: string;
  isFeatured: boolean;
  isActive: boolean;
}

const initialFormData: FormData = {
  locationId: 1,
  name: "",
  slug: "",
  type: "landmark",
  description: "",
  address: "",
  phone: "",
  email: "",
  website: "",
  openingHours: "",
  closedOn: "",
  latitude: "",
  longitude: "",
  image: "",
  rating: "",
  reviewCount: "",
  entryFee: "",
  estimatedVisitTime: "",
  bestTimeToVisit: "",
  highlights: "",
  isFeatured: false,
  isActive: true,
};

export function AdminAttractionManagement() {
  const { toast } = useToast();
  const utils = trpc.useUtils();

  // State management
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [locationId, setLocationId] = useState<number>(1);
  const [isFeaturedFilter, setIsFeaturedFilter] = useState<string>("");
  const [isActiveFilter, setIsActiveFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "rating" | "created" | "featured">("created");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);

  // Form state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // API queries
  const { data: attractions, isLoading, isFetching } = trpc.adminAttractions.listAll.useQuery(
    {
      search: search || undefined,
      type: typeFilter || undefined,
      locationId: locationId || undefined,
      isFeatured: isFeaturedFilter === "" ? undefined : isFeaturedFilter === "true",
      isActive: isActiveFilter === "" ? undefined : isActiveFilter === "true",
      limit: pageSize,
      offset: (currentPage - 1) * pageSize,
      sortBy,
      sortOrder,
    },
    { enabled: true }
  );

  const { data: stats } = trpc.adminAttractions.getStats.useQuery({ locationId });
  const { data: count } = trpc.adminAttractions.countAll.useQuery({
    search: search || undefined,
    type: typeFilter || undefined,
    locationId: locationId || undefined,
    isFeatured: isFeaturedFilter === "" ? undefined : isFeaturedFilter === "true",
    isActive: isActiveFilter === "" ? undefined : isActiveFilter === "true",
  });

  // Mutations
  const createMutation = trpc.attractions.create.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Attraction created successfully" });
      utils.adminAttractions.listAll.invalidate();
      utils.adminAttractions.countAll.invalidate();
      utils.adminAttractions.getStats.invalidate();
      setIsAddModalOpen(false);
      setFormData(initialFormData);
      setImagePreview("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.attractions.update.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Attraction updated successfully" });
      utils.adminAttractions.listAll.invalidate();
      utils.adminAttractions.countAll.invalidate();
      utils.adminAttractions.getStats.invalidate();
      setIsEditModalOpen(false);
      setEditingId(null);
      setFormData(initialFormData);
      setImagePreview("");
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.attractions.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Success", description: "Attraction deleted successfully" });
      utils.adminAttractions.listAll.invalidate();
      utils.adminAttractions.countAll.invalidate();
      utils.adminAttractions.getStats.invalidate();
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleFeaturedMutation = trpc.adminAttractions.toggleFeatured.useMutation({
    onSuccess: () => {
      utils.adminAttractions.listAll.invalidate();
      utils.adminAttractions.getStats.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const toggleActiveMutation = trpc.adminAttractions.toggleActive.useMutation({
    onSuccess: () => {
      utils.adminAttractions.listAll.invalidate();
      utils.adminAttractions.getStats.invalidate();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  // Handlers
  const handleImageUpload = async (file: File) => {
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
      setFormData(prev => ({ ...prev, image: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleAddAttraction = () => {
    if (!formData.name || !formData.slug) {
      toast({ title: "Error", description: "Name and slug are required", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      ...formData,
      locationId: parseInt(formData.locationId.toString()),
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      highlights: formData.highlights ? formData.highlights.split(",").map(h => h.trim()) : undefined,
    } as any);
  };

  const handleEditAttraction = (attraction: any) => {
    setEditingId(attraction.id);
    setFormData({
      locationId: attraction.locationId,
      name: attraction.name,
      slug: attraction.slug,
      type: attraction.type,
      description: attraction.description || "",
      address: attraction.address || "",
      phone: attraction.phone || "",
      email: attraction.email || "",
      website: attraction.website || "",
      openingHours: attraction.openingHours || "",
      closedOn: attraction.closedOn || "",
      latitude: attraction.latitude?.toString() || "",
      longitude: attraction.longitude?.toString() || "",
      image: attraction.image || "",
      rating: attraction.rating?.toString() || "",
      reviewCount: attraction.reviewCount?.toString() || "",
      entryFee: attraction.entryFee || "",
      estimatedVisitTime: attraction.estimatedVisitTime || "",
      bestTimeToVisit: attraction.bestTimeToVisit || "",
      highlights: Array.isArray(attraction.highlights) ? attraction.highlights.join(", ") : "",
      isFeatured: attraction.isFeatured,
      isActive: attraction.isActive,
    });
    setImagePreview(attraction.image || "");
    setIsEditModalOpen(true);
  };

  const handleUpdateAttraction = () => {
    if (!editingId) return;

    updateMutation.mutate({
      id: editingId,
      ...formData,
      rating: formData.rating ? parseFloat(formData.rating) : undefined,
      reviewCount: formData.reviewCount ? parseInt(formData.reviewCount) : undefined,
      latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
      longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
      highlights: formData.highlights ? formData.highlights.split(",").map(h => h.trim()) : undefined,
    } as any);
  };

  const handleDeleteAttraction = (id: number) => {
    setDeleteId(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteId) {
      deleteMutation.mutate({ id: deleteId });
    }
  };

  const totalPages = Math.ceil((count || 0) / pageSize);

  return (
    <AdminLayout title="AttractionManagement">
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Attraction Management</h1>
          <p className="text-gray-600 mt-1">Manage city attractions, landmarks, and restaurants</p>
        </div>
        <div className="flex gap-2">
          <AttractionsCSVImport />
          <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Attraction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Attraction</DialogTitle>
              </DialogHeader>
              <AttractionForm
                formData={formData}
                setFormData={setFormData}
                imagePreview={imagePreview}
                onImageUpload={handleImageUpload}
                onSubmit={handleAddAttraction}
                isLoading={createMutation.isPending}
                onCancel={() => {
                  setIsAddModalOpen(false);
                  setFormData(initialFormData);
                  setImagePreview("");
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Attractions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Featured</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.featured || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {stats?.avgRating ? parseFloat(stats.avgRating as any).toFixed(1) : "N/A"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search attractions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>

            <Select value={typeFilter} onValueChange={(value) => {
              setTypeFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Types</SelectItem>
                {ATTRACTION_TYPES.map(type => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={isFeaturedFilter} onValueChange={(value) => {
              setIsFeaturedFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>

            <Select value={isActiveFilter} onValueChange={(value) => {
              setIsActiveFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Attractions ({count || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading || isFetching ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
          ) : attractions && attractions.length > 0 ? (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Name</th>
                      <th className="text-left py-3 px-4 font-semibold">Type</th>
                      <th className="text-left py-3 px-4 font-semibold">Address</th>
                      <th className="text-left py-3 px-4 font-semibold">Rating</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attractions.map((attraction) => (
                      <tr key={attraction.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            {attraction.image && (
                              <img
                                src={attraction.image}
                                alt={attraction.name}
                                className="w-8 h-8 rounded object-cover"
                              />
                            )}
                            <span className="font-medium">{attraction.name}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-1 bg-red-100 text-red-800 rounded text-xs font-medium">
                            {attraction.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 truncate max-w-xs">
                          {attraction.address || "—"}
                        </td>
                        <td className="py-3 px-4">
                          {attraction.rating ? (
                            <span className="font-medium">★ {parseFloat(attraction.rating as any).toFixed(1)}</span>
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            {attraction.isFeatured && (
                              <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                                Featured
                              </span>
                            )}
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                              attraction.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}>
                              {attraction.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditAttraction(attraction)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteAttraction(attraction.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages} ({count} total)
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </Button>
                    );
                  })}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No attractions found. Create one to get started!
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Attraction</DialogTitle>
          </DialogHeader>
          <AttractionForm
            formData={formData}
            setFormData={setFormData}
            imagePreview={imagePreview}
            onImageUpload={handleImageUpload}
            onSubmit={handleUpdateAttraction}
            isLoading={updateMutation.isPending}
            onCancel={() => {
              setIsEditModalOpen(false);
              setEditingId(null);
              setFormData(initialFormData);
              setImagePreview("");
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogTitle>Delete Attraction?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. The attraction will be permanently deleted.
          </AlertDialogDescription>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}

// Attraction Form Component
function AttractionForm({
  formData,
  setFormData,
  imagePreview,
  onImageUpload,
  onSubmit,
  isLoading,
  onCancel,
}: {
  formData: FormData;
  setFormData: (data: FormData) => void;
  imagePreview: string;
  onImageUpload: (file: File) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4">
      {/* Image Upload */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Image</label>
        <div className="flex gap-4">
          {imagePreview && (
            <img src={imagePreview} alt="Preview" className="w-20 h-20 rounded object-cover" />
          )}
          <input
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && onImageUpload(e.target.files[0])}
            className="flex-1"
          />
        </div>
      </div>

      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Name *</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Attraction name"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Slug *</label>
          <Input
            value={formData.slug}
            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
            placeholder="attraction-slug"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border rounded-md"
          >
            {ATTRACTION_TYPES.map(type => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Rating</label>
          <Input
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
            placeholder="4.5"
          />
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Attraction description"
          rows={3}
        />
      </div>

      {/* Contact Info */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Phone</label>
          <Input
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+91-..."
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="email@example.com"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Website</label>
          <Input
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
            placeholder="https://..."
          />
        </div>
      </div>

      {/* Location Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Address</label>
          <Input
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Street address"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Opening Hours</label>
          <Input
            value={formData.openingHours}
            onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
            placeholder="9:00 AM - 6:00 PM"
          />
        </div>
      </div>

      {/* Coordinates */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Latitude</label>
          <Input
            type="number"
            step="0.0001"
            value={formData.latitude}
            onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
            placeholder="27.1751"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Longitude</label>
          <Input
            type="number"
            step="0.0001"
            value={formData.longitude}
            onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
            placeholder="78.0421"
          />
        </div>
      </div>

      {/* Additional Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium">Entry Fee</label>
          <Input
            value={formData.entryFee}
            onChange={(e) => setFormData({ ...formData, entryFee: e.target.value })}
            placeholder="₹250"
          />
        </div>
        <div className="space-y-2">
          <label className="block text-sm font-medium">Estimated Visit Time</label>
          <Input
            value={formData.estimatedVisitTime}
            onChange={(e) => setFormData({ ...formData, estimatedVisitTime: e.target.value })}
            placeholder="2-3 hours"
          />
        </div>
      </div>

      {/* Status */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isFeatured}
            onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
          />
          <span className="text-sm">Featured</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
          />
          <span className="text-sm">Active</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isLoading}>
          {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          {isLoading ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}
