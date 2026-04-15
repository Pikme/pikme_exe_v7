import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";

const countrySchema = z.object({
  name: z.string().min(1, "Country name is required"),
  slug: z.string().min(1, "Slug is required"),
  code: z.string().min(2, "Country code is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type CountryFormData = z.infer<typeof countrySchema>;

export default function AdminCountriesManagement() {
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
  const [formData, setFormData] = useState<CountryFormData>({
    name: "",
    slug: "",
    code: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Load all countries
  const { data: countries, isLoading: countriesLoading, refetch } = trpc.countries.list.useQuery({ limit: 500 });

  const createMutation = trpc.countries.create.useMutation({
    onSuccess: () => {
      toast.success("Country created successfully!");
      refetch();
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating country: ${error.message}`);
    },
  });

  const updateMutation = trpc.countries.update.useMutation({
    onSuccess: () => {
      toast.success("Country updated successfully!");
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating country: ${error.message}`);
    },
  });

  const deleteMutation = trpc.countries.delete.useMutation({
    onSuccess: () => {
      toast.success("Country deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error deleting country: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      code: "",
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

  const handleEdit = (country: any) => {
    setFormData({
      name: country.name,
      slug: country.slug,
      code: country.code,
      metaTitle: country.metaTitle || "",
      metaDescription: country.metaDescription || "",
      metaKeywords: country.metaKeywords || "",
    });
    setEditingId(country.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = countrySchema.parse(formData);

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
    if (window.confirm("Are you sure you want to delete this country?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  return (
    <AdminLayout title="Countries Management" description="Manage countries and their details">
      <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="w-4 h-4" />
          Add Country
        </Button>
      </div>

      {showForm && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Country" : "Add New Country"}</CardTitle>
            <CardDescription>
              {editingId ? "Update country details" : "Create a new country for the platform"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Country Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., India"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., india"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country Code *</label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., IN"
                    maxLength={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Brief description for search engines"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="Comma-separated keywords"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  {editingId ? "Update" : "Create"} Country
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
          <CardTitle>Countries List</CardTitle>
          <CardDescription>Manage all countries on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {countriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !countries || countries.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No countries found. Create your first country!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Code</th>
                    <th className="px-4 py-2 text-left font-semibold">Slug</th>
                    <th className="px-4 py-2 text-left font-semibold">Meta Title</th>
                    <th className="px-4 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {countries.map((country: any) => (
                    <tr key={country.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">{country.name}</td>
                      <td className="px-4 py-3">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
                          {country.code}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600">{country.slug}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{country.metaTitle || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(country)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(country.id)}
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
