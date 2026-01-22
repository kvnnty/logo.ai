"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Download, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function LicensePage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <PageHeader
        heading="License & Copyright"
        description="Official documentation of your asset usage rights."
      >
        <Button variant="outline">
          <Download className="h-4 w-4" />
          Download Certificate
        </Button>
      </PageHeader>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Commercial License Details</CardTitle>
              <div className="text-sm text-muted-foreground">Active • Issued to Premium User</div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm leading-relaxed">
              This certificate confirms that you hold a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, display, and distribute the generated brand assets for any commercial or non-commercial purpose.
            </p>

            <div className="bg-gray-50 p-6 rounded-lg border text-sm space-y-2">
              <div className="font-semibold mb-2">You are allowed to:</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>Use the logo on websites, social media, and printed materials.</li>
                <li>Use the assets for merchandise and products for sale.</li>
                <li>Modify and adapt the designs as needed.</li>
                <li>Register the logo as a trademark (subject to local laws availability).</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border text-sm space-y-2">
              <div className="font-semibold mb-2">Limitations:</div>
              <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                <li>You may not resell the raw design files as a standalone template product.</li>
                <li>You may not claim authorship of the AI generation technology itself.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
