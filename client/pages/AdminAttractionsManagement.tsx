import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Plus, Edit2, Trash2, Search, Download, Upload, Star } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { AdminLayout } from "@/components/AdminLayout";

const ATTRACTION_TYPES = [
  { value: "landmark", label: "🏛️ Landmark" },
  { value: "restaurant", label: "🍽️ Restaurant" },
  { value: "museum", label: "🏢 Museum" },
  { value: "temple", label: "⛪ Temple" },
  { value: "monument", label: "🏔️ Monument" },
  { value: "park", label: "🌳 Park" },
  { value: "cafe", label: "☕ Cafe" },
  { value: "shopping", label: "🛍️ Shopping" },
  { value: "other", label: "📍 Other" },
];

interface AttractionFormData {
  name: string;
  slug: string;
  type: string;
  description: string;
  address: string;
  cityId: string;
  rating: string;
  image: string;
  openingHours: string;
  closedOn: string;
  entryFee: string;
  estimatedVisitTime: string;
  highlights: string;
  phone: string;
  email: string;
  website: string;
}

const INITIAL_FORM_DATA: AttractionFormData = {
  name: "",
  slug: "",
  type: "landmark",
  description: "",
  address: "",
  cityId: "",
  rating: "4.5",
  image: "",
  openingHours: "9:00 AM - 6:00 PM",
  closedOn: "Monday",
  entryFee: "Free",
  estimatedVisitTime: "2 hours",
  highlights: "",
  phone: "",
  email: "",
  website: "",
};

