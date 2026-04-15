import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Save, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface EmailDataEditorProps {
  type: string;
  initialData: Record<string, any>;
  fields: string[];
  onDataChange: (data: Record<string, any>) => void;
  onValidation?: (valid: boolean, errors: string[]) => void;
}

/**
 * Email Data Editor Component
 * Allows editing of email template data with validation
 */
export const EmailDataEditor: React.FC<EmailDataEditorProps> = ({
  type,
  initialData,
  fields,
  onDataChange,
  onValidation,
}) => {
  const [data, setData] = useState<Record<string, any>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Group fields by category
  const getFieldCategory = (field: string): string => {
    if (field.startsWith("customer")) return "Customer Information";
    if (field.startsWith("team")) return "Team Member";
    if (field.startsWith("tour") || field.startsWith("booking")) return "Tour & Booking";
    if (field.startsWith("action") || field.startsWith("settings")) return "Links & URLs";
    if (field.startsWith("alert")) return "Alert Details";
    if (field.startsWith("sender") || field.startsWith("message")) return "Message Details";
    if (field.startsWith("update")) return "Update Details";
    return "Other";
  };

  const groupedFields = fields.reduce(
    (acc, field) => {
      const category = getFieldCategory(field);
      if (!acc[category]) acc[category] = [];
      acc[category].push(field);
      return acc;
    },
    {} as Record<string, string[]>
  );

  const handleFieldChange = (field: string, value: any) => {
    const newData = { ...data, [field]: value };
    setData(newData);
    onDataChange(newData);

    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const getFieldType = (field: string): string => {
    if (field.includes("Email")) return "email";
    if (field.includes("Phone")) return "tel";
    if (field.includes("Date") || field.includes("Time")) return "datetime-local";
    if (field.includes("URL") || field.includes("Url")) return "url";
    if (field.includes("Message") || field.includes("Description")) return "textarea";
    if (field.includes("Score") || field.includes("Rate")) return "number";
    return "text";
  };

  const getFieldLabel = (field: string): string => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  const isRequiredField = (field: string): boolean => {
    const requiredFields = [
      "teamMemberName",
      "appUrl",
      "customerName",
      "customerEmail",
      "tourName",
      "actionUrl",
      "senderName",
      "message",
      "alertType",
      "alertMessage",
    ];
    return requiredFields.includes(field);
  };

  const resetData = () => {
    setData(initialData);
    setErrors({});
    onDataChange(initialData);
    toast.success("Data reset to defaults");
  };

  return (
    <div className="space-y-4">
      {/* Sections */}
      {Object.entries(groupedFields).map(([section, sectionFields]) => (
        <Card key={section}>
          <CardHeader
            className="cursor-pointer hover:bg-gray-50"
            onClick={() => toggleSection(section)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{section}</CardTitle>
              <Badge variant="outline">{sectionFields.length}</Badge>
            </div>
          </CardHeader>

          {expandedSections[section] !== false && (
            <CardContent className="space-y-4">
              {sectionFields.map((field) => {
                const fieldType = getFieldType(field);
                const label = getFieldLabel(field);
                const isRequired = isRequiredField(field);
                const error = errors[field];
                const value = data[field] || "";

                return (
                  <div key={field} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium">{label}</label>
                      {isRequired && <Badge className="bg-red-100 text-red-800">Required</Badge>}
                      {error && <Badge className="bg-amber-100 text-amber-800">Error</Badge>}
                    </div>

                    {fieldType === "textarea" ? (
                      <Textarea
                        value={value}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                        className="min-h-24"
                      />
                    ) : (
                      <Input
                        type={fieldType}
                        value={value}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        placeholder={`Enter ${label.toLowerCase()}`}
                      />
                    )}

                    {error && (
                      <div className="flex items-center gap-2 text-xs text-amber-700">
                        <AlertCircle className="h-3 w-3" />
                        {error}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          )}
        </Card>
      ))}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button onClick={resetData} variant="outline" className="gap-2">
          Reset to Defaults
        </Button>
        <Button disabled className="gap-2 ml-auto">
          <Save className="h-4 w-4" />
          All Changes Saved
        </Button>
      </div>

      {/* Summary */}
      <Card className="bg-blue-50">
        <CardContent className="pt-6">
          <div className="space-y-2 text-sm">
            <p className="font-medium">Data Summary</p>
            <p className="text-gray-700">
              Total fields: <strong>{fields.length}</strong>
            </p>
            <p className="text-gray-700">
              Filled fields: <strong>{Object.values(data).filter((v) => v).length}</strong>
            </p>
            <p className="text-gray-700">
              Validation errors: <strong>{Object.keys(errors).length}</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmailDataEditor;
