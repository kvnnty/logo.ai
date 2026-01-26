"use client";

import BrandGeneratorWizard from "@/components/dashboard/generate/brand-generator-wizard";
import Logo from "@/components/shared/Logo";
import { useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { redirect } from "next/navigation";

export default function BrandsCreatePage() {
  const { isSignedIn, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return redirect("/");
  }

  return (
    <div className="py-8 px-4 sm:px-6 w-full max-w-7xl mx-auto">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <BrandGeneratorWizard />
    </div>
  );
}
