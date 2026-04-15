import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Edit2, X } from "lucide-react";
import { toast } from "sonner";
import { AdminCountriesCarousel } from "@/components/AdminCountriesCarousel";
import AdminDestinationGallery from "@/components/AdminDestinationGallery";
import { AdminSectionContentEditor } from "@/components/AdminSectionContentEditor";
import { AdminLayout } from "@/components/AdminLayout";

interface SliderImage {
  id: string;
  image: string;
  alt: string;
  title: string;
}

export default function AdminHomePageSettings() {
  const { data: settings, isLoading, refetch } = trpc.homePageSettings.getSettings.useQuery();
  const updateSettingsMutation = trpc.homePageSettings.updateSettings.useMutation();
  const addImageMutation = trpc.homePageSettings.addImage.useMutation();
  const removeImageMutation = trpc.homePageSettings.removeImage.useMutation();
  const updateImageMutation = trpc.homePageSettings.updateImage.useMutation();

  const [sliderImages, setSliderImages] = useState<SliderImage[]>(settings?.sliderImages || []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<Partial<SliderImage>>({});
  const [newImage, setNewImage] = useState<Partial<SliderImage>>({
    id: "",
    image: "",
    alt: "",
    title: "",
  });

  // Update local state when settings change
  if (settings?.sliderImages && JSON.stringify(sliderImages) !== JSON.stringify(settings.sliderImages)) {
    setSliderImages(settings.sliderImages);
  }

  const handleAddImage = async () => {
    if (!newImage.image || !newImage.alt || !newImage.title) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const imageId = `img-${Date.now()}`;
      await addImageMutation.mutateAsync({
        id: imageId,
        image: newImage.image as string,
        alt: newImage.alt as string,
        title: newImage.title as string,
      });

      setNewImage({ id: "", image: "", alt: "", title: "" });
      refetch();
      toast.success("Image added successfully");
    } catch (error) {
      toast.error("Failed to add image");
    }
  };

  const handleRemoveImage = async (imageId: string) => {
    try {
      await removeImageMutation.mutateAsync({ imageId });
      refetch();
      toast.success("Image removed successfully");
    } catch (error) {
      toast.error("Failed to remove image");
    }
  };

  const handleUpdateImage = async (imageId: string) => {
    if (!editingData.image || !editingData.alt || !editingData.title) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await updateImageMutation.mutateAsync({
        imageId,
        updates: {
          image: editingData.image as string,
          alt: editingData.alt as string,
          title: editingData.title as string,
        },
      });

      setEditingId(null);
      setEditingData({});
      refetch();
      toast.success("Image updated successfully");
    } catch (error) {
      toast.error("Failed to update image");
    }
  };

  const startEdit = (image: SliderImage) => {
    setEditingId(image.id);
    setEditingData({ ...image });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <AdminLayout
      title="Home Page Settings"
      description="Manage all homepage content and sections"
    >
      <div className="space-y-6">
        {/* Tips Section */}
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">Tips for Image URLs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-red-800">
              <li>• Use high-quality images (recommended: 600x400px or larger)</li>
              <li>• Ensure images are hosted on a reliable CDN or server</li>
              <li>• Test image URLs before saving to ensure they load correctly</li>
              <li>• For internal links, use format: /destinations/destination-name</li>
              <li>• For external links, use full URLs: https://example.com/page</li>
            </ul>
          </CardContent>
        </Card>

        {/* Add New Image Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Slider Image
            </CardTitle>
            <CardDescription>Add a new image to the hero slider</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Image URL</label>
              <Input
                placeholder="https://example.com/image.jpg"
                value={newImage.image || ""}
                onChange={(e) => setNewImage({ ...newImage, image: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Alt Text</label>
              <Input
                placeholder="Descriptive alt text for accessibility"
                value={newImage.alt || ""}
                onChange={(e) => setNewImage({ ...newImage, alt: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Title</label>
              <Input
                placeholder="Image title/heading"
                value={newImage.title || ""}
                onChange={(e) => setNewImage({ ...newImage, title: e.target.value })}
              />
            </div>
            <Button
              onClick={handleAddImage}
              disabled={addImageMutation.isPending}
              className="w-full"
            >
              {addImageMutation.isPending ? "Adding..." : "Add Image"}
            </Button>
          </CardContent>
        </Card>

        {/* Current Slider Images */}
        <Card>
          <CardHeader>
            <CardTitle>Current Slider Images ({sliderImages.length})</CardTitle>
            <CardDescription>Manage existing hero slider images</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {sliderImages.length === 0 ? (
              <p className="text-gray-500">No slider images added yet</p>
            ) : (
              sliderImages.map((image) => (
                <div key={image.id} className="border rounded-lg p-4 space-y-3">
                  {editingId === image.id ? (
                    // Edit Mode
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Image URL</label>
                        <Input
                          value={editingData.image || ""}
                          onChange={(e) => setEditingData({ ...editingData, image: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Alt Text</label>
                        <Input
                          value={editingData.alt || ""}
                          onChange={(e) => setEditingData({ ...editingData, alt: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Title</label>
                        <Input
                          value={editingData.title || ""}
                          onChange={(e) => setEditingData({ ...editingData, title: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleUpdateImage(image.id)}
                          disabled={updateImageMutation.isPending}
                          size="sm"
                        >
                          {updateImageMutation.isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button
                          onClick={() => {
                            setEditingId(null);
                            setEditingData({});
                          }}
                          variant="outline"
                          size="sm"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <div>
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{image.title}</h3>
                          <p className="text-sm text-gray-600">{image.alt}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => startEdit(image)}
                            variant="outline"
                            size="sm"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            onClick={() => handleRemoveImage(image.id)}
                            variant="destructive"
                            size="sm"
                            disabled={removeImageMutation.isPending}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      <img
                        src={image.image}
                        alt={image.alt}
                        className="w-full h-32 object-cover rounded mt-2"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Countries Carousel Section */}
        <AdminCountriesCarousel />

        {/* Destination Gallery Section */}
        <AdminDestinationGallery />

        {/* Homepage Sections Editor */}
        <AdminSectionContentEditor />
      </div>
    </AdminLayout>
  );
}
