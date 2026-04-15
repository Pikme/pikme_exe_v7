import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Plus, Edit2, Trash2, CheckCircle2, Clock } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AdminLayout } from "@/components/AdminLayout";

/**
 * Supported locales for content localization
 */
const SUPPORTED_LOCALES = [
  { code: "en-IN", label: "English (India)" },
  { code: "hi-IN", label: "Hindi (India)" },
  { code: "en-US", label: "English (USA)" },
  { code: "en-GB", label: "English (UK)" },
  { code: "es-ES", label: "Spanish (Spain)" },
  { code: "fr-FR", label: "French (France)" },
  { code: "de-DE", label: "German (Germany)" },
  { code: "ja-JP", label: "Japanese (Japan)" },
  { code: "zh-CN", label: "Chinese (Simplified)" },
  { code: "pt-BR", label: "Portuguese (Brazil)" },
];

interface LocalizationFormData {
  title?: string;
  description?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  isComplete?: boolean;
}

interface TourLocalizationFormData extends LocalizationFormData {
  longDescription?: string;
  highlights?: string[];
  itinerary?: any[];
  inclusions?: string[];
  exclusions?: string[];
  bestTime?: string;
  cancellationPolicy?: string;
  paymentPolicy?: string;
  importantNotes?: string;
  faqs?: any[];
  headingH1?: string;
  headingH2?: string;
  headingH3?: string;
  amenities?: string[];
  transport?: any[];
}

