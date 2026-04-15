import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Upload, X, Star, Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

interface AttractionImage {
  id: string;
  url: string;
  fileName: string;
  size: number;
  uploadedAt: Date;
  isFeatured: boolean;
}

interface AttractionImageGalleryProps {
  attractionId: number;
  onImagesUpdated?: (images: AttractionImage[]) => void;
}

export function AttractionImageGallery({
  attractionId,
  onImagesUpdated,
}: AttractionImageGalleryProps) {
  const [images, setImages] = useState<AttractionImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadImageMutation = trpc.attractions.uploadImage.useMutation({
    onSuccess: (newImage) => {
      const updatedImages = [...images, newImage];
      setImages(updatedImages);
      onImagesUpdated?.(updatedImages);
      setUploadError(null);
    },
    onError: (error) => {
      setUploadError(error.message || "Failed to upload image");
    },
  });

  const deleteImageMutation = trpc.attractions.deleteImage.useMutation({
    onSuccess: (deletedImageId) => {
      const updatedImages = images.filter((img) => img.id !== deletedImageId);
      setImages(updatedImages);
      onImagesUpdated?.(updatedImages);
    },
    onError: (error) => {
      setUploadError(error.message || "Failed to delete image");
    },
  });

  const setFeaturedMutation = trpc.attractions.setFeaturedImage.useMutation({
    onSuccess: () => {
      // Refetch images to get updated featured status
      setUploadError(null);
    },
    onError: (error) => {
      setUploadError(error.message || "Failed to set featured image");
    },
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFiles(files);
    }
  };

  const handleFiles = async (files: FileList) => {
    setIsUploading(true);
    setUploadError(null);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setUploadError("Only image files are allowed");
        continue;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadError("Image size must be less than 5MB");
        continue;
      }

      try {
        const reader = new FileReader();
        reader.onload = async (e) => {
          const base64 = e.target?.result as string;
          await uploadImageMutation.mutateAsync({
            attractionId,
            fileName: file.name,
            fileData: base64,
            size: file.size,
          });
        };
        reader.readAsDataURL(file);
      } catch (error) {
        setUploadError(
          error instanceof Error ? error.message : "Upload failed"
        );
      }
    }

    setIsUploading(false);
  };

  const handleDelete = (imageId: string) => {
    if (confirm("Are you sure you want to delete this image?")) {
      deleteImageMutation.mutate({ imageId });
    }
  };

  const handleSetFeatured = (imageId: string) => {
    setFeaturedMutation.mutate({ attractionId, imageId });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Attraction Images</span>
          <Badge variant="outline">{images.length} images</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Upload Area */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 bg-gray-50"
          }`}
        >
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-2">
            Drag and drop images here or click to select
          </p>
          <p className="text-xs text-gray-500 mb-4">
            PNG, JPG, GIF up to 5MB
          </p>
          <Input
            type="file"
            multiple
            accept="image/*"
            onChange={handleChange}
            disabled={isUploading}
            className="hidden"
            id="image-upload"
          />
          <Button
            asChild
            variant="outline"
            disabled={isUploading}
          >
            <label htmlFor="image-upload" className="cursor-pointer">
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Select Images
                </>
              )}
            </label>
          </Button>
        </div>

        {/* Error Message */}
        {uploadError && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-700">{uploadError}</p>
          </div>
        )}

        {/* Images Grid */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((image) => (
              <div
                key={image.id}
                className="relative group rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
              >
                {/* Image */}
                <img
                  src={image.url}
                  alt={image.fileName}
                  className="w-full h-32 object-cover"
                />

                {/* Featured Badge */}
                {image.isFeatured && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-white rounded-full p-1">
                    <Star className="h-4 w-4 fill-current" />
                  </div>
                )}

                {/* Overlay Actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetFeatured(image.id)}
                    disabled={setFeaturedMutation.isPending}
                    title="Set as featured image"
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                    disabled={deleteImageMutation.isPending}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* File Info */}
                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  <p className="text-xs font-medium text-gray-700 truncate">
                    {image.fileName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(image.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {images.length === 0 && !isUploading && (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500">
              No images uploaded yet. Start by uploading your first image.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
