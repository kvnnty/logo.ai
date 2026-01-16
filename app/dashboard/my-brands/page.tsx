"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserBrands } from "@/app/actions/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Sparkles, RefreshCw, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BrandSummary {
  _id: string;
  name: string;
  description?: string;
  createdAt: string | Date;
  assetCount: number;
  primaryLogoUrl?: string | null;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<BrandSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchBrands() {
      const result = await getUserBrands();
      if (result.success) {
        setBrands(result.brands);
      }
      setLoading(false);
    }
    fetchBrands();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-12 px-4 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">My Brands</h1>
          <p className="text-muted-foreground mt-2">
            Select a brand to manage, or create a new one.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/my-brands/create")}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Create New Brand
        </Button>
      </div>

      {/* Brand Grid */}
      {brands.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative mx-auto w-24 h-24 flex items-center justify-center mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-orange-500/20 rounded-full blur-2xl animate-pulse" />
              <div className="relative bg-gradient-to-br from-primary/10 to-orange-500/10 rounded-full p-5">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">No brands yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first brand to get started with AI-powered brand identity generation.
            </p>
            <Button onClick={() => router.push("/dashboard/my-brands/create")} size="lg">
              <Plus className="mr-2 h-5 w-5" />
              Create Your First Brand
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer transition-all hover:border-primary/50 group"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}`)}
              >
                <CardHeader className="relative">
                  {brand.primaryLogoUrl ? (
                    <div className="w-full h-48 rounded-xl border bg-white p-2 flex items-center justify-center shadow-sm group-hover:border-primary/50 transition-colors">
                      <img
                        src={brand.primaryLogoUrl}
                        alt={brand.name}
                        className="max-w-full max-h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 rounded-xl bg-primary/5 border border-dashed flex items-center justify-center">
                      <Sparkles className="h-6 w-6 text-primary/40" />
                    </div>
                  )}
                  <div className="flex items-start justify-between mt-4">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        {brand.name}
                        <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>{brand.assetCount} assets</span>
                    <span>
                      {new Date(brand.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
