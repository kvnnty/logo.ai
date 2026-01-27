"use client";

import { deleteBrand, getUserBrands } from "@/app/actions/actions";
import Logo from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { ArrowRight, Loader2, Plus, Sparkles, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";

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

  async function fetchBrands() {
    setLoading(true);
    const result = await getUserBrands();
    if (result.success) {
      setBrands(result.brands);
    }
    setLoading(false);
  }

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleDelete = async (e: React.MouseEvent, brandId: string, brandName: string) => {
    e.stopPropagation();
    if (window.confirm(`Are you sure you want to delete "${brandName}"? This will remove all associated assets and cannot be undone.`)) {
      try {
        const result = await deleteBrand(brandId);
        if (result.success) {
          fetchBrands();
        } else {
          alert(result.error || "Failed to delete brand");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("An unexpected error occurred");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-5 pb-5 border-b border-border/40">
        <Logo />
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">My Brands</h1>
          <p className="text-muted-foreground mt-3">
            Select a brand to manage, or create a new one.
          </p>
        </div>
        <Link href="/dashboard/my-brands/create">
          <Button>
            <Plus className="h-4 w-4" />
            Create New Brand
          </Button>
        </Link>
      </div>

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
            <Link href="/dashboard/my-brands/create">
              <Button>
                <Plus className="h-5 w-5" />
                Create Your First Brand
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {brands.map((brand, index) => (
            <motion.div
              key={brand._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="group cursor-pointer h-full flex flex-col hover:border-border transition-colors"
                onClick={() => router.push(`/dashboard/my-brands/${brand._id}`)}
              >
                <CardHeader className="p-0">
                  <div className="relative w-full h-48 bg-muted/30 overflow-hidden">
                    {brand.primaryLogoUrl ? (
                      <div className="absolute inset-0 p-6 flex items-center justify-center bg-white">
                        <img
                          src={brand.primaryLogoUrl}
                          alt={brand.name}
                          className="max-w-full max-h-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Sparkles className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={(e) => handleDelete(e, brand._id, brand.name)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-0 flex-1 flex flex-col">
                  <div className="flex-1 min-w-0 space-y-2 mb-5">
                    <CardTitle className="text-base font-medium mb-1 truncate">
                      {brand.name}
                    </CardTitle>
                    {brand.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {brand.description}
                      </p>
                    )}
                  </div>
                  <div className="mt-auto pt-5 border-t">
                    <div className="flex items-center justify-end">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(brand.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: brands.length * 0.05 }}
          >
            <Link href="/dashboard/my-brands/create" className="block h-full">
              <Card className="border-2 border-dashed cursor-pointer h-full flex flex-col hover:border-border transition-colors">
                <CardHeader className="p-0 flex-1 flex flex-col justify-center">
                  <div className="w-full h-48 flex flex-col items-center justify-center p-6">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-3">
                      <Plus className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Create New Brand
                    </p>
                  </div>
                </CardHeader>

                <CardContent className="px-5 py-0">
                  <div className="pt-3 border-t">
                    <div className="flex items-center justify-center">
                      <span className="text-xs text-muted-foreground">
                        Start building your brand
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      )}
    </div>
  );
}
