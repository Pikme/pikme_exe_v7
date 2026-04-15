import { useCallback } from "react";

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

// Simple toast hook implementation
export function useToast() {
  const toast = useCallback(
    (props: {
      title?: string;
      description?: string;
      variant?: "default" | "destructive";
    }) => {
      // Simple implementation using browser notifications
      const message = props.title
        ? `${props.title}${props.description ? ": " + props.description : ""}`
        : props.description || "Notification";

      if (props.variant === "destructive") {
        console.error(message);
      } else {
        console.log(message);
      }

      // Optional: Use browser notification API
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(props.title || "Notification", {
          body: props.description || "",
        });
      }
    },
    []
  );

  return { toast };
}
