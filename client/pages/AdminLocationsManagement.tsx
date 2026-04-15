import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Plus, Edit2, Trash2, X, Check, Download, Upload } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { z } from "zod";
import { toast } from "sonner";
import Papa from "papaparse";
import { AdminLayout } from "@/components/AdminLayout";
import { exportLocationsToCSV, generateFilename } from "@/lib/csvExport";
import { BulkImportDialog } from "@/components/BulkImportDialog";
import { BulkExportButton } from "@/components/BulkExportButton";
import { BulkActionToolbar } from "@/components/BulkActionToolbar";
import { BulkTagDialog } from "@/components/BulkTagDialog";
import { ConfirmBulkDeleteDialog } from "@/components/ConfirmBulkDeleteDialog";
import { BulkEditDialog } from "@/components/BulkEditDialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const locationSchema = z.object({
  stateId: z.coerce.number().min(1, "State/Region is required"),
  name: z.string().min(1, "Location name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
});

type LocationFormData = z.infer<typeof locationSchema>;

export default function AdminLocationsManagement() {
  const { user } = useAuth();
  
  // Redirect to admin if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please log in to access admin features</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
  const [selectedStateId, setSelectedStateId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());
  const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
  const [showBulkTagDialog, setShowBulkTagDialog] = useState(false);
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false);
  const [formData, setFormData] = useState<LocationFormData>({
    stateId: 0,
    name: "",
    slug: "",
    description: "",
    latitude: undefined,
    longitude: undefined,
  });

  // Load all countries
  const { data: countries, isLoading: countriesLoading } = trpc.countries.list.useQuery({ limit: 200 });
  
  // Load states for selected country
  const { data: states, isLoading: statesLoading, refetch: refetchStates } = trpc.states.listByCountry.useQuery(
    { countryId: selectedCountryId, limit: 500 },
    { enabled: selectedCountryId > 0 }
  );
  
  // Refetch states when country changes
  useEffect(() => {
    if (selectedCountryId > 0) {
      console.log('Country changed to:', selectedCountryId);
      refetchStates();
    }
  }, [selectedCountryId, refetchStates]);
  
  // Auto-select first country on load
  useEffect(() => {
    if (countries && countries.length > 0 && selectedCountryId === 0) {
      setSelectedCountryId(countries[0].id);
    }
  }, [countries, selectedCountryId]);
  
  // Auto-select first state when states load
  useEffect(() => {
    if (states && states.length > 0 && selectedStateId === 0) {
      setSelectedStateId(states[0].id);
      setFormData(prev => ({ ...prev, stateId: states[0].id }));
    }
  }, [states, selectedStateId]);

  // Load locations for selected state - SIMPLIFIED
  const { data: locations = [], isLoading: locationsLoading, refetch: refetchLocations } = trpc.locations.listByState.useQuery(
    { stateId: selectedStateId, limit: 1000 },
    { enabled: selectedStateId > 0 }
  );

  // Handle country selection
  const handleCountryChange = (countryId: string) => {
    const id = parseInt(countryId);
    setSelectedCountryId(id);
    setSelectedStateId(0);
    setFormData(prev => ({ ...prev, stateId: 0 }));
    setSearchTerm("");
    setPage(0);
  };

  // Handle state selection
  const handleStateChange = (stateId: string) => {
    const id = parseInt(stateId);
    setSelectedStateId(id);
    setFormData(prev => ({ ...prev, stateId: id }));
    setSearchTerm("");
    setPage(0);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validated = locationSchema.parse(formData);
      
      if (editingId) {
        await updateMutation.mutateAsync({ id: editingId, ...validated });
      } else {
        await createMutation.mutateAsync(validated);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      }
    }
  };

  // Handle edit
  const handleEdit = (location: any) => {
    setEditingId(location.id);
    setFormData({
      stateId: location.stateId,
      name: location.name,
      slug: location.slug,
      description: location.description || "",
      latitude: location.latitude?.toString() || "",
      longitude: location.longitude?.toString() || "",
    });
    setShowForm(true);
  };

  // Handle delete
  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this location?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  // Handle select location
  const handleSelectLocation = (id: number) => {
    const newSelected = new Set(selectedLocations);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedLocations(newSelected);
  };

  // Reset form
  const resetForm = () => {
    setEditingId(null);
    setFormData({
      stateId: selectedStateId || 0,
      name: "",
      slug: "",
      description: "",
      latitude: undefined,
      longitude: undefined,
    });
    setShowForm(false);
  };

  const utils = trpc.useUtils();
  
  const createMutation = trpc.locations.create.useMutation({
    onSuccess: async () => {
      toast.success("Location created successfully");
      resetForm();
      await utils.locations.invalidate();
      await refetchLocations();
    },
    onError: (error: any) => {
      toast.error(`Error creating location: ${error.message}`);
    },
  });

  const updateMutation = trpc.locations.update.useMutation({
    onSuccess: async () => {
      toast.success("Location updated successfully");
      resetForm();
      await utils.locations.invalidate();
      await refetchLocations();
    },
    onError: (error: any) => {
      toast.error(`Error updating location: ${error.message}`);
    },
  });

  const deleteMutation = trpc.locations.delete.useMutation({
    onSuccess: async () => {
      toast.success("Location deleted successfully");
      await utils.locations.invalidate();
      await refetchLocations();
    },
    onError: (error: any) => {
      toast.error(`Error deleting location: ${error.message}`);
    },
  });

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Locations Management</h1>
          <p className="text-gray-600">Manage destinations and attractions across countries and states</p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Country Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Select value={selectedCountryId.toString()} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((country: any) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* State Selector */}
              <div>
                <label className="block text-sm font-medium mb-2">State/Region</label>
                <Select value={selectedStateId.toString()} onValueChange={handleStateChange} disabled={!selectedCountryId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states?.map((state: any) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium mb-2">Search</label>
                <Input
                  placeholder="Search locations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add New Location
          </Button>
          <BulkExportButton locations={locations} />
          <Button variant="outline" onClick={() => setShowImportDialog(true)} className="gap-2">
            <Upload className="w-4 h-4" />
            Bulk Import
          </Button>
        </div>

        {/* Locations List */}
        <div className="space-y-4">
          {locationsLoading ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                  <p>Loading locations...</p>
                </div>
              </CardContent>
            </Card>
          ) : locations && locations.length > 0 ? (
            <>
              {(() => {
                const filteredLocations = locations.filter((location: any) =>
                  location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  location.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  (location.description && location.description.toLowerCase().includes(searchTerm.toLowerCase()))
                );
                return (
                  <>
                    <div className="text-sm text-gray-600 mb-4">
                      Showing {filteredLocations.length} of {locations.length} location{locations.length !== 1 ? 's' : ''}
                    </div>
                    {filteredLocations.length > 0 ? (
                      filteredLocations.map((location: any) => (
                <Card key={location.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start gap-4">
                      <Checkbox
                        checked={selectedLocations.has(location.id)}
                        onCheckedChange={() => handleSelectLocation(location.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-green-600" />
                          <h3 className="text-xl font-bold">{location.name}</h3>
                        </div>
                        {location.description && (
                          <p className="text-gray-600 mb-2">{location.description}</p>
                        )}
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <span>Slug: <strong>{location.slug}</strong></span>
                          {location.latitude && location.longitude && (
                            <span>Coordinates: <strong>{location.latitude}, {location.longitude}</strong></span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleEdit(location)}
                          variant="outline"
                          size="sm"
                          className="gap-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDelete(location.id)}
                          variant="destructive"
                          size="sm"
                          className="gap-2"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                    ))
                    ) : (
                      <Card>
                        <CardContent className="flex items-center justify-center py-12">
                          <div className="text-center">
                            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-gray-500">No locations match your search</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </>
                );
              })()}
            </>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">
                    {selectedStateId ? "No locations found for this state" : "Select a state to view locations"}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Add/Edit Location Dialog */}
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Location" : "Create New Location"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Country</label>
                <Select value={selectedCountryId.toString()} onValueChange={handleCountryChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {countries?.map((country: any) => (
                      <SelectItem key={country.id} value={country.id.toString()}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">State/Region</label>
                <Select value={formData.stateId.toString()} onValueChange={(val) => setFormData(prev => ({ ...prev, stateId: parseInt(val) }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {states?.map((state: any) => (
                      <SelectItem key={state.id} value={state.id.toString()}>
                        {state.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Location Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Taj Mahal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Slug</label>
                <Input
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="e.g., taj-mahal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <Input
                    value={formData.latitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, latitude: e.target.value }))}
                    placeholder="e.g., 27.1751"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <Input
                    value={formData.longitude}
                    onChange={(e) => setFormData(prev => ({ ...prev, longitude: e.target.value }))}
                    placeholder="e.g., 78.0421"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                  {createMutation.isPending || updateMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    editingId ? "Update" : "Create"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Import Dialog */}
        <BulkImportDialog
          open={showImportDialog}
          onOpenChange={setShowImportDialog}
          stateId={selectedStateId}
          onImportSuccess={async () => {
            await refetchLocations();
            toast.success("Locations imported successfully!");
          }}
        />
      </div>
    </AdminLayout>
  );
}
