import React, { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui/toggle-group";
import { AdminLayout } from "@/components/AdminLayout";
import { Plus, Edit2, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface FeatureFlag {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  rolloutPercentage: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Admin dashboard for managing feature flags
 */
export default function AdminFeatureFlagsDashboard() {
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Queries
  const { data: flagsData, isLoading, refetch } = trpc.featureFlagsAdmin.listFlags.useQuery();

  // Mutations
  const toggleFlagMutation = trpc.featureFlagsAdmin.toggleFlag.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Flag toggled successfully");
    },
    onError: (error) => {
      toast.error(`Failed to toggle flag: ${error.message}`);
    },
  });

  const updateRolloutMutation = trpc.featureFlagsAdmin.updateRollout.useMutation({
    onSuccess: () => {
      refetch();
      toast.success("Rollout percentage updated");
    },
    onError: (error) => {
      toast.error(`Failed to update rollout: ${error.message}`);
    },
  });

  const deleteFlagMutation = trpc.featureFlagsAdmin.deleteFlag.useMutation({
    onSuccess: () => {
      refetch();
      setIsDeleteDialogOpen(false);
      setSelectedFlag(null);
      toast.success("Flag deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete flag: ${error.message}`);
    },
  });

  const flags = flagsData?.flags || [];
  const filteredFlags = flags.filter(
    (flag) =>
      flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      flag.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleToggleFlag = (flag: FeatureFlag) => {
    toggleFlagMutation.mutate({
      flagName: flag.name,
      enabled: !flag.enabled,
    });
  };

  const handleUpdateRollout = (flag: FeatureFlag, percentage: number) => {
    updateRolloutMutation.mutate({
      flagName: flag.name,
      rolloutPercentage: percentage,
    });
  };

  const handleDeleteFlag = () => {
    if (selectedFlag) {
      deleteFlagMutation.mutate({
        flagName: selectedFlag.name,
      });
    }
  };

  return (
    <AdminLayout title="FeatureFlagsDashboard">
      <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Feature Flags</h1>
          <p className="text-gray-600 mt-1">Manage feature flags and rollout percentages</p>
        </div>
        <CreateFlagDialog onSuccess={() => refetch()} />
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <Input
          placeholder="Search flags..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          label="Total Flags"
          value={flags.length}
          description="Feature flags"
        />
        <StatCard
          label="Enabled"
          value={flags.filter((f) => f.enabled).length}
          description="Active flags"
        />
        <StatCard
          label="Disabled"
          value={flags.filter((f) => !f.enabled).length}
          description="Inactive flags"
        />
        <StatCard
          label="Avg Rollout"
          value={
            flags.length > 0
              ? Math.round(
                  flags.reduce((sum, f) => sum + f.rolloutPercentage, 0) /
                    flags.length
                )
              : 0
          }
          description="Percent"
        />
      </div>

      {/* Flags Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Flag Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Rollout</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading flags...
                </TableCell>
              </TableRow>
            ) : filteredFlags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No flags found
                </TableCell>
              </TableRow>
            ) : (
              filteredFlags.map((flag) => (
                <FlagRow
                  key={flag.id}
                  flag={flag}
                  onToggle={() => handleToggleFlag(flag)}
                  onRolloutChange={(percentage) =>
                    handleUpdateRollout(flag, percentage)
                  }
                  onEdit={() => {
                    setSelectedFlag(flag);
                    setIsEditDialogOpen(true);
                  }}
                  onDelete={() => {
                    setSelectedFlag(flag);
                    setIsDeleteDialogOpen(true);
                  }}
                  isUpdating={
                    toggleFlagMutation.isPending ||
                    updateRolloutMutation.isPending
                  }
                />
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feature Flag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the "{selectedFlag?.name}" flag?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-2 justify-end">
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteFlag}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </AdminLayout>
  );
}

/**
 * Individual flag row in the table
 */
interface FlagRowProps {
  flag: FeatureFlag;
  onToggle: () => void;
  onRolloutChange: (percentage: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
}

function FlagRow({
  flag,
  onToggle,
  onRolloutChange,
  onEdit,
  onDelete,
  isUpdating,
}: FlagRowProps) {
  return (
    <TableRow>
      <TableCell className="font-medium">{flag.name}</TableCell>
      <TableCell className="text-gray-600 text-sm max-w-xs truncate">
        {flag.description || "—"}
      </TableCell>
      <TableCell>
        <Button
          variant={flag.enabled ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          disabled={isUpdating}
          className="gap-1"
        >
          {flag.enabled ? (
            <>
              <Eye className="w-4 h-4" />
              Enabled
            </>
          ) : (
            <>
              <EyeOff className="w-4 h-4" />
              Disabled
            </>
          )}
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <Slider
            value={[flag.rolloutPercentage]}
            onValueChange={([value]) => onRolloutChange(value)}
            min={0}
            max={100}
            step={5}
            disabled={isUpdating}
            className="w-24"
          />
          <span className="text-sm font-medium w-12 text-right">
            {flag.rolloutPercentage}%
          </span>
        </div>
      </TableCell>
      <TableCell className="text-sm text-gray-500">
        {new Date(flag.createdAt).toLocaleDateString()}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            disabled={isUpdating}
          >
            <Edit2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDelete}
            disabled={isUpdating}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

/**
 * Dialog to create a new feature flag
 */
interface CreateFlagDialogProps {
  onSuccess: () => void;
}

function CreateFlagDialog({ onSuccess }: CreateFlagDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(false);
  const [rollout, setRollout] = useState(0);

  const createMutation = trpc.featureFlagsAdmin.createFlag.useMutation({
    onSuccess: () => {
      toast.success("Flag created successfully");
      setIsOpen(false);
      setName("");
      setDescription("");
      setEnabled(false);
      setRollout(0);
      onSuccess();
    },
    onError: (error) => {
      toast.error(`Failed to create flag: ${error.message}`);
    },
  });

  const handleCreate = () => {
    if (!name.trim()) {
      toast.error("Flag name is required");
      return;
    }

    createMutation.mutate({
      name: name.trim(),
      description: description.trim() || undefined,
      enabled,
      rolloutPercentage: rollout,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          New Flag
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Feature Flag</DialogTitle>
          <DialogDescription>
            Add a new feature flag to manage experiments
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Flag Name
            </label>
            <Input
              placeholder="e.g., new_search_ranking"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Description
            </label>
            <Input
              placeholder="What does this flag control?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Initial Status
            </label>
            <ToggleGroup
              type="single"
              value={enabled ? "enabled" : "disabled"}
              onValueChange={(value) => setEnabled(value === "enabled")}
            >
              <ToggleGroupItem value="enabled">Enabled</ToggleGroupItem>
              <ToggleGroupItem value="disabled">Disabled</ToggleGroupItem>
            </ToggleGroup>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Initial Rollout: {rollout}%
            </label>
            <Slider
              value={[rollout]}
              onValueChange={([value]) => setRollout(value)}
              min={0}
              max={100}
              step={5}
            />
          </div>

          <div className="flex gap-2 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createMutation.isPending || !name.trim()}
            >
              {createMutation.isPending ? "Creating..." : "Create Flag"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Stat card component
 */
interface StatCardProps {
  label: string;
  value: number;
  description: string;
}

function StatCard({ label, value, description }: StatCardProps) {
  return (
    <Card className="p-4">
      <p className="text-sm text-gray-600">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{description}</p>
    </Card>
  );
}
