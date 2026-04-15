'use client';

import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, EyeOff, Trash2, Edit2, Plus, GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

interface DestinationCard {
  id: number;
  categoryId: number;
  title: string;
  description: string | null;
  imageUrl: string;
  destinationLink: string;
  displayOrder: number;
  isActive: boolean;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  displayOrder: number;
  isActive: boolean;
}

interface GallerySettings {
  id: number;
  sectionTitle: string;
  sectionDescription: string;
}

const SortableCard: React.FC<{
  card: DestinationCard;
  category?: Category;
  onEdit: (card: DestinationCard) => void;
  onDelete: (id: number) => void;
  onToggleActive: (id: number) => void;
}> = ({ card, category, onEdit, onDelete, onToggleActive }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-4 p-4 bg-white border rounded-lg hover:shadow-md transition-shadow"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="w-5 h-5 text-gray-400" />
      </div>

      {/* Image Preview */}
      <img
        src={card.imageUrl}
        alt={card.title}
        className="w-20 h-20 object-cover rounded"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80';
        }}
      />

      {/* Card Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-sm truncate">{card.title}</h3>
        {category && <p className="text-xs text-gray-500">Category: {category.name}</p>}
        <p className="text-xs text-gray-600 truncate">{card.description}</p>
        <p className="text-xs text-blue-600 truncate">{card.destinationLink}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onToggleActive(card.id)}
          title={card.isActive ? 'Hide' : 'Show'}
        >
          {card.isActive ? (
            <Eye className="w-4 h-4 text-green-600" />
          ) : (
            <EyeOff className="w-4 h-4 text-gray-400" />
          )}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onEdit(card)}
        >
          <Edit2 className="w-4 h-4 text-blue-600" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => onDelete(card.id)}
        >
          <Trash2 className="w-4 h-4 text-red-600" />
        </Button>
      </div>
    </div>
  );
};

export default function AdminDestinationGallery() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    destinationLink: '',
  });
  const [editingCard, setEditingCard] = useState<DestinationCard | null>(null);
  const [sectionSettings, setSectionSettings] = useState({
    sectionTitle: 'Destination Gallery',
    sectionDescription: 'Explore amazing destinations across India and beyond',
  });

  // Fetch categories
  const { data: categories = [], refetch: refetchCategories } = trpc.destinationGalleryCategories.getAll.useQuery();

  // Fetch gallery settings
  const { data: settings } = trpc.destinationGallery.getSettings.useQuery();

  // Fetch all destination cards
  const { data: allCards = [], refetch: refetchCards } = trpc.destinationGallery.getAll.useQuery();

  // Mutations
  const addCategoryMutation = trpc.destinationGalleryCategories.add.useMutation({
    onSuccess: () => {
      toast({ title: 'Category added successfully' });
      setNewCategoryName('');
      refetchCategories();
    },
    onError: (error) => {
      toast({ title: 'Error adding category', description: error.message, variant: 'destructive' });
    },
  });

  const addCardMutation = trpc.destinationGallery.addCard.useMutation({
    onSuccess: () => {
      toast({ title: 'Destination card added successfully' });
      setFormData({ title: '', description: '', imageUrl: '', destinationLink: '' });
      refetchCards();
    },
    onError: (error) => {
      toast({ title: 'Error adding card', description: error.message, variant: 'destructive' });
    },
  });

  const updateCardMutation = trpc.destinationGallery.updateCard.useMutation({
    onSuccess: () => {
      toast({ title: 'Destination card updated successfully' });
      setEditingCard(null);
      setFormData({ title: '', description: '', imageUrl: '', destinationLink: '' });
      refetchCards();
    },
    onError: (error) => {
      toast({ title: 'Error updating card', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCardMutation = trpc.destinationGallery.deleteCard.useMutation({
    onSuccess: () => {
      toast({ title: 'Destination card deleted successfully' });
      refetchCards();
    },
    onError: (error) => {
      toast({ title: 'Error deleting card', description: error.message, variant: 'destructive' });
    },
  });

  const toggleCardActiveMutation = trpc.destinationGallery.toggleCardActive.useMutation({
    onSuccess: () => {
      refetchCards();
    },
    onError: (error) => {
      toast({ title: 'Error updating card', description: error.message, variant: 'destructive' });
    },
  });

  const updateSettingsMutation = trpc.destinationGallery.updateSettings.useMutation({
    onSuccess: () => {
      toast({ title: 'Gallery settings updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error updating settings', description: error.message, variant: 'destructive' });
    },
  });

  const reorderCardsMutation = trpc.destinationGallery.reorderCards.useMutation({
    onError: (error) => {
      toast({ title: 'Error reordering cards', description: error.message, variant: 'destructive' });
    },
  });

  const deleteCategoryMutation = trpc.destinationGalleryCategories.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Category deleted successfully' });
      setSelectedCategory(null);
      refetchCategories();
      refetchCards();
    },
    onError: (error) => {
      toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
    },
  });

  // Set default category
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories, selectedCategory]);

  // Update section settings from query
  useEffect(() => {
    if (settings) {
      setSectionSettings({
        sectionTitle: settings.sectionTitle || 'Destination Gallery',
        sectionDescription: settings.sectionDescription || 'Explore amazing destinations across India and beyond',
      });
    }
  }, [settings]);

  const handleAddCategory = () => {
    if (!newCategoryName.trim()) {
      toast({ title: 'Please enter a category name', variant: 'destructive' });
      return;
    }
    addCategoryMutation.mutate({ name: newCategoryName });
  };

  const handleAddCard = () => {
    if (!selectedCategory) {
      toast({ title: 'Please select a category', variant: 'destructive' });
      return;
    }
    if (!formData.title.trim() || !formData.imageUrl.trim() || !formData.destinationLink.trim()) {
      toast({ title: 'Please fill in all required fields', variant: 'destructive' });
      return;
    }

    if (editingCard) {
      updateCardMutation.mutate({
        id: editingCard.id,
        categoryId: selectedCategory,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        destinationLink: formData.destinationLink,
      });
    } else {
      addCardMutation.mutate({
        categoryId: selectedCategory,
        title: formData.title,
        description: formData.description,
        imageUrl: formData.imageUrl,
        destinationLink: formData.destinationLink,
      });
    }
  };

  const handleEditCard = (card: DestinationCard) => {
    setEditingCard(card);
    setSelectedCategory(card.categoryId);
    setFormData({
      title: card.title,
      description: card.description || '',
      imageUrl: card.imageUrl,
      destinationLink: card.destinationLink,
    });
  };

  const handleDeleteCard = (id: number) => {
    if (confirm('Are you sure you want to delete this card?')) {
      deleteCardMutation.mutate({ id });
    }
  };

  const handleToggleCardActive = (id: number) => {
    toggleCardActiveMutation.mutate({ id });
  };

  const handleSaveSettings = () => {
    updateSettingsMutation.mutate(sectionSettings);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = allCards.findIndex((c) => c.id === active.id);
      const newIndex = allCards.findIndex((c) => c.id === over.id);
      const newOrder = arrayMove(allCards, oldIndex, newIndex);
      const updates = newOrder.map((card, index) => ({
        id: card.id,
        displayOrder: index,
      }));
      reorderCardsMutation.mutate({ updates });
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const filteredCards = selectedCategory
    ? allCards.filter((card) => card.categoryId === selectedCategory)
    : [];

  const getCategoryName = (categoryId: number) => {
    return categories.find((c) => c.id === categoryId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-8">
      {/* Gallery Section Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Gallery Section Settings</CardTitle>
          <CardDescription>Customize the gallery section title and description</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Section Title</label>
            <Input
              value={sectionSettings.sectionTitle}
              onChange={(e) => setSectionSettings({ ...sectionSettings, sectionTitle: e.target.value })}
              placeholder="e.g., Destination Gallery"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Section Description</label>
            <Textarea
              value={sectionSettings.sectionDescription}
              onChange={(e) => setSectionSettings({ ...sectionSettings, sectionDescription: e.target.value })}
              placeholder="e.g., Explore amazing destinations across India and beyond"
            />
          </div>
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Category Management */}
      <Card>
        <CardHeader>
          <CardTitle>Categories</CardTitle>
          <CardDescription>Manage destination categories</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g., Spiritual Places"
              onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
            />
            <Button onClick={handleAddCategory} disabled={addCategoryMutation.isPending}>
              <Plus className="w-4 h-4 mr-2" />
              Add Category
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center gap-1">
                <button
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === category.id
                      ? 'bg-red-600 text-white'
                      : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }`}
                >
                  {category.name}
                </button>
                {selectedCategory === category.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all destination cards in this category.`)) {
                        deleteCategoryMutation.mutate({ id: category.id });
                      }
                    }}
                    disabled={deleteCategoryMutation.isPending}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Destination Card */}
      <Card>
        <CardHeader>
          <CardTitle>{editingCard ? 'Edit Destination Card' : 'Add New Destination Card'}</CardTitle>
          <CardDescription>
            {selectedCategory
              ? `Adding to: ${getCategoryName(selectedCategory)}`
              : 'Select a category first'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Vaishno Devi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Sacred Mountain Shrine"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Image URL *</label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              type="url"
            />
            {formData.imageUrl && (
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="mt-2 h-32 object-cover rounded"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200';
                }}
              />
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Destination Link *</label>
            <Input
              value={formData.destinationLink}
              onChange={(e) => setFormData({ ...formData, destinationLink: e.target.value })}
              placeholder="e.g., /destinations/vaishno-devi or https://example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              Use internal routes (e.g., /destinations/name) or external URLs (e.g., https://...)
            </p>
          </div>
          <Button
            onClick={handleAddCard}
            disabled={addCardMutation.isPending || updateCardMutation.isPending}
            className="w-full"
          >
            {editingCard ? 'Update Card' : 'Add Card'}
          </Button>
          {editingCard && (
            <Button
              onClick={() => {
                setEditingCard(null);
                setFormData({ title: '', description: '', imageUrl: '', destinationLink: '' });
              }}
              variant="outline"
              className="w-full"
            >
              Cancel Edit
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Destination Cards List */}
      <Card>
        <CardHeader>
          <CardTitle>Destination Cards ({filteredCards.length})</CardTitle>
          <CardDescription>
            {selectedCategory
              ? `Showing cards for: ${getCategoryName(selectedCategory)}`
              : 'Select a category to view cards'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCards.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No destination cards added yet for this category.</p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={filteredCards.map((c) => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3">
                  {filteredCards.map((card) => (
                    <SortableCard
                      key={card.id}
                      card={card}
                      category={categories.find((c) => c.id === card.categoryId)}
                      onEdit={handleEditCard}
                      onDelete={handleDeleteCard}
                      onToggleActive={handleToggleCardActive}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Image URLs</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
            <li>Use high-quality images (recommended: 600x400px or larger)</li>
            <li>Ensure images are hosted on a reliable CDN or server</li>
            <li>Test image URLs before saving to ensure they load correctly</li>
            <li>For internal links, use format: /destinations/destination-name</li>
            <li>For external links, use full URLs: https://example.com/page</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
