import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { trpc } from '@/lib/trpc';
import { Trash2, Plus, GripVertical } from 'lucide-react';

export function AdminFeaturedDestinationsEditor() {
  const [imageUrl, setImageUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: destinations = [], refetch } = trpc.homePageSettings.getAllFeaturedDestinations.useQuery(undefined, {
    refetchInterval: 5000,
    staleTime: 2000,
  });

  const createMutation = trpc.homePageSettings.createFeaturedDestination.useMutation({
    onSuccess: () => {
      setImageUrl('');
      setTitle('');
      setDescription('');
      refetch();
    },
  });

  const updateMutation = trpc.homePageSettings.updateFeaturedDestination.useMutation({
    onSuccess: () => {
      setImageUrl('');
      setTitle('');
      setDescription('');
      setEditingId(null);
      refetch();
    },
  });

  const deleteMutation = trpc.homePageSettings.deleteFeaturedDestination.useMutation({
    onSuccess: () => refetch(),
  });

  const reorderMutation = trpc.homePageSettings.reorderFeaturedDestinations.useMutation({
    onSuccess: () => refetch(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!imageUrl || !title) {
      alert('Image URL and Title are required');
      return;
    }

    if (editingId) {
      await updateMutation.mutateAsync({
        id: editingId,
        imageUrl,
        title,
        description,
      });
    } else {
      await createMutation.mutateAsync({
        imageUrl,
        title,
        description,
        displayOrder: destinations.length,
      });
    }
  };

  const handleEdit = (dest: any) => {
    setImageUrl(dest.imageUrl);
    setTitle(dest.title);
    setDescription(dest.description || '');
    setEditingId(dest.id);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this destination?')) {
      deleteMutation.mutate({ id });
    }
  };

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      const updated = [...destinations];
      [updated[index].displayOrder, updated[index - 1].displayOrder] = [
        updated[index - 1].displayOrder,
        updated[index].displayOrder,
      ];
      reorderMutation.mutate({
        destinations: updated.map(d => ({ id: d.id, displayOrder: d.displayOrder })),
      });
    }
  };

  const handleMoveDown = (index: number) => {
    if (index < destinations.length - 1) {
      const updated = [...destinations];
      [updated[index].displayOrder, updated[index + 1].displayOrder] = [
        updated[index + 1].displayOrder,
        updated[index].displayOrder,
      ];
      reorderMutation.mutate({
        destinations: updated.map(d => ({ id: d.id, displayOrder: d.displayOrder })),
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingId ? 'Edit Featured Destination' : 'Add New Featured Destination'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Image URL *</label>
              <Input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Title *</label>
              <Input
                type="text"
                placeholder="Destination title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                placeholder="Destination description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                {editingId ? 'Update' : 'Add'} Destination
              </Button>
              {editingId && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setImageUrl('');
                    setTitle('');
                    setDescription('');
                    setEditingId(null);
                  }}
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Destinations ({destinations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {destinations.length === 0 ? (
            <p className="text-gray-500">No featured destinations yet</p>
          ) : (
            <div className="space-y-4">
              {destinations.map((dest, index) => (
                <div key={dest.id} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    <img
                      src={dest.imageUrl}
                      alt={dest.title}
                      className="w-20 h-20 object-cover rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-semibold">{dest.title}</h3>
                    {dest.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{dest.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">Order: {dest.displayOrder}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(dest)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(dest.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleMoveDown(index)}
                        disabled={index === destinations.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
