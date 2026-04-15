import { Loader2, Plane, Plus, Edit2, Trash2, X, Check, Zap, Upload, Download, MapPin, Eye } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Papa from "papaparse";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/components/AdminLayout";

const activitySchema = z.object({
  locationId: z.coerce.number().min(1, "Location is required"),
  tourId: z.coerce.number().optional(),
  name: z.string().min(1, "Activity name is required"),
  slug: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  duration: z.string().optional(),
  price: z.coerce.number().optional(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
  bestTime: z.string().optional(),
  image: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type ActivityFormData = z.infer<typeof activitySchema>;

export default function AdminActivitiesManagement() {
  const { user, isLoading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number>(1);
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [inclusions, setInclusions] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const itemsPerPage = 10;

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
      </div>
    );
  }

  if (!user?.role || user.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-red-600">Access Denied. Admin only.</p>
      </div>
    );
  }

  const [formData, setFormData] = useState<ActivityFormData>({
    locationId: undefined as any,
    tourId: undefined,
    name: "",
    description: "",
    category: "",
    duration: "",
    price: undefined,
    difficulty: "moderate",
    bestTime: "",
    image: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  const { data: countries = [] } = trpc.countries.list.useQuery({
    limit: 100,
  });

  const { data: states = [] } = trpc.states.listByCountry.useQuery({
    countryId: selectedCountryId,
    limit: 100,
  });

  useEffect(() => {
    if (states.length > 0 && selectedStateId === null) {
      const madhyaPradesh = states.find(s => s.name === 'Madhya Pradesh');
      setSelectedStateId(madhyaPradesh?.id || states[0].id);
    }
  }, [states]);

  const { data: locations = [] } = trpc.locations.listByState.useQuery({
    stateId: selectedStateId || 0,
    limit: 100,
  }, {
    enabled: !!selectedStateId,
  });

  useEffect(() => {
    if (locations.length > 0 && selectedLocationId === null) {
      const ujjain = locations.find(l => l.name === 'Ujjain');
      setSelectedLocationId(ujjain?.id || locations[0].id);
    }
  }, [locations]);

  const { data: activities = [], isLoading } = trpc.activities.listByLocation.useQuery({
    locationId: selectedLocationId || 0,
    limit: 1000,
  }, {
    enabled: !!selectedLocationId,
  });

  const createMutation = trpc.activities.create.useMutation({
    onSuccess: () => {
      toast.success("Activity created successfully!");
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create activity");
    },
  });

  const updateMutation = trpc.activities.update.useMutation({
    onSuccess: () => {
      toast.success("Activity updated successfully!");
      // Invalidate cache to refresh the activities list
      trpc.useUtils().activities.list.invalidate();
      if (selectedLocationId) {
        trpc.useUtils().activities.listByLocation.invalidate({ locationId: selectedLocationId });
      }
      resetForm();
      setShowForm(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update activity");
    },
  });


  const deleteMutation = trpc.activities.delete.useMutation({
    onSuccess: () => {
      toast.success("Activity deleted successfully!");
      trpc.useUtils().activities.list.invalidate();
      if (selectedLocationId) {
        trpc.useUtils().activities.listByLocation.invalidate({ locationId: selectedLocationId });
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete activity");
    },
  });

  const resetForm = () => {
    setFormData({
      locationId: selectedLocationId || undefined,
      tourId: undefined,
      name: "",
      description: "",
      category: "",
      duration: "",
      price: undefined,
      difficulty: "moderate",
      bestTime: "",
      image: "",
    });
    setEditingId(null);
  };

  const handleDownloadTemplate = () => {
    const template = [
      {
        locationId: "1",
        name: "Sample Activity",
        description: "Sample description",
        category: "Adventure",
        duration: "2-3 hours",
        price: "500",
        difficulty: "easy",
        bestTime: "October to March",
      },
    ];
    const csv = Papa.unparse(template);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "activities_template.csv";
    a.click();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = activitySchema.parse({
        ...formData,
        locationId: selectedLocationId,
      });

      if (editingId) {
        updateMutation.mutate({
          id: editingId,
          ...validated,
          whatIncluded: inclusions,
          whatExcluded: exclusions,
        });
      } else {
        createMutation.mutate({
          ...validated,
          whatIncluded: inclusions,
          whatExcluded: exclusions,
        });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An error occurred");
      }
    }
  };

  const handleEdit = (activity: any) => {
    try {
      console.log('🔍 handleEdit called with activity:', activity);
      console.log('🔍 whatIncluded from activity:', activity.whatIncluded);
      console.log('🔍 whatExcluded from activity:', activity.whatExcluded);
      
      setFormData({
        locationId: activity.locationId,
        tourId: activity.tourId,
        name: activity.name,
        slug: activity.slug,
        description: activity.description,
        category: activity.category,
        duration: activity.duration,
        price: activity.price,
        difficulty: activity.difficulty,
        bestTime: activity.bestTime,
        image: activity.image,
        metaTitle: activity.metaTitle || "",
        metaDescription: activity.metaDescription || "",
        metaKeywords: activity.metaKeywords || "",
      });
      
      // Set location and state from activity
      if (activity.locationId) {
        setSelectedLocationId(activity.locationId);
      }
      
      setImageUrl(activity.image || "");
      
      console.log('🔍 Setting inclusions to:', activity.whatIncluded || "");
      console.log('🔍 Setting exclusions to:', activity.whatExcluded || "");
      
      setInclusions(activity.whatIncluded || "");
      setExclusions(activity.whatExcluded || "");
      setEditingId(activity.id);
      setShowForm(true);
      
      console.log("✅ Edit mode activated for activity:", activity.id);
    } catch (error) {
      console.error("❌ Error in handleEdit:", error);
      toast.error("Failed to open edit form");
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this activity?")) {
      deleteMutation.mutate({ id });
    }
  };

  const filteredActivitiesAll = activities.filter(activity =>
    activity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    activity.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredActivitiesAll.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedActivities = filteredActivitiesAll.slice(startIndex, startIndex + itemsPerPage);

  return (
    <AdminLayout title="Activities Management" description="Create, edit, and manage activities and experiences across India">
      <div key={`activities-${selectedLocationId}`} className="space-y-6">
      {/* Action Buttons */}
      <div className="flex gap-3 mb-6 flex-wrap">
        <Button variant="outline" className="gap-2" onClick={handleDownloadTemplate}>
          <Download className="w-4 h-4" />
          Download CSV Template
        </Button>
        <label className="cursor-pointer">
          <Button variant="outline" className="gap-2" asChild>
            <span>
              <Upload className="w-4 h-4" />
              Import CSV
            </span>
          </Button>
          <input type="file" accept=".csv" className="hidden" />
        </label>
        <Button onClick={() => { resetForm(); setShowForm(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Activity
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Country Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Country</label>
          <select
            value={selectedCountryId}
            onChange={(e) => {
              setSelectedCountryId(Number(e.target.value));
              setSelectedStateId(null);
              setSelectedLocationId(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            {countries.map(country => (
              <option key={country.id} value={country.id}>
                {country.name}
              </option>
            ))}
          </select>
        </div>

        {/* State Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Select State</label>
          <select
            value={selectedStateId || ""}
            onChange={(e) => {
              setSelectedStateId(Number(e.target.value) || null);
              setSelectedLocationId(null);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="">-- Select a state --</option>
            {states.map(state => (
              <option key={state.id} value={state.id}>
                {state.name}
              </option>
            ))}
          </select>
        </div>

        {/* Location Selector */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Location/City</label>
          <select
            value={(selectedLocationId || 1).toString()}
            onChange={(e) => {
              const newLocationId = parseInt(e.target.value, 10);
              setSelectedLocationId(newLocationId);
            }}
            disabled={!selectedStateId}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-100"
          >
            {locations.map(location => (
              <option key={location.id} value={location.id.toString()}>
                {location.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Search Activities</label>
        <input
          type="text"
          placeholder="Search by name, category, or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      {/* Form */}
      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Activity" : "Create New Activity"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Activity Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <input
                    type="text"
                    value={formData.category || ""}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Trekking, Water Sports"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tour Duration</label>
                  <input
                    type="text"
                    value={formData.duration || ""}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="e.g., 2 Nights / 3 Days"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Price per Person</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price || ""}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value ? Number(e.target.value) : undefined })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty || "moderate"}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="easy">Easy</option>
                    <option value="moderate">Moderate</option>
                    <option value="challenging">Challenging</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Best Time to Visit</label>
                <input
                  type="text"
                  value={formData.bestTime || ""}
                  onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                  placeholder="e.g., October to March"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-semibold mb-3 text-green-900">SEO Meta Tags</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle || ""}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Page title for search engines (50-60 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords || ""}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="Comma-separated keywords (e.g., adventure, hiking, nature)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription || ""}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Brief description for search results (150-160 characters)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-20"
                    />
                  </div>
                </div>
              </div>

              {editingId && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">Activity Images</h3>
                    <div>
                      <label className="block text-sm font-medium mb-2">Image URL</label>
                      <input
                        type="text"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste image URL here (e.g., https://example.com/image.jpg)"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      {imageUrl && (
                        <div className="mt-3 p-2 border rounded-md bg-gray-50">
                          <img src={imageUrl} alt="Preview" className="max-w-full h-auto max-h-48 rounded" />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="text-sm font-semibold mb-3">Inclusions and Exclusions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">What is Included</label>
                        <textarea
                          value={inclusions}
                          onChange={(e) => setInclusions(e.target.value)}
                          placeholder="Enter included items (one per line)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-40"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">What is Excluded</label>
                        <textarea
                          value={exclusions}
                          onChange={(e) => setExclusions(e.target.value)}
                          placeholder="Enter excluded items (one per line)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 h-40"
                        />
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      {editingId ? "Update" : "Create"}
                    </>
                  )}
                </Button>
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Activities List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            Activities {selectedLocationId && locations.find(l => l.id === selectedLocationId) && (
              <span className="text-gray-600">for {locations.find(l => l.id === selectedLocationId)?.name}</span>
            )}
          </h2>
          {selectedIds.size > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => {
                  if (confirm(`Delete ${selectedIds.size} activities?`)) {
                    selectedIds.forEach(id => deleteMutation.mutate({ id }));
                    setSelectedIds(new Set());
                  }
                }}
              >
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-red-500" />
          </div>
        ) : filteredActivitiesAll.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No activities yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Select All Checkbox */}
            <div className="flex items-center gap-2 mb-3 p-3 bg-gray-50 rounded">
              <input
                type="checkbox"
                checked={selectedIds.size === paginatedActivities.length && paginatedActivities.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    const newSelected = new Set(selectedIds);
                    paginatedActivities.forEach(a => newSelected.add(a.id));
                    setSelectedIds(newSelected);
                  } else {
                    const newSelected = new Set(selectedIds);
                    paginatedActivities.forEach(a => newSelected.delete(a.id));
                    setSelectedIds(newSelected);
                  }
                }}
                className="w-4 h-4 cursor-pointer"
              />
              <label className="text-sm font-medium cursor-pointer">Select all on this page</label>
            </div>
            {paginatedActivities.map(activity => (
              <Card key={activity.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(activity.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedIds);
                          if (e.target.checked) {
                            newSelected.add(activity.id);
                          } else {
                            newSelected.delete(activity.id);
                          }
                          setSelectedIds(newSelected);
                        }}
                        className="w-4 h-4 cursor-pointer mt-1"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{activity.name}</h3>
                        {activity.description && (
                          <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                        )}
                        <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                          {activity.category && <span className="bg-red-100 text-red-800 px-2 py-1 rounded">Category: {activity.category}</span>}
                          {activity.duration && <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Tour Duration: {activity.duration}</span>}
                          {activity.price && <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Price per Person: ₹{activity.price}</span>}
                          {activity.difficulty && <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">Difficulty: {activity.difficulty}</span>}
                          {activity.bestTime && <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Best: {activity.bestTime}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`/activity/${activity.id}`, '_blank')}
                          title="Preview activity"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(activity)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(activity.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 pt-4 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredActivitiesAll.length)} of {filteredActivitiesAll.length} activities
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              {(() => {
                const pagesPerGroup = 12;
                const currentGroup = Math.floor((currentPage - 1) / pagesPerGroup);
                const startPage = currentGroup * pagesPerGroup + 1;
                const endPage = Math.min(startPage + pagesPerGroup - 1, totalPages);
                
                return Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i).map(page => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </Button>
                ));
              })()}
              {totalPages > 12 && (
                <span className="text-sm text-gray-500 px-2">of {totalPages}</span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
      </div>
    </AdminLayout>
  );
}
