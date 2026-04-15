import { useState, useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Plus, Trash2, Download, Upload, Search } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLanguage } from "@/contexts/LanguageContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdminLayout } from "@/components/AdminLayout";

export default function AdminTranslationManager() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newKey, setNewKey] = useState("");
  const [newValue, setNewValue] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isImportingCSV, setIsImportingCSV] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch translations
  const { data: translations, isLoading, refetch } = trpc.translations.getAll.useQuery({
    language: selectedLanguage,
    category: selectedCategory || undefined,
  });

  // Search translations
  const { data: searchResults } = trpc.translations.search.useQuery(
    {
      searchTerm,
      language: selectedLanguage,
      category: selectedCategory || undefined,
    },
    { enabled: searchTerm.length > 0 }
  );

  // Get stats
  const { data: stats } = trpc.translations.getStats.useQuery();

  // Mutations
  const createMutation = trpc.translations.create.useMutation({
    onSuccess: () => {
      toast({ title: "Translation created successfully" });
      setNewKey("");
      setNewValue("");
      setNewCategory("");
      setNewDescription("");
      setIsCreating(false);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = trpc.translations.update.useMutation({
    onSuccess: () => {
      toast({ title: "Translation updated successfully" });
      setEditingId(null);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = trpc.translations.delete.useMutation({
    onSuccess: () => {
      toast({ title: "Translation deleted successfully" });
      refetch();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const exportMutation = trpc.translations.exportJSON.useMutation({
    onSuccess: (data) => {
      const json = JSON.stringify(data, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translations-${selectedLanguage}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Translations exported successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const exportCSVMutation = trpc.translations.exportCSV.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `translations-${selectedLanguage}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast({ title: "Translations exported as CSV successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const importCSVMutation = trpc.translations.importCSV.useMutation({
    onSuccess: (data) => {
      toast({
        title: "CSV imported successfully",
        description: `Imported: ${data.imported}, Updated: ${data.updated}`,
      });
      setIsImportingCSV(false);
      refetch();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const displayedTranslations = searchTerm.length > 0 ? searchResults : translations;

  const handleCreate = () => {
    if (!newKey || !newValue || !newCategory) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    createMutation.mutate({
      key: newKey,
      language: selectedLanguage as "en" | "es" | "fr",
      value: newValue,
      category: newCategory,
      description: newDescription || undefined,
    });
  };

  const handleUpdate = (id: number, value: string) => {
    updateMutation.mutate({ id, value });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this translation?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleExport = () => {
    exportMutation.mutate({ language: selectedLanguage });
  };

  const handleExportCSV = () => {
    exportCSVMutation.mutate({ language: selectedLanguage });
  };

  const handleImportCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      importCSVMutation.mutate({
        csvContent: content,
        language: selectedLanguage as "en" | "es" | "fr",
      });
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const categories = useMemo(() => {
    if (!translations) return [];
    return [...new Set(translations.map((t: any) => t.category))];
  }, [translations]);

  return (
    <AdminLayout title="TranslationManager">
      <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Translation Manager</h1>
        <p className="text-gray-600 mt-2">Manage translations for your website across multiple languages</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Total Translations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Languages</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byLanguage?.length || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.byCategory?.length || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Language Select */}
            <div>
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Select */}
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((cat: string) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search translations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 items-end flex-wrap">
              <Button onClick={handleExport} variant="outline" size="sm" title="Export as JSON">
                <Download className="w-4 h-4 mr-2" />
                JSON
              </Button>
              <Button onClick={handleExportCSV} variant="outline" size="sm" title="Export as CSV">
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button onClick={triggerFileInput} variant="outline" size="sm" title="Import from CSV">
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleImportCSV}
                className="hidden"
              />
              <Dialog open={isCreating} onOpenChange={setIsCreating}>
                <DialogTrigger asChild>
                  <Button className="flex-1">
                    <Plus className="w-4 h-4 mr-2" />
                    New
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Translation</DialogTitle>
                    <DialogDescription>Add a new translation for {selectedLanguage}</DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">Key</label>
                      <Input
                        placeholder="e.g., nav.home"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Category</label>
                      <Input
                        placeholder="e.g., nav, footer, home"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Value</label>
                      <Textarea
                        placeholder="Translation text"
                        value={newValue}
                        onChange={(e) => setNewValue(e.target.value)}
                        rows={4}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Description (optional)</label>
                      <Textarea
                        placeholder="Help text for translators"
                        value={newDescription}
                        onChange={(e) => setNewDescription(e.target.value)}
                        rows={2}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreate}
                        disabled={createMutation.isPending}
                        className="flex-1"
                      >
                        {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Create
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsCreating(false)}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Translations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Translations</CardTitle>
          <CardDescription>
            {displayedTranslations?.length || 0} translations found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-red-600" />
            </div>
          ) : displayedTranslations && displayedTranslations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Key</th>
                    <th className="text-left py-3 px-4 font-medium">Category</th>
                    <th className="text-left py-3 px-4 font-medium">Value</th>
                    <th className="text-left py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTranslations.map((translation: any) => (
                    <tr key={translation.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-xs">{translation.key}</td>
                      <td className="py-3 px-4">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                          {translation.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate">{translation.value}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(translation.id)}
                            disabled={deleteMutation.isPending}
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
          ) : (
            <div className="text-center py-8 text-gray-500">
              No translations found. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </AdminLayout>
  );
}
