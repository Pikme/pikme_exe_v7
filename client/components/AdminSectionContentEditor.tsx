import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { AdminBodyImageEditor } from "./AdminBodyImageEditor";
import { AdminFeaturedDestinationsEditor } from "./AdminFeaturedDestinationsEditor";
import { AdminReviewWidgetsEditor } from "./AdminReviewWidgetsEditor";
import { AdminDestinationGalleryEditor } from "./AdminDestinationGalleryEditor";

export function AdminSectionContentEditor() {
  const { data: settings } = trpc.homePageSettings.getSettings.useQuery();
  const updateMutation = trpc.homePageSettings.updateSectionContent.useMutation();

  const [formData, setFormData] = useState({
    heroTitle: "",
    heroSubtitle: "",
    whyChooseTitle: "",
    whyChooseSubtitle: "",
    whyChooseDescription: "",
    featuresDescription: "",
  });

  const [saveStatus, setSaveStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  useEffect(() => {
    if (settings) {
      setFormData({
        heroTitle: (settings as any).heroTitle || "Discover Amazing Tours & Experiences",
        heroSubtitle: (settings as any).heroSubtitle || "Explore the best tours, activities, and destinations across the world",
        whyChooseTitle: (settings as any).whyChooseTitle || "Pikmeusa.com",
        whyChooseSubtitle: (settings as any).whyChooseSubtitle || "Why Choose Pikmeusa.com",
        whyChooseDescription: (settings as any).whyChooseDescription || "VIP Customised Domestic, International & Spiritual Tours from World Wide",
        featuresDescription: (settings as any).featuresDescription || "Discover handpicked travel experiences tailored to your preferences and class.",
      });
    }
  }, [settings]);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaveStatus("loading");
    try {
      await updateMutation.mutateAsync(formData);
      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 3000);
    } catch (error) {
      console.error("Error saving section content:", error);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Edit Homepage Sections</h2>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || saveStatus === "loading"}
          className="gap-2"
        >
          {updateMutation.isPending || saveStatus === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {saveStatus === "success" && (
        <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span className="text-green-700">Changes saved successfully!</span>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">Failed to save changes. Please try again.</span>
        </div>
      )}

      <Tabs defaultValue="hero" className="w-full">
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="whyChoose">Why Choose</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="bodyImage">Body Image</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="destinations">Destinations</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        {/* Hero Section */}
        <TabsContent value="hero" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hero Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.heroTitle}
                  onChange={(e) => handleChange("heroTitle", e.target.value)}
                  placeholder="Hero title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <Textarea
                  value={formData.heroSubtitle}
                  onChange={(e) => handleChange("heroSubtitle", e.target.value)}
                  placeholder="Hero subtitle"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Why Choose Section */}
        <TabsContent value="whyChoose" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Why Choose Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  value={formData.whyChooseTitle}
                  onChange={(e) => handleChange("whyChooseTitle", e.target.value)}
                  placeholder="Why Choose title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Subtitle</label>
                <Input
                  value={formData.whyChooseSubtitle}
                  onChange={(e) => handleChange("whyChooseSubtitle", e.target.value)}
                  placeholder="Why Choose subtitle"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.whyChooseDescription}
                  onChange={(e) => handleChange("whyChooseDescription", e.target.value)}
                  placeholder="Why Choose description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Section */}
        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Features Section</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.featuresDescription}
                  onChange={(e) => handleChange("featuresDescription", e.target.value)}
                  placeholder="Features section description"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Body Image Section */}
        <TabsContent value="bodyImage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Body Image Carousel</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminBodyImageEditor />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Destination Gallery Section */}
        <TabsContent value="gallery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Destination Gallery (Lower Body)</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminDestinationGalleryEditor />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Featured Destinations Section */}
        <TabsContent value="destinations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Featured Destinations</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminFeaturedDestinationsEditor />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Review Widgets Section */}
        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Review Widgets</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminReviewWidgetsEditor />
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>

      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending || saveStatus === "loading"}
          className="gap-2"
        >
          {updateMutation.isPending || saveStatus === "loading" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save All Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
