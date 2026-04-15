import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Copy, Check, Share2, Link as LinkIcon } from "lucide-react";

interface ShareUrlButtonProps {
  url: string;
  title?: string;
  description?: string;
}

/**
 * Share URL Button Component
 * Allows users to copy and share dashboard URLs with pre-configured date ranges
 */
export function ShareUrlButton({
  url,
  title = "Share Dashboard",
  description = "Share this link to show others the same date range and metrics",
}: ShareUrlButtonProps) {
  const [copied, setCopied] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareVia = (platform: "twitter" | "email" | "linkedin") => {
    const encodedUrl = encodeURIComponent(url);
    const text = encodeURIComponent("Check out this email engagement analytics dashboard:");

    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`,
      email: `mailto:?subject=Email Engagement Analytics&body=${text}%0A${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    };

    window.open(urls[platform], "_blank", "width=600,height=400");
  };

  return (
    <>
      {/* Share Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>

      {/* Share Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LinkIcon className="w-5 h-5" />
                {title}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* URL Display */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dashboard URL</label>
                <div className="flex gap-2">
                  <Input
                    value={url}
                    readOnly
                    className="text-sm"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyUrl}
                    className="gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Share Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Share via</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareVia("twitter")}
                    className="text-xs"
                  >
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareVia("email")}
                    className="text-xs"
                  >
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShareVia("linkedin")}
                    className="text-xs"
                  >
                    LinkedIn
                  </Button>
                </div>
              </div>

              {/* URL Info */}
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-xs text-blue-900">
                  <strong>Tip:</strong> This URL includes your current date range. Anyone who opens this link will see the same metrics and filters.
                </p>
              </div>

              {/* Close Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}

/**
 * Inline Share URL Component
 * Displays URL inline without modal
 */
export function ShareUrlInline({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
      <LinkIcon className="w-4 h-4 text-slate-600 flex-shrink-0" />
      <input
        type="text"
        value={url}
        readOnly
        className="flex-1 bg-transparent text-sm text-slate-600 outline-none"
      />
      <Button
        size="sm"
        variant="ghost"
        onClick={handleCopy}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Copied
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy
          </>
        )}
      </Button>
    </div>
  );
}
