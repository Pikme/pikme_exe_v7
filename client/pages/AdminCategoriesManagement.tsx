import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Tag, Plus, Edit2, Trash2, X, Check } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { AdminLayout } from "@/components/AdminLayout";
import { exportCategoriesToCSV, generateFilename } from "@/lib/csvExport";
import { Download } from "lucide-react";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
});

type CategoryFormData = z.infer<typeof categorySchema>;

export default function AdminCategoriesManagement() {
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
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    slug: "",
    description: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
  });

  // Load all categories
  const { data: categoriesFullText, isLoading: isLoadingFullText } = trpc.categories.searchFullText.useQuery(
    {
      search: searchTerm || undefined,
      limit: 500,
      offset: page * 500,
    },
    { enabled: searchTerm.length > 0 }
  );

  const { data: categories, isLoading: categoriesLoading, refetch } = trpc.categories.list.useQuery(
    { limit: 500 },
    { enabled: searchTerm.length === 0 }
  );

  const { data: categoryCount } = trpc.categories.searchFullTextCount.useQuery(
    {
      search: searchTerm || undefined,
    },
    { enabled: searchTerm.length > 0 }
  );

  const displayCategories = searchTerm.length > 0 ? categoriesFullText : categories;
  const isLoadingData = searchTerm.length > 0 ? isLoadingFullText : categoriesLoading;

  const createMutation = trpc.categories.create.useMutation({
    onSuccess: () => {
      toast.success("Category created successfully!");
      refetch();
      setShowForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error creating category: ${error.message}`);
    },
  });

  const updateMutation = trpc.categories.update.useMutation({
    onSuccess: () => {
      toast.success("Category updated successfully!");
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Error updating category: ${error.message}`);
    },
  });

  const deleteMutation = trpc.categories.delete.useMutation({
    onSuccess: () => {
      toast.success("Category deleted successfully!");
      refetch();
    },
    onError: (error: any) => {
      toast.error(`Error deleting category: ${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
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

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      metaTitle: category.metaTitle || "",
      metaDescription: category.metaDescription || "",
      metaKeywords: category.metaKeywords || "",
    });
    setEditingId(category.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = categorySchema.parse(formData);

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
    if (window.confirm("Are you sure you want to delete this category?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  // Predefined categories for quick reference
  const predefinedCategories = [
    { name: "Leisure", slug: "leisure", description: "Relaxing and enjoyable travel experiences" },
    { name: "Holiday", slug: "holiday", description: "Festive and celebration-focused tours" },
    { name: "Spiritual", slug: "spiritual", description: "Religious and spiritual pilgrimage tours" },
    { name: "Tours", slug: "tours", description: "General guided tour packages" },
    { name: "Adventure", slug: "adventure", description: "Thrilling and action-packed experiences" },
  ];

  const addPredefinedCategory = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description,
      metaTitle: `${category.name} Tours | Pikme`,
      metaDescription: category.description,
      metaKeywords: `${category.slug}, tours, travel`,
    });
  };

  return (
    <AdminLayout
      title="Categories Management"
      description="Manage tour categories"
      breadcrumbs={[
        { label: "Categories", href: "/admin/categories" },
      ]}
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Tag className="w-8 h-8 text-orange-600" />
            <h1 className="text-3xl font-bold">Categories Management</h1>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

      {showForm && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Category" : "Add New Category"}</CardTitle>
            <CardDescription>
              {editingId ? "Update category details" : "Create a new tour category"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Adventure"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Slug *</label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g., adventure"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Category description"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Description</label>
                    <textarea
                      value={formData.metaDescription}
                      onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                      placeholder="Brief description for search engines"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                    <input
                      type="text"
                      value={formData.metaKeywords}
                      onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                      placeholder="Comma-separated keywords"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                  {editingId ? "Update" : "Create"} Category
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

      {!editingId && !showForm && (
        <Card className="border-red-100 bg-red-50">
          <CardHeader>
            <CardTitle className="text-base">Quick Add Predefined Categories</CardTitle>
            <CardDescription>Quickly add standard tour categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
              {predefinedCategories.map((cat) => (
                <Button
                  key={cat.slug}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    addPredefinedCategory(cat);
                    setShowForm(true);
                  }}
                  className="text-xs"
                >
                  + {cat.name}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Search Categories</CardTitle>
          <CardDescription>Use full-text search for faster results</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Term</label>
              <input
                type="text"
                placeholder="Search by name, slug, description..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {searchTerm && categoryCount !== undefined && (
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">Found {categoryCount} matching categories</p>
                <Button
                  onClick={() => {
                    const categoriesToExport = displayCategories.map((category: any) => ({
                      id: category.id,
                      name: category.name,
                      slug: category.slug,
                      description: category.description || "",
                      icon: category.icon || "",
                      metaTitle: category.metaTitle || "",
                      metaDescription: category.metaDescription || "",
                    }));
                    exportCategoriesToCSV(categoriesToExport, generateFilename("categories-export"));
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
          <CardTitle>Categories List</CardTitle>
          <CardDescription>Manage all tour categories on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingData ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin" />
            </div>
          ) : !displayCategories || displayCategories.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No categories found. Create your first category!</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-4 py-2 text-left font-semibold">Name</th>
                    <th className="px-4 py-2 text-left font-semibold">Slug</th>
                    <th className="px-4 py-2 text-left font-semibold">Description</th>
                    <th className="px-4 py-2 text-left font-semibold">Meta Title</th>
                    <th className="px-4 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayCategories.map((category: any) => (
                    <tr key={category.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{category.name}</td>
                      <td className="px-4 py-3 text-gray-600">
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm font-medium">
                          {category.slug}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{category.description || "-"}</td>
                      <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{category.metaTitle || "-"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2 justify-center">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(category)}
                            className="gap-1"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(category.id)}
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
