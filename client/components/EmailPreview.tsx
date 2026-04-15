import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Download, Eye, Code } from "lucide-react";
import { toast } from "sonner";

interface EmailPreviewProps {
  subject: string;
  html: string;
  text: string;
  type: string;
  scenario?: string;
}

/**
 * Email Preview Component
 * Displays email templates in desktop and mobile preview modes
 */
export const EmailPreview: React.FC<EmailPreviewProps> = ({
  subject,
  html,
  text,
  type,
  scenario,
}) => {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile" | "html" | "text">("desktop");
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy");
    }
  };

  const downloadEmail = (filename: string) => {
    const element = document.createElement("a");
    element.setAttribute("href", `data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Email downloaded!");
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      enquiry_assigned: "bg-blue-100 text-blue-800",
      enquiry_updated: "bg-amber-100 text-amber-800",
      enquiry_completed: "bg-green-100 text-green-800",
      team_message: "bg-purple-100 text-purple-800",
      system_alert: "bg-red-100 text-red-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Email Preview</h3>
          <div className="flex items-center gap-2">
            <Badge className={getTypeColor(type)}>{type.replace(/_/g, " ")}</Badge>
            {scenario && <Badge variant="outline">{scenario}</Badge>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(html)}
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            Copy HTML
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => downloadEmail(`email-${type}.html`)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>

      {/* Subject Line */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Subject Line</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-700">{subject}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(subject)}
              className="gap-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview Tabs */}
      <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as any)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="desktop" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Desktop</span>
          </TabsTrigger>
          <TabsTrigger value="mobile" className="gap-2">
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Mobile</span>
          </TabsTrigger>
          <TabsTrigger value="html" className="gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">HTML</span>
          </TabsTrigger>
          <TabsTrigger value="text" className="gap-2">
            <Code className="h-4 w-4" />
            <span className="hidden sm:inline">Text</span>
          </TabsTrigger>
        </TabsList>

        {/* Desktop Preview */}
        <TabsContent value="desktop" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="bg-gray-100 p-8">
                <div className="mx-auto max-w-2xl bg-white shadow-lg">
                  <iframe
                    srcDoc={html}
                    title="Email Preview - Desktop"
                    className="h-96 w-full border-0"
                    sandbox={{ allow: ["same-origin"] }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mobile Preview */}
        <TabsContent value="mobile" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="bg-gray-100 p-8">
                <div className="mx-auto max-w-sm bg-white shadow-lg">
                  <iframe
                    srcDoc={html}
                    title="Email Preview - Mobile"
                    className="h-96 w-full border-0"
                    sandbox={{ allow: ["same-origin"] }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* HTML View */}
        <TabsContent value="html" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <pre className="max-h-96 overflow-auto rounded bg-gray-900 p-4 text-xs text-gray-100">
                  <code>{html}</code>
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(html)}
                  className="absolute right-2 top-2 gap-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Text View */}
        <TabsContent value="text" className="mt-4">
          <Card>
            <CardContent className="p-4">
              <div className="relative">
                <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-xs text-gray-900 whitespace-pre-wrap">
                  {text}
                </pre>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(text)}
                  className="absolute right-2 top-2 gap-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{html.length}</p>
              <p className="text-xs text-gray-600">HTML Characters</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{text.length}</p>
              <p className="text-xs text-gray-600">Text Characters</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{subject.length}</p>
              <p className="text-xs text-gray-600">Subject Length</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EmailPreview;
