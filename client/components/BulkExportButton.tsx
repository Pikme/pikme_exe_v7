import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface BulkExportButtonProps {
  countryId?: number;
  stateId?: number;
  variant?: "default" | "outline" | "ghost" | "secondary" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function BulkExportButton({
  countryId,
  stateId,
  variant = "outline",
  size = "default",
  className,
}: BulkExportButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // For now, we'll fetch the data directly and generate CSV client-side
      // In a real app, you might want to use a tRPC query
      const locations = countryId
        ? await fetch(`/api/trpc/locations.listByCountry?input=${JSON.stringify({ countryId, limit: 10000 })}`)
            .then((r) => r.json())
            .then((r) => r.result?.data || [])
        : [];

      if (locations.length === 0) {
        toast.error("No locations to export");
        return;
      }

      // Generate CSV
      const headers = [
        "id",
        "name",
        "slug",
        "description",
        "latitude",
        "longitude",
        "metaTitle",
        "metaDescription",
        "metaKeywords",
        "image",
      ];

      const csvContent = [
        headers.join(","),
        ...locations.map((loc: any) =>
          headers
            .map((header) => {
              const value = loc[header];
              if (value === null || value === undefined) return "";
              const stringValue = String(value);
              if (stringValue.includes(",") || stringValue.includes("\n") || stringValue.includes('"')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            })
            .join(",")
        ),
      ].join("\n");

      // Download
      const element = document.createElement("a");
      const file = new Blob([csvContent], { type: "text/csv" });
      element.href = URL.createObjectURL(file);
      const timestamp = new Date().toISOString().split("T")[0];
      element.download = `locations-${timestamp}.csv`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast.success(`Exported ${locations.length} locations`);
    } catch (error) {
      toast.error("Export failed");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleExport}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      Export CSV
    </Button>
  );
}
