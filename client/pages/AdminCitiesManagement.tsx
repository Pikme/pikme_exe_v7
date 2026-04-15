import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Building2, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

const citySchema = z.object({
  stateId: z.coerce.number().min(1, "State is required"),
  name: z.string().min(1, "City name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  latitude: z.string().optional(),
  longitude: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type CityFormData = z.infer<typeof citySchema>;

export default function AdminCitiesManagement() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Please log in to access admin features</p>
      </div>
    );
  }

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedStateId, setSelectedStateId] = useState<number>(0);
  const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
  const [formData, setFormData] = useState<CityFormData>({
    stateId: 0,
    name: "",
    slug: "",
    description: "",
    latitude: "",
    longitude: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Load all countries
  const { data: countries, isLoading: countriesLoading } = trpc.countries.list.useQuery({ limit: 500 });

  // Load states for selected country
  const { data: states, isLoading: statesLoading } = trpc.states.listByCountry.useQuery(
    { countryId: selectedCountryId || 1, limit: 500 },
    { enabled: (selectedCountryId || 0) > 0 }
  );

  // Load cities for selected state
  const { data: cities, isLoading: citiesLoading, refetch } = trpc.locations.listByState.useQuery(
    { stateId: selectedStateId || 1, limit: 500 },
    { enabled: (selectedStateId || 0) > 0 }
  );

  const createMutation = trpc.locations.create.useMutation({
    onSuccess: () => {
      toast.success("City created successfully!");
      refetch();
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating city: ${error.message}`);
    },
  });

  const updateMutation = trpc.locations.update.useMutation({
    onSuccess: () => {
      toast.success("City updated successfully!");
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating city: ${error.message}`);
    },
  });

  const deleteMutation = trpc.locations.delete.useMutation({
    onSuccess: () => {
      toast.success("City deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error deleting city: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      stateId: selectedStateId || 0,
      name: "",
      slug: "",
      description: "",
      latitude: "",
      longitude: "",
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const handleEdit = (city: any) => {
    setFormData({
      stateId: city.stateId,
      name: city.name,
      slug: city.slug,
      description: city.description || "",
      latitude: city.latitude || "",
      longitude: city.longitude || "",
      metaTitle: city.metaTitle || "",
      metaDescription: city.metaDescription || "",
      metaKeywords: city.metaKeywords || "",
    });
    setEditingId(city.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = citySchema.parse(formData);

      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...validated,
        });
      } else {
        await createMutation.mutateAsync(validated);
      }
    } catch (error: any) {
      toast.error(error.message || "Validation error");
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this city?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const selectedCountry = countries?.find((c: any) => c.id === selectedCountryId);
  const selectedState = states?.find((s: any) => s.id === selectedStateId);

  return (
    <AdminLayout
      title="Cities Management"
      description="Manage cities and destinations"
      breadcrumbs={[
        { label: "Cities", href: "/admin/cities" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold">Cities Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} disabled={!selectedStateId} className="gap-2">
            <Plus className="w-4 h-4" />
            Add City
          </Button>
        </div>

      {/* Country Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Country</CardTitle>
          <CardDescription>Choose a country to view its states</CardDescription>
        </CardHeader>
        <CardContent>
          {countriesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Loading countries...
            </div>
          ) : (
            <select
              value={selectedCountryId}
              onChange={(e) => {
                setSelectedCountryId(Number(e.target.value));
                setSelectedStateId(0);
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={0}>-- Select a Country --</option>
              {countries?.map((country: any) => (
                <option key={country.id} value={country.id}>
                  {country.name} ({country.code})
                </option>
              ))}
            </select>
          )}
        </CardContent>
      </Card>

      {/* State Selector */}
      {selectedCountryId > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Select State</CardTitle>
            <CardDescription>Choose a state to manage its cities</CardDescription>
          </CardHeader>
          <CardContent>
            {statesLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading states...
              </div>
            ) : (
              <select
                value={selectedStateId}
                onChange={(e) => {
                  setSelectedStateId(Number(e.target.value));
                  setShowForm(false);
                  setEditingId(null);
                  resetForm();
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value={0}>-- Select a State --</option>
                {states?.map((state: any) => (
                  <option key={state.id} value={state.id}>
                    {state.name}
                  </option>
                ))}
              </select>
            )}
          </CardContent>
        </Card>
      )}

      {showForm && selectedStateId && (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle>{editingId ? "Edit City" : "Add New City"}</CardTitle>
            <CardDescription>
              {editingId ? "Update city details" : `Create a new city in ${selectedState?.name}, ${selectedCountry?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kochi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., kochi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="City description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    type="text"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 9.9312"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    type="text"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., 76.2673"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">SEO Metadata</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Title</label>
                    <input
                      type="text"
                      value={formData.metaTitle}
                      onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                      placeholder="Page title for search engines"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Brief description for search engines"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="Comma-separated keywords"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  )}
                  <Check className="w-4 h-4" />
                  {editingId ? "Update" : "Create"} City
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Cities List</CardTitle>
          <CardDescription>
            {selectedState ? `Cities in ${selectedState.name}, ${selectedCountry?.name}` : "Select a state to view its cities"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedStateId ? (
            <p className="text-gray-500 text-center py-8">Please select a state first</p>
          ) : citiesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !cities || cities.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No cities found. Create your first city!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Slug</th>
                    <th className="px-4 py-2 text-left font-semibold">Coordinates</th>
                    <th className="px-4 py-2 text-left font-semibold">Meta Title</th>
                    <th className="px-4 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cities.map((city: any) => (
                    <tr key={city.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{city.name}</td>
                      <td className="px-4 py-3 text-gray-600">{city.slug}</td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {city.latitude && city.longitude ? `${city.latitude}, ${city.longitude}` : "-"}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{city.metaTitle || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(city)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(city.id)}
                            disabled={deleteMutation.isPending}
                            className="gap-1"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
