"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Plane, Plus, Edit2, Trash2, X, Check, ChevronDown, ExternalLink, Bold, Italic, Underline, Heading2, Heading3, List, ListOrdered, Link as LinkIcon } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { z } from "zod";
import { AdminLayout } from "@/components/AdminLayout";
import { exportToursToCSV, generateFilename } from "@/lib/csvExport";
import { useState as useStateHook } from "react";

const tourSchema = z.object({
  name: z.string().min(1, "Tour name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  shortDescription: z.string().optional(),
  longDescription: z.string().optional(),
  image: z.string().optional(),
  category: z.string().optional(),
  countryId: z.number().optional(),
  stateId: z.number().optional(),
  categoryId: z.number().optional(),
  duration: z.coerce.number().optional(),
  price: z.coerce.number().optional(),
  difficulty: z.enum(["easy", "moderate", "challenging"]).optional(),
  groupSize: z.string().optional(),
  travelType: z.string().optional(),
  bestTime: z.string().optional(),
  morningTime: z.string().optional(),
  afternoonTime: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),

  amenities: z.any().optional(),
  transport: z.any().optional(),
  pricingTiers: z.any().optional(),
  cancellationPolicy: z.string().optional(),
  paymentPolicy: z.string().optional(),
  importantNotes: z.string().optional(),
  faqs: z.any().optional(),
  highlights: z.array(z.string()).optional(),
  itinerary: z.any().optional(),
  inclusions: z.array(z.string()).optional(),
  exclusions: z.array(z.string()).optional(),
  headingH1: z.string().optional(),
  headingH2: z.string().optional(),
  headingH3: z.string().optional(),
  hotelsPuri: z.any().optional(),
  hotelsBhuvaneshwar: z.any().optional(),
  transportOptions: z.any().optional(),
});

type TourFormData = z.infer<typeof tourSchema>;

