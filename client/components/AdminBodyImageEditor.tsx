import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Plus, GripVertical } from 'lucide-react';

interface BodyImage {
  id: number;
  imageUrl: string;
  title?: string | null;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
}

export function AdminBodyImageEditor() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    imageUrl: '',
    title: '',
    description: '',
    displayOrder: 0,
  });

  // Fetch all body images
  const { data: bodyImages = [], refetch } = trpc.homePageSettings.getAllBodyImages.useQuery();

  // Create body image mutation
  const createMutation = trpc.homePageSettings.createBodyImage.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Body image added successfully' });
      refetch();
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'Failed to add body image', variant: 'destructive' });
    },
  });

  // Delete body image mutation
  const deleteMutation = trpc.homePageSettings.deleteBodyImage.useMutation({
    onSuccess: () => {
      toast({ title: 'Success', description: 'Body image deleted successfully' });
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'Failed to delete body image', variant: 'destructive' });
    },
  });

  // Reorder body images mutation
  const reorderMutation = trpc.homePageSettings.reorderBodyImages.useMutation({
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message || 'Failed to reorder images', variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({
      imageUrl: '',
      title: '',
      description: '',
      displayOrder: 0,
    });
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this image?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleSave = () => {
    if (!formData.imageUrl.trim()) {
      toast({ title: 'Error', description: 'Image URL is required', variant: 'destructive' });
      return;
    }

    createMutation.mutate({
      imageUrl: formData.imageUrl,
      title: formData.title || undefined,
      description: formData.description || undefined,
      displayOrder: formData.displayOrder,
    });
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newImages = [...bodyImages];
    const temp = newImages[index];
    newImages[index] = newImages[index - 1];
    newImages[index - 1] = temp;

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      displayOrder: idx,
    }));
    reorderMutation.mutate({ images: updates });
  };

  const handleMoveDown = (index: number) => {
    if (index === bodyImages.length - 1) return;
    const newImages = [...bodyImages];
    const temp = newImages[index];
    newImages[index] = newImages[index + 1];
    newImages[index + 1] = temp;

    const updates = newImages.map((img, idx) => ({
      id: img.id,
      displayOrder: idx,
    }));
    reorderMutation.mutate({ images: updates });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Body Image Carousel (Your Perfect Travel Experience)</h3>
        <Button onClick={handleAddNew} className="gap-2">
          <Plus className="w-4 h-4" />
          Add New Image
        </Button>
      </div>

      {bodyImages.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No body images added yet. Add your first image to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bodyImages.map((image, index) => (
            <div key={image.id} className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50">
              <GripVertical className="w-5 h-5 text-gray-400" />
              <div className="flex-1">
                <div className="font-medium">{image.title || 'Untitled'}</div>
                <div className="text-sm text-gray-600">{image.imageUrl}</div>
                {image.description && (
                  <div className="text-sm text-gray-500 mt-1">{image.description}</div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveUp(index)}
                  disabled={index === 0}
                >
                  ↑
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleMoveDown(index)}
                  disabled={index === bodyImages.length - 1}
                >
                  ↓
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(image.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Body Image</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Image URL *</label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input
                placeholder="Image title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <Textarea
                placeholder="Image description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Display Order</label>
              <Input
                type="number"
                min="0"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending}
            >
              Add Image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
