"use client";

import { useState } from "react";
import DashboardSidebar from "@/components/dashboard/sidebar";
import DashboardTopbar from "@/components/dashboard/topbar";

interface BrandDashboardWrapperProps {
  brandId: string;
  brandName: string;
  children: React.ReactNode;
}

export function BrandDashboardWrapper({ brandId, brandName, children }: BrandDashboardWrapperProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="h-screen flex-1 flex flex-col overflow-hidden">
      <DashboardSidebar
        brandId={brandId}
        brandName={brandName}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <div className="flex-1 lg:ml-72 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 flex flex-col border border-border/50 rounded-xl sm:rounded-2xl bg-card overflow-hidden">
          <DashboardTopbar onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