export function AdminLocalizationManager() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("tours");
  const [selectedLocale, setSelectedLocale] = useState("en-IN");
  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);
  const [formData, setFormData] = useState<TourLocalizationFormData>({});
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Tour localizations queries
  const { data: tourLocalizations } = trpc.localization.listTourLocalizations.useQuery(
    { tourId: selectedContentId || 0 },
    { enabled: !!selectedContentId && activeTab === "tours" }
  );

  const { data: currentTourLocalization } = trpc.localization.getTourLocalization.useQuery(
    { tourId: selectedContentId || 0, locale: selectedLocale },
    { enabled: !!selectedContentId && activeTab === "tours" }
  );

  // State localizations queries
  const { data: stateLocalizations } = trpc.localization.listStateLocalizations.useQuery(
    { stateId: selectedContentId || 0 },
    { enabled: !!selectedContentId && activeTab === "states" }
  );

  const { data: currentStateLocalization } = trpc.localization.getStateLocalization.useQuery(
    { stateId: selectedContentId || 0, locale: selectedLocale },
    { enabled: !!selectedContentId && activeTab === "states" }
  );

  // Category localizations queries
  const { data: categoryLocalizations } = trpc.localization.listCategoryLocalizations.useQuery(
    { categoryId: selectedContentId || 0 },
    { enabled: !!selectedContentId && activeTab === "categories" }
  );

  const { data: currentCategoryLocalization } = trpc.localization.getCategoryLocalization.useQuery(
    { categoryId: selectedContentId || 0, locale: selectedLocale },
    { enabled: !!selectedContentId && activeTab === "categories" }
  );

  // Mutations
  const createTourLocalizationMutation = trpc.localization.createTourLocalization.useMutation();
  const updateTourLocalizationMutation = trpc.localization.updateTourLocalization.useMutation();
  const createStateLocalizationMutation = trpc.localization.createStateLocalization.useMutation();
  const updateStateLocalizationMutation = trpc.localization.updateStateLocalization.useMutation();
  const createCategoryLocalizationMutation = trpc.localization.createCategoryLocalization.useMutation();
  const updateCategoryLocalizationMutation = trpc.localization.updateCategoryLocalization.useMutation();

  if (!user?.role || user.role !== "admin") {
    return (
      <div className="p-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>You do not have permission to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleLoadLocalization = () => {
    if (activeTab === "tours" && currentTourLocalization) {
      setFormData(currentTourLocalization);
      setIsEditing(true);
    } else if (activeTab === "states" && currentStateLocalization) {
      setFormData(currentStateLocalization);
      setIsEditing(true);
    } else if (activeTab === "categories" && currentCategoryLocalization) {
      setFormData(currentCategoryLocalization);
      setIsEditing(true);
    } else {
      setFormData({});
      setIsEditing(false);
    }
  };

  const handleSaveLocalization = async () => {
    if (!selectedContentId) {
      setMessage({ type: "error", text: "Please select a content item" });
      return;
    }

    try {
      if (activeTab === "tours") {
        if (isEditing && currentTourLocalization) {
          await updateTourLocalizationMutation.mutateAsync({
            tourId: selectedContentId,
            locale: selectedLocale,
            ...formData,
          });
        } else {
          await createTourLocalizationMutation.mutateAsync({
            tourId: selectedContentId,
            locale: selectedLocale,
            ...formData,
          });
        }
      } else if (activeTab === "states") {
        if (isEditing && currentStateLocalization) {
          await updateStateLocalizationMutation.mutateAsync({
            stateId: selectedContentId,
            locale: selectedLocale,
            ...formData,
          });
        } else {
          await createStateLocalizationMutation.mutateAsync({
            stateId: selectedContentId,
            locale: selectedLocale,
            ...formData,
          });
        }
      } else if (activeTab === "categories") {
        if (isEditing && currentCategoryLocalization) {
          await updateCategoryLocalizationMutation.mutateAsync({
            categoryId: selectedContentId,
            locale: selectedLocale,
            ...formData,
          });
        } else {
          await createCategoryLocalizationMutation.mutateAsync({
            categoryId: selectedContentId,
            locale: selectedLocale,
            ...formData,
          });
        }
      }

      setMessage({ type: "success", text: "Localization saved successfully!" });
      setFormData({});
      setIsEditing(false);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to save localization",
      });
    }
  };

  const renderLocalizationList = () => {
    const localizations =
      activeTab === "tours"
        ? tourLocalizations
        : activeTab === "states"
          ? stateLocalizations
          : categoryLocalizations;

    if (!localizations || localizations.length === 0) {
      return <p className="text-sm text-muted-foreground">No localizations found</p>;
    }

    return (
      <div className="space-y-2">
        {localizations.map((loc: any) => (
          <div
            key={loc.locale}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent"
          >
            <div className="flex items-center gap-3">
              {loc.isComplete ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <Clock className="h-4 w-4 text-yellow-600" />
              )}
              <div>
                <p className="font-medium">
                  {SUPPORTED_LOCALES.find((l) => l.code === loc.locale)?.label || loc.locale}
                </p>
                <p className="text-xs text-muted-foreground">
                  {loc.isComplete ? "Complete" : "Incomplete"}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedLocale(loc.locale);
                handleLoadLocalization();
              }}
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Content Localization Manager</h1>
        <p className="text-muted-foreground">Manage locale-specific content for tours, states, and categories</p>
      </div>

      {message && (
        <Alert variant={message.type === "error" ? "destructive" : "default"}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{message.text}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tours">Tours</TabsTrigger>
          <TabsTrigger value="states">States</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="tours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tour Localizations</CardTitle>
              <CardDescription>Manage locale-specific tour content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tour ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter tour ID"
                    value={selectedContentId || ""}
                    onChange={(e) => setSelectedContentId(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label>Locale</Label>
                  <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LOCALES.map((locale) => (
                        <SelectItem key={locale.code} value={locale.code}>
                          {locale.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedContentId && (
                <>
                  <Button onClick={handleLoadLocalization} variant="outline" className="w-full">
                    Load Localization
                  </Button>

                  {renderLocalizationList()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="states" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>State Localizations</CardTitle>
              <CardDescription>Manage locale-specific state content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>State ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter state ID"
                    value={selectedContentId || ""}
                    onChange={(e) => setSelectedContentId(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label>Locale</Label>
                  <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LOCALES.map((locale) => (
                        <SelectItem key={locale.code} value={locale.code}>
                          {locale.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedContentId && (
                <>
                  <Button onClick={handleLoadLocalization} variant="outline" className="w-full">
                    Load Localization
                  </Button>

                  {renderLocalizationList()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Localizations</CardTitle>
              <CardDescription>Manage locale-specific category content</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter category ID"
                    value={selectedContentId || ""}
                    onChange={(e) => setSelectedContentId(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </div>
                <div>
                  <Label>Locale</Label>
                  <Select value={selectedLocale} onValueChange={setSelectedLocale}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LOCALES.map((locale) => (
                        <SelectItem key={locale.code} value={locale.code}>
                          {locale.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedContentId && (
                <>
                  <Button onClick={handleLoadLocalization} variant="outline" className="w-full">
                    Load Localization
                  </Button>

                  {renderLocalizationList()}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isEditing && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Localization</CardTitle>
            <CardDescription>
              {activeTab === "tours" && "Edit tour localization"}
              {activeTab === "states" && "Edit state localization"}
              {activeTab === "categories" && "Edit category localization"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input
                value={formData.title || ""}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Localized title"
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description || ""}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Localized description"
                rows={3}
              />
            </div>

            <div>
              <Label>Meta Title (SEO)</Label>
              <Input
                value={formData.metaTitle || ""}
                onChange={(e) => setFormData({ ...formData, metaTitle: e.target.value })}
                placeholder="SEO meta title (max 160 chars)"
                maxLength={160}
              />
            </div>

            <div>
              <Label>Meta Description (SEO)</Label>
              <Input
                value={formData.metaDescription || ""}
                onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
                placeholder="SEO meta description (max 160 chars)"
                maxLength={160}
              />
            </div>

            <div>
              <Label>Meta Keywords (SEO)</Label>
              <Textarea
                value={formData.metaKeywords || ""}
                onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
                placeholder="Comma-separated keywords"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveLocalization} className="flex-1">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Save Localization
              </Button>
              <Button
                onClick={() => {
                  setFormData({});
                  setIsEditing(false);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
