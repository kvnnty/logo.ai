"use client";

// Re-export sonner toast functions for backward compatibility
import { toast as sonnerToast } from "sonner";
import type { ReactNode } from "react";

// Map old toast API to sonner API
export function toast({
  title,
  description,
  variant = "default",
  ...props
}: {
  title?: ReactNode;
  description?: ReactNode;
  variant?: "default" | "destructive" | "success" | "info";
  [key: string]: any;
}) {
  const message = title || description || "";
  const toastOptions = {
    description: title && description ? description : undefined,
    ...props,
  };

  switch (variant) {
    case "destructive":
      return sonnerToast.error(message, toastOptions);
    case "success":
      return sonnerToast.success(message, toastOptions);
    case "info":
      return sonnerToast.info(message, toastOptions);
    default:
      return sonnerToast(message, toastOptions);
  }
}

// Export sonner toast directly for direct usage
export { sonnerToast };

// For backward compatibility with useToast hook
export function useToast() {
  return {
    toast,
  };
}
