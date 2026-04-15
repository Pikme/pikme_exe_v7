import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";
import { exportStatesToCSV, generateFilename } from "@/lib/csvExport";
import { Download } from "lucide-react";

const stateSchema = z.object({
  countryId: z.coerce.number().min(1, "Country is required"),
  name: z.string().min(1, "State name is required"),
  slug: z.string().min(1, "Slug is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type StateFormData = z.infer<typeof stateSchema>;

export default function AdminStatesManagement() {
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
  const [selectedCountryId, setSelectedCountryId] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState<StateFormData>({
    countryId: 0,
    name: "",
    slug: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Load all countries
  const { data: countries, isLoading: countriesLoading } = trpc.countries.list.useQuery({ limit: 500 });

  // Load states for selected country
  const { data: statesFullText, isLoading: isLoadingFullText } = trpc.states.searchFullText.useQuery(
    {
      search: searchTerm || undefined,
      countryId: selectedCountryId || undefined,
      limit: 500,
      offset: page * 500,
    },
    { enabled: (selectedCountryId || 0) > 0 && searchTerm.length > 0 }
  );

  const { data: states, isLoading: statesLoading, refetch } = trpc.states.listByCountry.useQuery(
    { countryId: selectedCountryId || 1, limit: 500 },
    { enabled: (selectedCountryId || 0) > 0 && searchTerm.length === 0 }
  );

  const { data: stateCount } = trpc.states.searchFullTextCount.useQuery(
    {
      search: searchTerm || undefined,
      countryId: selectedCountryId || undefined,
    },
    { enabled: (selectedCountryId || 0) > 0 && searchTerm.length > 0 }
  );

  const displayStates = searchTerm.length > 0 ? statesFullText : states;
  const isLoadingData = searchTerm.length > 0 ? isLoadingFullText : statesLoading;

  const createMutation = trpc.states.create.useMutation({
    onSuccess: () => {
      toast.success("State created successfully!");
      refetch();
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating state: ${error.message}`);
    },
  });

  const updateMutation = trpc.states.update.useMutation({
    onSuccess: () => {
      toast.success("State updated successfully!");
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating state: ${error.message}`);
    },
  });

  const deleteMutation = trpc.states.delete.useMutation({
    onSuccess: () => {
      toast.success("State deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error deleting state: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      countryId: selectedCountryId || 0,
      name: "",
      slug: "",
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

  const handleShowForm = () => {
    setFormData(prev => ({ ...prev, countryId: selectedCountryId }));
    setShowForm(true);
  };

  const handleEdit = (state: any) => {
    setFormData({
      countryId: state.countryId,
      name: state.name,
      slug: state.slug,
      metaTitle: state.metaTitle || "",
      metaDescription: state.metaDescription || "",
      metaKeywords: state.metaKeywords || "",
    });
    setEditingId(state.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = stateSchema.parse(formData);

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
    if (window.confirm("Are you sure you want to delete this state?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const selectedCountry = countries?.find((c: any) => c.id === selectedCountryId);

  return (
    <AdminLayout
      title="States Management"
      description="Manage states and provinces"
      breadcrumbs={[
        { label: "States", href: "/admin/states" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-8 h-8 text-green-600" />
            <h1 className="text-3xl font-bold">States Management</h1>
          </div>
          <Button onClick={() => !showForm ? handleShowForm() : setShowForm(false)} disabled={!selectedCountryId} className="gap-2">
            <Plus className="w-4 h-4" />
            Add State
          </Button>
        </div>

      {/* Country Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Country</CardTitle>
          <CardDescription>Choose a country to manage its states</CardDescription>
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
                setShowForm(false);
                setEditingId(null);
                resetForm();
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

      {showForm && selectedCountryId && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle>{editingId ? "Edit State" : "Add New State"}</CardTitle>
            <CardDescription>
              {editingId ? "Update state details" : `Create a new state in ${selectedCountry?.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">State Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Kerala"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., kerala"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Brief description for search engines"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="Comma-separated keywords"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                  {editingId ? "Update" : "Create"} State
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

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search States</CardTitle>
          <CardDescription>Use full-text search for faster results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Term</label>
              <input
                type="text"
                placeholder="Search by name, slug..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {searchTerm && stateCount !== undefined && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Found {stateCount} matching states</p>
                <Button
                  onClick={() => {
                    const statesToExport = displayStates.map((state: any) => ({
                      id: state.id,
                      name: state.name,
                      slug: state.slug,
                      country: selectedCountry?.name || "",
                      description: state.description || "",
                      metaTitle: state.metaTitle || "",
                      metaDescription: state.metaDescription || "",
                    }));
                    exportStatesToCSV(statesToExport, generateFilename("states-export"));
                  }}
                  size="sm"
                  variant="outline"
                  className="gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export CSV
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>States List</CardTitle>
          <CardDescription>
            {selectedCountry ? `States in ${selectedCountry.name}` : "Select a country to view its states"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!selectedCountryId ? (
            <p className="text-gray-500 text-center py-8">Please select a country first</p>
          ) : isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !displayStates || displayStates.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No states found. Create your first state!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Slug</th>
                    <th className="px-4 py-2 text-left font-semibold">Meta Title</th>
                    <th className="px-4 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayStates.map((state: any) => (
                    <tr key={state.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{state.name}</td>
                      <td className="px-4 py-3 text-gray-600">{state.slug}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{state.metaTitle || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(state)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(state.id)}
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
