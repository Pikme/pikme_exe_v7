import React, { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, Edit2, X, Eye, EyeOff, GripVertical } from 'lucide-react';
import { toast } from 'sonner';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Country {
  id: number;
  countryName: string;
  description: string | null;
  imageUrl: string;
  destinationLink: string;
  displayOrder: number;
  isActive: boolean;
}

interface FormData {
  countryName: string;
  description: string;
  imageUrl: string;
  destinationLink: string;
}

const SortableCountryItem: React.FC<{
  country: Country;
  onEdit: (country: Country) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}> = ({ country, onEdit, onDelete, onToggleActive }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: country.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border rounded-lg p-4 bg-white space-y-3 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <button
            {...attributes}
            {...listeners}
            className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{country.countryName}</h3>
            {country.description && (
              <p className="text-sm text-gray-600 mt-1">{country.description}</p>
            )}
            <div className="mt-2 text-xs text-gray-500 break-all">
              <p><strong>Image:</strong> {country.imageUrl}</p>
              <p><strong>Link:</strong> {country.destinationLink}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => onToggleActive(country.id)}
            variant="outline"
            size="sm"
            title={country.isActive ? 'Hide' : 'Show'}
          >
            {country.isActive ? (
              <Eye className="w-4 h-4" />
            ) : (
              <EyeOff className="w-4 h-4" />
            )}
          </Button>
          <Button
            onClick={() => onEdit(country)}
            variant="outline"
            size="sm"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            onClick={() => onDelete(country.id)}
            variant="destructive"
            size="sm"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Image Preview */}
      <div className="mt-3 max-w-xs">
        <img
          src={country.imageUrl}
          alt={country.countryName}
          className="w-full h-32 object-cover rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
          }}
        />
      </div>

      {!country.isActive && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-2 text-xs text-yellow-800">
          This country is currently hidden from the carousel
        </div>
      )}
    </div>
  );
};

export const AdminCountriesCarousel: React.FC = () => {
  const { data: countries, isLoading, refetch } = trpc.countriesCarousel.getAllAdmin.useQuery();
  const addMutation = trpc.countriesCarousel.add.useMutation();
  const updateMutation = trpc.countriesCarousel.update.useMutation();
  const deleteMutation = trpc.countriesCarousel.delete.useMutation();
  const toggleActiveMutation = trpc.countriesCarousel.toggleActive.useMutation();
  const reorderMutation = trpc.countriesCarousel.reorder.useMutation();

  const [sortedCountries, setSortedCountries] = useState<Country[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<FormData>({
    countryName: '',
    description: '',
    imageUrl: '',
    destinationLink: '',
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (countries) {
      setSortedCountries([...countries].sort((a, b) => a.displayOrder - b.displayOrder));
    }
  }, [countries]);

  const handleAddCountry = async () => {
    if (!formData.countryName || !formData.imageUrl || !formData.destinationLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await addMutation.mutateAsync({
        countryName: formData.countryName,
        description: formData.description || null,
        imageUrl: formData.imageUrl,
        destinationLink: formData.destinationLink,
      });

      setFormData({
        countryName: '',
        description: '',
        imageUrl: '',
        destinationLink: '',
      });
      refetch();
      toast.success('Country added successfully');
    } catch (error) {
      toast.error('Failed to add country');
    }
  };

  const handleUpdateCountry = async () => {
    if (!editingId || !formData.countryName || !formData.imageUrl || !formData.destinationLink) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: editingId,
        countryName: formData.countryName,
        description: formData.description || null,
        imageUrl: formData.imageUrl,
        destinationLink: formData.destinationLink,
      });

      setEditingId(null);
      setFormData({
        countryName: '',
        description: '',
        imageUrl: '',
        destinationLink: '',
      });
      refetch();
      toast.success('Country updated successfully');
    } catch (error) {
      toast.error('Failed to update country');
    }
  };

  const handleDeleteCountry = async (id: number) => {
    if (!confirm('Are you sure you want to delete this country?')) return;

    try {
      await deleteMutation.mutateAsync({ id });
      refetch();
      toast.success('Country deleted successfully');
    } catch (error) {
      toast.error('Failed to delete country');
    }
  };

  const handleToggleActive = async (id: number) => {
    try {
      await toggleActiveMutation.mutateAsync({ id });
      refetch();
      toast.success('Country visibility updated');
    } catch (error) {
      toast.error('Failed to update country visibility');
    }
  };

  const handleEditCountry = (country: Country) => {
    setEditingId(country.id);
    setFormData({
      countryName: country.countryName,
      description: country.description || '',
      imageUrl: country.imageUrl,
      destinationLink: country.destinationLink,
    });
  };

  const handleDragEnd = async (event: any) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedCountries.findIndex((c) => c.id === active.id);
      const newIndex = sortedCountries.findIndex((c) => c.id === over.id);

      const newOrder = arrayMove(sortedCountries, oldIndex, newIndex);
      setSortedCountries(newOrder);

      try {
        await reorderMutation.mutateAsync({
          items: newOrder.map((c, index) => ({
            id: c.id,
            displayOrder: index,
          })),
        });
        toast.success('Countries reordered successfully');
      } catch (error) {
        toast.error('Failed to reorder countries');
        refetch();
      }
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            {editingId ? 'Edit Country' : 'Add New Country'}
          </CardTitle>
          <CardDescription>
            {editingId ? 'Update country information' : 'Add a new country to the carousel'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Country Name *</label>
            <Input
              placeholder="e.g., Japan"
              value={formData.countryName}
              onChange={(e) => setFormData({ ...formData, countryName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              placeholder="Brief description of the country"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL *</label>
            <Input
              placeholder="https://example.com/image.jpg"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Destination Link *</label>
            <Input
              placeholder="e.g., /destinations/japan or https://example.com"
              value={formData.destinationLink}
              onChange={(e) => setFormData({ ...formData, destinationLink: e.target.value })}
            />
          </div>

          {/* Image Preview */}
          {formData.imageUrl && (
            <div className="max-w-xs">
              <p className="text-sm font-medium mb-2">Preview:</p>
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-full h-32 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
                }}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={editingId ? handleUpdateCountry : handleAddCountry}
              disabled={addMutation.isPending || updateMutation.isPending}
              className="flex-1"
            >
              {editingId
                ? updateMutation.isPending
                  ? 'Updating...'
                  : 'Update Country'
                : addMutation.isPending
                  ? 'Adding...'
                  : 'Add Country'}
            </Button>
            {editingId && (
              <Button
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    countryName: '',
                    description: '',
                    imageUrl: '',
                    destinationLink: '',
                  });
                }}
                variant="outline"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Countries List */}
      <Card>
        <CardHeader>
          <CardTitle>Countries in Carousel ({sortedCountries.length})</CardTitle>
          <CardDescription>Drag to reorder, click icons to edit or delete</CardDescription>
        </CardHeader>
        <CardContent>
          {sortedCountries.length === 0 ? (
            <p className="text-gray-500">No countries added yet</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedCountries.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {sortedCountries.map((country) => (
                    <SortableCountryItem
                      key={country.id}
                      country={country}
                      onEdit={handleEditCountry}
                      onDelete={handleDeleteCountry}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Info Section */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">Tips</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-blue-800 space-y-2">
          <p>• Use high-quality images (at least 600x400 pixels)</p>
          <p>• For internal routes, use paths like /destinations/japan</p>
          <p>• For external links, use full URLs like https://example.com</p>
          <p>• Drag items to reorder them in the carousel</p>
          <p>• Use the eye icon to hide/show countries without deleting</p>
        </CardContent>
      </Card>
    </div>
  );
};