export default function AdminAttractionsManagement() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterCity, setFilterCity] = useState("all");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] = useState<any>(null);
  const [formData, setFormData] = useState<AttractionFormData>(INITIAL_FORM_DATA);

  // Fetch attractions
  const { data: attractions, isLoading: attractionsLoading, refetch: refetchAttractions } = trpc.attractions.list.useQuery({
    limit: 1000,
  });

  // Fetch cities for dropdown
  const { data: cities } = trpc.locations.list.useQuery({ limit: 1000 });

  // Mutations
  const { mutate: createAttraction, isPending: isCreating } = trpc.attractions.create.useMutation({
    onSuccess: () => {
      toast.success("Attraction created successfully!");
      setIsAddOpen(false);
      setFormData(INITIAL_FORM_DATA);
      refetchAttractions();
    },
    onError: (error) => {
      toast.error("Failed to create attraction: " + error.message);
    },
  });

  const { mutate: updateAttraction, isPending: isUpdating } = trpc.attractions.update.useMutation({
    onSuccess: () => {
      toast.success("Attraction updated successfully!");
      setIsEditOpen(false);
      setFormData(INITIAL_FORM_DATA);
      refetchAttractions();
    },
    onError: (error) => {
      toast.error("Failed to update attraction: " + error.message);
    },
  });

  const { mutate: deleteAttraction, isPending: isDeleting } = trpc.attractions.delete.useMutation({
    onSuccess: () => {
      toast.success("Attraction deleted successfully!");
      setIsDeleteOpen(false);
      setSelectedAttraction(null);
      refetchAttractions();
    },
    onError: (error) => {
      toast.error("Failed to delete attraction: " + error.message);
    },
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <Button asChild>
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Filter attractions
  const filteredAttractions = useMemo(() => {
    return (attractions || []).filter((attraction: any) => {
      const matchesSearch = attraction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        attraction.address.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || attraction.type === filterType;
      const matchesCity = filterCity === "all" || attraction.cityId === filterCity;
      return matchesSearch && matchesType && matchesCity;
    });
  }, [attractions, searchTerm, filterType, filterCity]);

  const handleAddClick = () => {
    setFormData(INITIAL_FORM_DATA);
    setIsAddOpen(true);
  };

  const handleEditClick = (attraction: any) => {
    setSelectedAttraction(attraction);
    setFormData({
      name: attraction.name,
      slug: attraction.slug,
      type: attraction.type,
      description: attraction.description || "",
      address: attraction.address || "",
      cityId: attraction.cityId || "",
      rating: attraction.rating?.toString() || "4.5",
      image: attraction.image || "",
      openingHours: attraction.openingHours || "",
      closedOn: attraction.closedOn || "",
      entryFee: attraction.entryFee || "",
      estimatedVisitTime: attraction.estimatedVisitTime || "",
      highlights: Array.isArray(attraction.highlights) ? attraction.highlights.join(", ") : "",
      phone: attraction.phone || "",
      email: attraction.email || "",
      website: attraction.website || "",
    });
    setIsEditOpen(true);
  };

  const handleDeleteClick = (attraction: any) => {
    setSelectedAttraction(attraction);
    setIsDeleteOpen(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (value: string) => {
    handleFormChange("name", value);
    if (!formData.slug || formData.slug === generateSlug(formData.name)) {
      handleFormChange("slug", generateSlug(value));
    }
  };

  const handleSave = () => {
    if (!formData.name || !formData.type || !formData.address || !formData.cityId) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      name: formData.name,
      slug: formData.slug || generateSlug(formData.name),
      type: formData.type,
      description: formData.description,
      address: formData.address,
      cityId: formData.cityId,
      rating: parseFloat(formData.rating) || 4.5,
      image: formData.image,
      openingHours: formData.openingHours,
      closedOn: formData.closedOn,
      entryFee: formData.entryFee,
      estimatedVisitTime: formData.estimatedVisitTime,
      highlights: formData.highlights ? formData.highlights.split(",").map((h) => h.trim()) : [],
      phone: formData.phone,
      email: formData.email,
      website: formData.website,
    };

    if (selectedAttraction) {
      updateAttraction({ id: selectedAttraction.id, ...payload });
    } else {
      createAttraction(payload);
    }
  };

  const handleDelete = () => {
    if (selectedAttraction) {
      deleteAttraction({ id: selectedAttraction.id });
    }
  };

  const handleDownloadTemplate = () => {
    const template = [
      ["Name", "Type", "Address", "City ID", "Description", "Rating", "Opening Hours", "Entry Fee", "Estimated Visit Time", "Highlights", "Phone", "Email", "Website"],
      ["Taj Mahal", "monument", "Agra, Uttar Pradesh", "1", "Iconic white marble mausoleum", "4.8", "6:00 AM - 7:00 PM", "₹250", "2-3 hours", "UNESCO World Heritage, Marble inlay, Symmetrical design", "+91-562-2226431", "info@tajmahal.gov.in", "www.tajmahal.gov.in"],
      ["Agra Fort", "landmark", "Agra, Uttar Pradesh", "1", "Historic Mughal fort", "4.6", "6:00 AM - 4:30 PM", "₹300", "2 hours", "Red sandstone, Mughal architecture, River views", "+91-562-2226002", "info@agrafort.gov.in", "www.agrafort.gov.in"],
    ];

    const csv = template.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "attractions-template.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Template downloaded!");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Attractions Management</h1>
          <p className="text-gray-600">Manage city attractions, landmarks, restaurants, and more</p>
        </div>

        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search attractions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {ATTRACTION_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterCity} onValueChange={setFilterCity}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by city" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cities</SelectItem>
              {cities?.map((city: any) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex gap-2">
            <Button onClick={handleAddClick} className="flex-1">
              <Plus className="w-4 h-4 mr-2" />
              Add Attraction
            </Button>
            <Button onClick={handleDownloadTemplate} variant="outline">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Attractions Table */}
        <Card>
          <CardHeader>
            <CardTitle>
              Attractions ({filteredAttractions.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {attractionsLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-red-600" />
              </div>
            ) : filteredAttractions.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No attractions found</p>
                <Button onClick={handleAddClick}>Add First Attraction</Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>City</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAttractions.map((attraction: any) => (
                      <TableRow key={attraction.id}>
                        <TableCell className="font-medium">{attraction.name}</TableCell>
                        <TableCell>
                          {ATTRACTION_TYPES.find((t) => t.value === attraction.type)?.label || attraction.type}
                        </TableCell>
                        <TableCell>
                          {cities?.find((c: any) => c.id === attraction.cityId)?.name || "Unknown"}
                        </TableCell>
                        <TableCell className="text-sm text-gray-600 max-w-xs truncate">
                          {attraction.address}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            {attraction.rating || "N/A"}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditClick(attraction)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClick(attraction)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isAddOpen || isEditOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddOpen(false);
          setIsEditOpen(false);
          setFormData(INITIAL_FORM_DATA);
          setSelectedAttraction(null);
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedAttraction ? "Edit Attraction" : "Add New Attraction"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g., Taj Mahal"
                />
              </div>
              <div>
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleFormChange("slug", e.target.value)}
                  placeholder="auto-generated"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type *</Label>
                <Select value={formData.type} onValueChange={(value) => handleFormChange("type", value)}>
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTRACTION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City *</Label>
                <Select value={formData.cityId} onValueChange={(value) => handleFormChange("cityId", value)}>
                  <SelectTrigger id="city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    {cities?.map((city: any) => (
                      <SelectItem key={city.id} value={city.id}>
                        {city.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder="Detailed description of the attraction"
                rows={3}
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleFormChange("address", e.target.value)}
                placeholder="Full address"
              />
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => handleFormChange("rating", e.target.value)}
                  placeholder="4.5"
                />
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => handleFormChange("image", e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">Opening Hours</Label>
                <Input
                  id="hours"
                  value={formData.openingHours}
                  onChange={(e) => handleFormChange("openingHours", e.target.value)}
                  placeholder="9:00 AM - 6:00 PM"
                />
              </div>
              <div>
                <Label htmlFor="closed">Closed On</Label>
                <Input
                  id="closed"
                  value={formData.closedOn}
                  onChange={(e) => handleFormChange("closedOn", e.target.value)}
                  placeholder="Monday"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fee">Entry Fee</Label>
                <Input
                  id="fee"
                  value={formData.entryFee}
                  onChange={(e) => handleFormChange("entryFee", e.target.value)}
                  placeholder="₹250 (Indian), ₹500 (Foreign)"
                />
              </div>
              <div>
                <Label htmlFor="time">Estimated Visit Time</Label>
                <Input
                  id="time"
                  value={formData.estimatedVisitTime}
                  onChange={(e) => handleFormChange("estimatedVisitTime", e.target.value)}
                  placeholder="2-3 hours"
                />
              </div>
            </div>

            {/* Highlights */}
            <div>
              <Label htmlFor="highlights">Highlights (comma-separated)</Label>
              <Textarea
                id="highlights"
                value={formData.highlights}
                onChange={(e) => handleFormChange("highlights", e.target.value)}
                placeholder="Ancient architecture, Intricate carvings, Spiritual significance"
                rows={2}
              />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleFormChange("phone", e.target.value)}
                  placeholder="+91-562-2226431"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormChange("email", e.target.value)}
                  placeholder="info@attraction.com"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleFormChange("website", e.target.value)}
                placeholder="https://www.attraction.com"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSave}
                disabled={isCreating || isUpdating}
                className="flex-1"
              >
                {isCreating || isUpdating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Attraction"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsAddOpen(false);
                  setIsEditOpen(false);
                  setFormData(INITIAL_FORM_DATA);
                  setSelectedAttraction(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Attraction</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedAttraction?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