export default function AdminToursManagement() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [useFullText, setUseFullText] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [tempInclusion, setTempInclusion] = useState("");
  const [tempExclusion, setTempExclusion] = useState("");
  const [tempRelatedTour, setTempRelatedTour] = useState("");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basic: true,
    timing: false,
    amenities: false,
    transport: false,
    pricing: false,
    policies: false,
    faqs: false,
    headings: false,
    metaTags: false,
    itinerary: false,
    inclusions: false,
    transportation: false,
    bestTime: false,
    hotelsPuri: false,
    hotelsBhuvaneshwar: false,
    transportOptions: false,
  });
  const [selectedTours, setSelectedTours] = useState<Set<number>>(new Set());

  const [formData, setFormData] = useState<any>({
    name: "",
    slug: "",
    shortDescription: "",
    longDescription: "",
    image: "",
    duration: 0,
    price: 0,
    groupSize: "",
    travelType: "",
    countryId: 0,
    stateId: 0,
    categoryId: 0,
    category: "",
    difficulty: "Easy",
    bestTimeToVisit: "",
    morningTime: "",
    afternoonTime: "",
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",

    amenities: [],
    amenityText: "",
    transport: [],
    transportText: "",
    pricingTiers: [],
    cancellationPolicy: "",
    paymentPolicy: "",
    importantNotes: "",
    faqs: [],
    highlights: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
    headingH1: "",
    headingH2: "",
    headingH3: "",
    hotelsPuri: [],
    hotelsBhuvaneshwar: [],
    transportOptions: [],
  });

  // Use full-text search if available, otherwise fall back to list
  const { data: toursFullText, isLoading: isLoadingFullText } = trpc.tours.searchFullText.useQuery(
    {
      search: searchTerm || undefined,
      difficulty: difficultyFilter || undefined,
      limit: 1000,
      offset: 0,
    },
    { enabled: useFullText && searchTerm.length > 0 }
  );

  const { data: tours, isLoading, refetch } = trpc.tours.list.useQuery(
    { limit: 1000 },
    { enabled: !useFullText || searchTerm.length === 0 }
  );

  const { data: tourCount } = trpc.tours.searchFullTextCount.useQuery(
    {
      search: searchTerm || undefined,
      difficulty: difficultyFilter || undefined,
    },
    { enabled: useFullText && searchTerm.length > 0 }
  );

  // Use full-text results if available, otherwise use list results
  const allTours = useFullText && searchTerm.length > 0 ? toursFullText : tours;
  const isLoadingData = useFullText && searchTerm.length > 0 ? isLoadingFullText : isLoading;
  
  // Pagination logic
  const totalPages = Math.ceil((allTours?.length || 0) / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const displayTours = allTours?.slice(startIndex, startIndex + itemsPerPage) || [];
  const { data: countries } = trpc.countries.list.useQuery({ limit: 500 });
  const { data: states } = trpc.states.list.useQuery(
    { countryId: formData.countryId || 1, limit: 500 },
    { enabled: (formData.countryId || 0) > 0 }
  );
  const { data: categories } = trpc.categories.list.useQuery({ limit: 500 });

  const createMutation = trpc.tours.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      resetForm();
    },
  });

  const updateMutation = trpc.tours.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
    },
  });

  const deleteMutation = trpc.tours.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      longDescription: "",
      image: "",
      countryId: 0,
      stateId: 0,
      categoryId: 0,
      category: "",
      duration: undefined,
      price: undefined,
      difficulty: "moderate",
      groupSize: "",
      travelType: "",
      bestTime: "",
      morningTime: "",
      afternoonTime: "",
      amenities: [],
      amenityText: "",
      transport: [],
      transportText: "",
      pricingTiers: [],
      cancellationPolicy: "",
      paymentPolicy: "",
      importantNotes: "",
      faqs: [],
      highlights: [],
      itinerary: [],
      inclusions: [],
      exclusions: [],
      headingH1: "",
      headingH2: "",
      headingH3: "",
      hotelsPuri: [],
      hotelsBhuvaneshwar: [],
      transportOptions: [],
    });
    setExpandedSections({
      basic: true,
      timing: false,
  
      pricing: false,
      policies: false,
      faqs: false,
      headings: false,
      metaTags: false,
      itinerary: false,
      inclusions: false,
      transportation: false,
      bestTime: false,
      hotelsPuri: false,
      hotelsBhuvaneshwar: false,
      transportOptions: false,
    });
  };

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

  const handleEdit = (tour: any) => {
    setEditingId(tour.id);
    setFormData({
      name: tour.name || "",
      slug: tour.slug || "",
      description: tour.description || "",
      longDescription: tour.longDescription || "",
      image: tour.image || "",
      countryId: tour.countryId || 0,
      stateId: tour.stateId || 0,
      categoryId: tour.categoryId || 0,
      category: tour.category || "",
      duration: tour.duration,
      price: tour.price,
      difficulty: tour.difficulty || "moderate",
      groupSize: tour.groupSize || "",
      travelType: tour.travelType || "",
      bestTime: tour.bestTime || "",
      morningTime: tour.morningTime || "",
      afternoonTime: tour.afternoonTime || "",
      metaTitle: tour.metaTitle || "",
      metaDescription: tour.metaDescription || "",
      metaKeywords: tour.metaKeywords || "",
      amenities: tour.amenities || [],
      amenityText: "",
      transport: tour.transport || [],
      transportText: "",
      pricingTiers: tour.pricingTiers || [],
      cancellationPolicy: tour.cancellationPolicy || "",
      paymentPolicy: tour.paymentPolicy || "",
      importantNotes: tour.importantNotes || "",
      faqs: tour.faqs || [],
      highlights: tour.highlights || [],
      itinerary: tour.itinerary || [],
      inclusions: tour.inclusions || [],
      exclusions: tour.exclusions || [],
      headingH1: tour.headingH1 || "",
      headingH2: tour.headingH2 || "",
      headingH3: tour.headingH3 || "",
      hotelsPuri: tour.hotelsPuri || [],
      hotelsBhuvaneshwar: tour.hotelsBhuvaneshwar || [],
      transportOptions: tour.transportOptions || [],
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const validated = tourSchema.parse(formData);
      const dataToSend = {
        ...validated,
        countryId: formData.countryId > 0 ? formData.countryId : undefined,
        stateId: formData.stateId > 0 ? formData.stateId : undefined,
        categoryId: formData.categoryId > 0 ? formData.categoryId : undefined,
      };
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          data: dataToSend,
        });
      } else {
        await createMutation.mutateAsync(dataToSend);
      }
    } catch (error) {
      console.error("Validation error:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this tour?")) {
      await deleteMutation.mutateAsync({ id });
    }
  };

  const handleSelectTour = (id: number) => {
    const newSelected = new Set(selectedTours);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedTours(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedTours.size === displayTours.length) {
      setSelectedTours(new Set());
    } else {
      const allIds = new Set(displayTours.map((tour: any) => tour.id));
      setSelectedTours(allIds);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedTours.size === 0) {
      alert("Please select tours to delete");
      return;
    }
    if (confirm(`Are you sure you want to delete ${selectedTours.size} tour(s)? This action cannot be undone.`)) {
      try {
        for (const id of selectedTours) {
          await deleteMutation.mutateAsync({ id });
        }
        setSelectedTours(new Set());
      } catch (error) {
        console.error("Error deleting tours:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    resetForm();
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const addArrayItem = (field: string, item: string) => {
    if (item.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...((prev as any)[field] || []), item],
      }));
    }
  };

  const removeArrayItem = (field: string, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: ((prev as any)[field] || []).filter((_: any, i: number) => i !== index),
    }));
  };

  const insertFormatting = (prefix: string, suffix: string, placeholder: string) => {
    const textarea = document.querySelector('textarea[placeholder*="Detailed tour description"]') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData.longDescription || "";
    const selectedText = text.substring(start, end) || placeholder;
    const before = text.substring(0, start);
    const after = text.substring(end);
    const newText = before + prefix + selectedText + suffix + after;

    setFormData({ ...formData, longDescription: newText });

    setTimeout(() => {
      textarea.selectionStart = start + prefix.length;
      textarea.selectionEnd = start + prefix.length + selectedText.length;
      textarea.focus();
    }, 0);
  };

  return (
    <AdminLayout
      title="Tours Management"
      description="Create, edit, and manage comprehensive tour packages"
      breadcrumbs={[
        { label: "Tours", href: "/admin/tours" },
      ]}
    >
      <div className="space-y-6">
        {/* Add/Edit Tour Form - At Top */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <Button
              onClick={() => {
                if (editingId) {
                  setEditingId(null);
                  resetForm();
                }
                setShowForm(!showForm);
              }}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {editingId ? "Cancel Edit" : "Add New Tour"}
            </Button>
          </div>
        </div>

        {/* Bulk Actions Toolbar */}
        {allTours && allTours.length > 0 && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="select-all"
                      checked={selectedTours.size > 0 && selectedTours.size === displayTours.length}
                      onChange={handleSelectAll}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <label htmlFor="select-all" className="cursor-pointer font-medium text-gray-700">
                      Select All ({displayTours.length} on this page)
                    </label>
                  </div>
                  {selectedTours.size > 0 && (
                    <span className="text-sm font-semibold text-red-700 bg-red-100 px-3 py-1 rounded-full">
                      {selectedTours.size} selected
                    </span>
                  )}
                </div>
                {selectedTours.size > 0 && (
                  <Button
                    variant="destructive"
                    onClick={handleDeleteSelected}
                    disabled={deleteMutation.isPending}
                    className="gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Selected ({selectedTours.size})
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Tour Form */}
        {showForm && (
          <Card className="mb-8 border-2 border-red-200">
            <CardHeader>
              <CardTitle>{editingId ? "Edit Tour" : "Create New Tour"}</CardTitle>
              <CardDescription>
                {editingId ? "Update tour details below" : "Fill in the details to create a new tour"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Basic Information Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("basic")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-red-50 hover:bg-red-100 transition"
                  >
                    <span className="font-semibold text-red-900">Basic Information</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.basic ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.basic && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Tour Name *</label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., VIP Darshan to Jagannath Puri"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Slug *</label>
                          <input
                            type="text"
                            required
                            value={formData.slug}
                            onChange={(e) =>
                              setFormData({ ...formData, slug: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., vip-darshan-jagannath"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Short Description</label>
                        <textarea
                          value={formData.description}
                          onChange={(e) =>
                            setFormData({ ...formData, description: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Brief tour description..."
                          rows={2}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-2">Long Description</label>
                        <div className="border rounded-lg overflow-hidden">
                          {/* Formatting Toolbar */}
                          <div className="bg-gray-50 border-b p-2 flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => insertFormatting('**', '**', 'Bold text')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Bold"
                            >
                              <Bold className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('*', '*', 'Italic text')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Italic"
                            >
                              <Italic className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('__', '__', 'Underlined text')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Underline"
                            >
                              <Underline className="w-4 h-4" />
                            </button>
                            <div className="w-px bg-gray-300"></div>
                            <button
                              type="button"
                              onClick={() => insertFormatting('## ', '\n', 'Heading 2')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Heading 2"
                            >
                              <Heading2 className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('### ', '\n', 'Heading 3')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Heading 3"
                            >
                              <Heading3 className="w-4 h-4" />
                            </button>
                            <div className="w-px bg-gray-300"></div>
                            <button
                              type="button"
                              onClick={() => insertFormatting('- ', '\n', 'Bullet point')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Bullet List"
                            >
                              <List className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('1. ', '\n', 'Numbered item')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Numbered List"
                            >
                              <ListOrdered className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => insertFormatting('[', '](https://example.com)', 'Link text')}
                              className="p-2 hover:bg-gray-200 rounded transition" title="Insert Link"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          </div>
                          {/* Text Editor */}
                          <textarea
                            value={formData.longDescription}
                            onChange={(e) =>
                              setFormData({ ...formData, longDescription: e.target.value })
                            }
                            className="w-full px-3 py-2 border-0 focus:outline-none focus:ring-2 focus:ring-red-600 font-mono text-sm"
                            placeholder="Detailed tour description...\n\nUse Markdown formatting:\n## Heading 2\n### Heading 3\n**Bold**\n*Italic*\n- Bullet point\n1. Numbered item\n[Link text](url)"
                            rows={8}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Supports Markdown formatting. Use the toolbar above or type Markdown directly.</p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Hero Image URL</label>
                        <input
                          type="url"
                          value={formData.image || ""}
                          onChange={(e) =>
                            setFormData({ ...formData, image: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="e.g., https://example.com/tour-image.jpg"
                        />
                        {formData.image && (
                          <div className="mt-2">
                            <img
                              src={formData.image}
                              alt="Preview"
                              className="w-full h-40 object-cover rounded-lg"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                              }}
                            />
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Duration (days)</label>
                          <input
                            type="number"
                            value={formData.duration || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                duration: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., 5"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Price (₹)</label>
                          <input
                            type="number"
                            value={formData.price || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                price: e.target.value ? Number(e.target.value) : undefined,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., 25000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Travel Type</label>
                          <input
                            type="text"
                            value={formData.travelType}
                            onChange={(e) =>
                              setFormData({ ...formData, travelType: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., Private Tour, Group Tour"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Country</label>
                          <select
                            value={formData.countryId || 0}
                            onChange={(e) => {
                              const countryId = Number(e.target.value);
                              setFormData({ ...formData, countryId, stateId: 0 });
                            }}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          >
                            <option value={0}>-- Select Country --</option>
                            {countries?.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">State/Province</label>
                          <select
                            value={formData.stateId || 0}
                            onChange={(e) =>
                              setFormData({ ...formData, stateId: Number(e.target.value) })
                            }
                            disabled={!formData.countryId}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 disabled:bg-gray-100"
                          >
                            <option value={0}>-- Select State --</option>
                            {states?.map((s: any) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Category</label>
                          <select
                            value={formData.categoryId || 0}
                            onChange={(e) =>
                              setFormData({ ...formData, categoryId: Number(e.target.value) })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          >
                            <option value={0}>-- Select Category --</option>
                            {categories?.map((c: any) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Difficulty Level</label>
                          <select
                            value={formData.difficulty}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                difficulty: e.target.value as any,
                              })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          >
                            <option value="easy">Easy</option>
                            <option value="moderate">Moderate</option>
                            <option value="challenging">Challenging</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Best Time to Visit</label>
                          <input
                            type="text"
                            value={formData.bestTime}
                            onChange={(e) =>
                              setFormData({ ...formData, bestTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., October to March"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timing & Availability Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("timing")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition"
                  >
                    <span className="font-semibold text-green-900">Timing & Availability</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.timing ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.timing && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Open Time</label>
                          <input
                            type="text"
                            value={formData.morningTime}
                            onChange={(e) =>
                              setFormData({ ...formData, morningTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., 5:00 AM"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Close Time</label>
                          <input
                            type="text"
                            value={formData.afternoonTime}
                            onChange={(e) =>
                              setFormData({ ...formData, afternoonTime: e.target.value })
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                            placeholder="e.g., 8:00 PM"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Amenities & Services Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("amenities")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-red-50 hover:bg-red-100 transition"
                  >
                    <span className="font-semibold text-red-900">Amenities & Services</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.amenities ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.amenities && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="space-y-2 mb-3">
                        {(formData.amenities || []).map((item: string, idx: number) => (
                          <div key={idx} className="flex items-center justify-between bg-red-50 p-3 rounded-lg border">
                            <span className="text-gray-700">{item}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const newAmenities = formData.amenities.filter((_: string, i: number) => i !== idx);
                                setFormData({
                                  ...formData,
                                  amenities: newAmenities,
                                });
                              }}
                              className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add amenity (e.g., Medical Assistance)"
                          value={formData.amenityText || ""}
                          onChange={(e) => setFormData({ ...formData, amenityText: e.target.value })}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.amenityText?.trim()) {
                              setFormData({
                                ...formData,
                                amenities: [...(formData.amenities || []), formData.amenityText.trim()],
                                amenityText: "",
                              });
                            }
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                        >
                          Add Amenity
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Transport Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("transport")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition"
                  >
                    <span className="font-semibold text-green-900">Transport</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.transport ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.transport && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="space-y-2 mb-3">
                        {Array.isArray(formData.transport) && formData.transport.length > 0 ? (
                          formData.transport.map((item: any, idx: number) => {
                            const displayText = typeof item === 'string' ? item : (item?.description || JSON.stringify(item));
                            return (
                              <div key={idx} className="flex items-center justify-between bg-green-50 p-3 rounded-lg border">
                                <span className="text-gray-700">{displayText}</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTransport = formData.transport.filter((_: any, i: number) => i !== idx);
                                    setFormData({
                                      ...formData,
                                      transport: newTransport,
                                    });
                                  }}
                                  className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium"
                                >
                                  Remove
                                </button>
                              </div>
                            );
                          })
                        ) : (
                          <p className="text-gray-500 text-sm italic">No transport options added yet</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Add transport (e.g., Private AC vehicle with experienced driver)"
                          value={formData.transportText || ""}
                          onChange={(e) => setFormData({ ...formData, transportText: e.target.value })}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              if (formData.transportText?.trim()) {
                                setFormData({
                                  ...formData,
                                  transport: [...(Array.isArray(formData.transport) ? formData.transport : []), formData.transportText.trim()],
                                  transportText: "",
                                });
                              }
                            }
                          }}
                          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.transportText?.trim()) {
                              setFormData({
                                ...formData,
                                transport: [...(Array.isArray(formData.transport) ? formData.transport : []), formData.transportText.trim()],
                                transportText: "",
                              });
                            }
                          }}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium text-sm"
                        >
                          Add Transport
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pricing Tiers Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("pricing")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-yellow-50 hover:bg-yellow-100 transition"
                  >
                    <span className="font-semibold text-yellow-900">Pricing Tiers</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.pricing ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.pricing && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="space-y-3">
                        {(formData.pricingTiers || []).map((tier: any, idx: number) => (
                          <div key={idx} className="flex gap-2 items-end bg-yellow-50 p-3 rounded-lg">
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-600">Group Size</label>
                              <input
                                type="text"
                                value={tier.groupSize || ""}
                                onChange={(e) => {
                                  const updated = [...formData.pricingTiers];
                                  updated[idx] = { ...tier, groupSize: e.target.value };
                                  setFormData({ ...formData, pricingTiers: updated });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="e.g., 2-3 persons"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-600">Price</label>
                              <input
                                type="number"
                                value={tier.price || ""}
                                onChange={(e) => {
                                  const updated = [...formData.pricingTiers];
                                  updated[idx] = { ...tier, price: parseFloat(e.target.value) || 0 };
                                  setFormData({ ...formData, pricingTiers: updated });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="25000"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs font-semibold text-gray-600">Currency</label>
                              <input
                                type="text"
                                value={tier.currency || "INR"}
                                onChange={(e) => {
                                  const updated = [...formData.pricingTiers];
                                  updated[idx] = { ...tier, currency: e.target.value };
                                  setFormData({ ...formData, pricingTiers: updated });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="INR"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.pricingTiers.filter((_: any, i: number) => i !== idx);
                                setFormData({ ...formData, pricingTiers: updated });
                              }}
                              className="p-2 bg-red-500 text-white rounded hover:bg-red-600"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            pricingTiers: [...(formData.pricingTiers || []), { groupSize: "", price: 0, currency: "INR" }],
                          });
                        }}
                        className="w-full px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Pricing Tier
                      </button>
                    </div>
                  )}
                </div>

                {/* Policies Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("policies")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-red-50 hover:bg-red-100 transition"
                  >
                    <span className="font-semibold text-red-900">Policies & Terms</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.policies ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.policies && (
                    <div className="p-4 space-y-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-1">Cancellation Policy</label>
                        <textarea
                          value={formData.cancellationPolicy}
                          onChange={(e) =>
                            setFormData({ ...formData, cancellationPolicy: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Enter cancellation policy..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Payment Policy</label>
                        <textarea
                          value={formData.paymentPolicy}
                          onChange={(e) =>
                            setFormData({ ...formData, paymentPolicy: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Enter payment policy..."
                          rows={3}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Important Notes</label>
                        <textarea
                          value={formData.importantNotes}
                          onChange={(e) =>
                            setFormData({ ...formData, importantNotes: e.target.value })
                          }
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Enter important notes..."
                          rows={3}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* FAQs Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("faqs")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-indigo-50 hover:bg-indigo-100 transition"
                  >
                    <span className="font-semibold text-indigo-900">FAQs</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${
                        expandedSections.faqs ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedSections.faqs && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="space-y-3">
                        {(formData.faqs || []).map((faq: any, idx: number) => (
                          <div key={idx} className="bg-indigo-50 p-4 rounded-lg space-y-2">
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Question</label>
                              <input
                                type="text"
                                value={faq.question || ""}
                                onChange={(e) => {
                                  const updated = [...formData.faqs];
                                  updated[idx] = { ...faq, question: e.target.value };
                                  setFormData({ ...formData, faqs: updated });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="e.g., Is this tour suitable for families?"
                              />
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Answer</label>
                              <textarea
                                value={faq.answer || ""}
                                onChange={(e) => {
                                  const updated = [...formData.faqs];
                                  updated[idx] = { ...faq, answer: e.target.value };
                                  setFormData({ ...formData, faqs: updated });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="e.g., Yes, it is family-friendly..."
                                rows={2}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.faqs.filter((_: any, i: number) => i !== idx);
                                setFormData({ ...formData, faqs: updated });
                              }}
                              className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove FAQ
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            faqs: [...(formData.faqs || []), { question: "", answer: "" }],
                          });
                        }}
                        className="w-full px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add FAQ
                      </button>
                    </div>
                  )}
                </div>

                {/* H1/H2/H3 Heading Hierarchy Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("headings")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition"
                  >
                    <span className="font-semibold text-gray-900">H1 / H2 / H3 Heading Hierarchy</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedSections.headings ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.headings && (
                    <div className="p-4 space-y-4 border-t">
                      <p className="text-sm text-gray-600 mb-4">Configure heading structure for SEO - These headings will appear on the tour detail page</p>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">H1 Heading (Main Title)</label>
                        <input
                          type="text"
                          value={formData.headingH1 || ""}
                          onChange={(e) => setFormData({ ...formData, headingH1: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="e.g., Jagannatha Puri Spiritual Darshan Tour Package"
                        />
                        <p className="text-xs text-gray-500 mt-1">Main heading for the tour page</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">H2 Heading (Section Title)</label>
                        <input
                          type="text"
                          value={formData.headingH2 || ""}
                          onChange={(e) => setFormData({ ...formData, headingH2: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="e.g., Explore the Sacred Temples of Jagannatha Puri"
                        />
                        <p className="text-xs text-gray-500 mt-1">Secondary heading for tour description</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">H3 Heading (Subsection Title)</label>
                        <input
                          type="text"
                          value={formData.headingH3 || ""}
                          onChange={(e) => setFormData({ ...formData, headingH3: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="e.g., What's Included in Your Journey"
                        />
                        <p className="text-xs text-gray-500 mt-1">Tertiary heading for subsections</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Meta Tags Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("metaTags")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-green-50 hover:bg-green-100 transition"
                  >
                    <span className="font-semibold text-green-900">Meta Title, Keywords, Description</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedSections.metaTags ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.metaTags && (
                    <div className="p-4 space-y-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-1">Meta Title</label>
                        <input
                          type="text"
                          value={formData.metaTitle || ""}
                          onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Page title for search engines (50-60 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Meta Keywords</label>
                        <input
                          type="text"
                          value={formData.metaKeywords || ""}
                          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Comma-separated keywords (e.g., Kerala tour, backwater cruise, adventure)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Meta Description</label>
                        <textarea
                          value={formData.metaDescription || ""}
                          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="Brief description for search results (150-160 characters)"
                          rows={2}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tour Itinerary Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("itinerary")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-purple-50 hover:bg-purple-100 transition"
                  >
                    <span className="font-semibold text-purple-900">Tour Itinerary</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedSections.itinerary ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.itinerary && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="space-y-3">
                        {(formData.itinerary || []).map((day: any, idx: number) => (
                          <div key={idx} className="bg-purple-50 p-4 rounded-lg space-y-2">
                            <div className="flex gap-2">
                              <div className="flex-1">
                                <label className="text-xs font-semibold text-gray-600">Day</label>
                                <input
                                  type="number"
                                  value={day.day || idx + 1}
                                  onChange={(e) => {
                                    const updated = [...formData.itinerary];
                                    updated[idx] = { ...day, day: parseInt(e.target.value) || idx + 1 };
                                    setFormData({ ...formData, itinerary: updated });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="1"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs font-semibold text-gray-600">Title</label>
                                <input
                                  type="text"
                                  value={day.title || ""}
                                  onChange={(e) => {
                                    const updated = [...formData.itinerary];
                                    updated[idx] = { ...day, title: e.target.value };
                                    setFormData({ ...formData, itinerary: updated });
                                  }}
                                  className="w-full px-2 py-1 border rounded text-sm"
                                  placeholder="e.g., Arrival"
                                />
                              </div>
                            </div>
                            <div>
                              <label className="text-xs font-semibold text-gray-600">Description</label>
                              <textarea
                                value={day.description || ""}
                                onChange={(e) => {
                                  const updated = [...formData.itinerary];
                                  updated[idx] = { ...day, description: e.target.value };
                                  setFormData({ ...formData, itinerary: updated });
                                }}
                                className="w-full px-2 py-1 border rounded text-sm"
                                placeholder="e.g., Arrive at destination..."
                                rows={2}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = formData.itinerary.filter((_: any, i: number) => i !== idx);
                                setFormData({ ...formData, itinerary: updated });
                              }}
                              className="w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove Day
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            itinerary: [...(formData.itinerary || []), { day: (formData.itinerary || []).length + 1, title: "", description: "" }],
                          });
                        }}
                        className="w-full px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Add Day
                      </button>
                    </div>
                  )}
                </div>

                {/* Inclusions & Exclusions Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("inclusions")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-orange-50 hover:bg-orange-100 transition"
                  >
                    <span className="font-semibold text-orange-900">Inclusions & Exclusions</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedSections.inclusions ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.inclusions && (
                    <div className="p-4 space-y-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-2">Inclusions</label>
                        <div className="space-y-2 mb-3">
                          {(formData.inclusions || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-green-50 p-2 rounded">
                              <span className="text-sm">{item}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem("inclusions", idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add new inclusion"
                            value={tempInclusion}
                            onChange={(e) => setTempInclusion(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                if (tempInclusion.trim()) {
                                  setFormData(prev => ({
                                    ...prev,
                                    inclusions: [...(prev.inclusions || []), tempInclusion.trim()]
                                  }));
                                  setTempInclusion('');
                                }
                              }
                            }}
                            className="flex-1 px-3 py-2 border rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tempInclusion.trim()) {
                                setFormData(prev => ({
                                  ...prev,
                                  inclusions: [...(prev.inclusions || []), tempInclusion.trim()]
                                }));
                                setTempInclusion('');
                              }
                            }}
                            className="px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                          >
                            Add Inclusion
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Exclusions</label>
                        <div className="space-y-2 mb-3">
                          {(formData.exclusions || []).map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-red-50 p-2 rounded">
                              <span className="text-sm">{item}</span>
                              <button
                                type="button"
                                onClick={() => removeArrayItem("exclusions", idx)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add new exclusion"
                            value={tempExclusion}
                            onChange={(e) => setTempExclusion(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                if (tempExclusion.trim()) {
                                  setFormData(prev => ({
                                    ...prev,
                                    exclusions: [...(prev.exclusions || []), tempExclusion.trim()]
                                  }));
                                  setTempExclusion('');
                                }
                              }
                            }}
                            className="flex-1 px-3 py-2 border rounded text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (tempExclusion.trim()) {
                                setFormData(prev => ({
                                  ...prev,
                                  exclusions: [...(prev.exclusions || []), tempExclusion.trim()]
                                }));
                                setTempExclusion('');
                              }
                            }}
                            className="px-4 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                          >
                            Add Exclusion
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>




                {/* Hotels in Puri Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("hotelsPuri")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-red-50 hover:bg-red-100 transition"
                  >
                    <span className="font-semibold text-red-900">Hotels</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedSections.hotelsPuri ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.hotelsPuri && (
                    <div className="p-4 space-y-4 border-t">
                      <div className="space-y-3">
                        {(formData.hotelsPuri || []).map((hotel: any, idx: number) => (
                          <div key={idx} className="bg-red-50 p-3 rounded-lg border border-red-200 space-y-2">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-semibold text-gray-900">{hotel.name} ({hotel.star}★)</p>
                                <p className="text-sm text-gray-600">{hotel.website}</p>
                                <p className="text-xs text-gray-500 mt-1">{hotel.type === 'included' ? 'Included' : 'Upgrade'}</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = formData.hotelsPuri.filter((_: any, i: number) => i !== idx);
                                  setFormData({ ...formData, hotelsPuri: updated });
                                }}
                                className="px-2 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="border-t pt-4 space-y-2">
                        <select
                          value={formData.hotelPuriStar || "3"}
                          onChange={(e) => setFormData({ ...formData, hotelPuriStar: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="3">3 Star</option>
                          <option value="4">4 Star</option>
                          <option value="5">5 Star</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Hotel Name"
                          value={formData.hotelPuriName || ""}
                          onChange={(e) => setFormData({ ...formData, hotelPuriName: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Website URL"
                          value={formData.hotelPuriWebsite || ""}
                          onChange={(e) => setFormData({ ...formData, hotelPuriWebsite: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        />
                        <select
                          value={formData.hotelPuriType || "included"}
                          onChange={(e) => setFormData({ ...formData, hotelPuriType: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-sm"
                        >
                          <option value="included">Included</option>
                          <option value="upgrade">Upgrade</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            if (formData.hotelPuriName?.trim()) {
                              setFormData({
                                ...formData,
                                hotelsPuri: [...(formData.hotelsPuri || []), {
                                  star: parseInt(formData.hotelPuriStar || "3"),
                                  name: formData.hotelPuriName,
                                  website: formData.hotelPuriWebsite,
                                  type: formData.hotelPuriType || "included"
                                }],
                                hotelPuriName: "",
                                hotelPuriWebsite: "",
                                hotelPuriStar: "3",
                                hotelPuriType: "included"
                              });
                            }
                          }}
                          className="w-full px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-sm"
                        >
                          Add Hotel
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Best Time to Visit Section */}
                <div className="border rounded-lg">
                  <button
                    type="button"
                    onClick={() => toggleSection("bestTime")}
                    className="w-full px-4 py-3 flex items-center justify-between bg-pink-50 hover:bg-pink-100 transition"
                  >
                    <span className="font-semibold text-pink-900">Best Time to Visit</span>
                    <ChevronDown
                      className={`w-5 h-5 transition-transform ${expandedSections.bestTime ? "rotate-180" : ""}`}
                    />
                  </button>
                  {expandedSections.bestTime && (
                    <div className="p-4 space-y-4 border-t">
                      <div>
                        <label className="block text-sm font-medium mb-1">Ideal Season</label>
                        <input
                          type="text"
                          value={formData.bestTime || ""}
                          onChange={(e) => setFormData({ ...formData, bestTime: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-600"
                          placeholder="e.g., October to March"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="gap-2"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    {editingId ? "Update Tour" : "Create Tour"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Search and Filter Section - At Top */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Tours</CardTitle>
            <CardDescription>Use full-text search for faster results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Search Term</label>
                <input
                  type="text"
                  placeholder="Search by name, description..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Difficulty Filter</label>
                <select
                  value={difficultyFilter}
                  onChange={(e) => {
                    setDifficultyFilter(e.target.value);
                    setPage(0);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">All Difficulties</option>
                  <option value="easy">Easy</option>
                  <option value="moderate">Moderate</option>
                  <option value="challenging">Challenging</option>
                </select>
              </div>
              {searchTerm && tourCount !== undefined && (
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-600">Found {tourCount} matching tours</p>
                  <Button
                    onClick={() => {
                      const toursToExport = displayTours.map((tour: any) => ({
                        id: tour.id,
                        name: tour.name,
                        slug: tour.slug,
                        category: tour.category || "",
                        difficulty: tour.difficulty || "",
                        duration: tour.duration || "",
                        price: tour.price || "",
                        description: tour.description || "",
                      }));
                      exportToursToCSV(toursToExport, generateFilename("tours-export"));
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

        {/* Tours List - In Middle */}
        <div className="space-y-4" style={{ minHeight: "300px" }}>
          {isLoadingData ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : allTours && allTours.length > 0 ? (
            displayTours.map((tour: any) => (
              <Card key={tour.id} className={`hover:shadow-lg transition-shadow ${
                selectedTours.has(tour.id) ? "border-red-500 bg-red-50" : ""
              }`}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedTours.has(tour.id)}
                      onChange={() => handleSelectTour(tour.id)}
                      className="w-5 h-5 cursor-pointer mt-1 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">{tour.name}</h3>
                      {tour.description && (
                        <p className="text-gray-600 mb-3 line-clamp-2">{tour.description}</p>
                      )}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {tour.duration && (
                          <span className="text-gray-700">
                            <strong>Duration:</strong> {tour.duration} days
                          </span>
                        )}
                        {tour.price && (
                          <span className="text-gray-700">
                            <strong>Price:</strong> ₹{tour.price}
                          </span>
                        )}
                        {tour.difficulty && (
                          <span className="text-gray-700">
                            <strong>Difficulty:</strong> {tour.difficulty}
                          </span>
                        )}
                        {tour.category && (
                          <span className="text-gray-700">
                            <strong>Category:</strong> {tour.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/visit/tour/${tour.slug}`, '_blank')}
                        className="gap-1"
                        title="View the live generated tour page"
                      >
                        <ExternalLink className="w-4 h-4" />
                        View Live
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(tour)}
                        className="gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(tour.id)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-gray-600">
                No tours found. Create your first tour to get started.
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination Controls - At Bottom */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-8 pt-6 border-t">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, allTours?.length || 0)} of {allTours?.length || 0} tours
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
    </AdminLayout>
  );
}
