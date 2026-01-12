"use client";

import { Card, CardContent } from "@/components/ui/card";
import { checkHistory } from "../actions/actions";
import { useEffect, useState } from "react";
import { SelectLogo } from "@/db/schema";
import LogoCard from "@/components/logo-card";
import SkeletonCard from "@/components/skeleton-card";
import { Download, Plus, Wand2 } from "lucide-react";
import { downloadImage } from "../actions/actions";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  IconPalette,
  IconClock,
  IconCalendarMonth,
} from "@tabler/icons-react";

export default function DashboardPage() {
  const { toast } = useToast();
  const [logos, setLogos] = useState<SelectLogo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const fetchLogos = async () => {
      const history = await checkHistory();
      if (history) {
        setLogos(history);
      }
      setIsLoading(false);
    };
    fetchLogos();
  }, []);

  // Calculate analytics
  const totalDesigns = logos.length;
  const thisWeekDesigns = logos.filter(logo => {
    const logoDate = new Date(logo.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return logoDate >= weekAgo;
  }).length;

  const thisMonthDesigns = logos.filter(logo => {
    const logoDate = new Date(logo.createdAt);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    return logoDate >= monthAgo;
  }).length;

  const handleDownload = async (imageUrl: string) => {
    setIsDownloading(true);
    try {
      const result = await downloadImage(imageUrl);
      if (result.success && result.data) {
        const a = document.createElement("a");
        a.href = result.data;
        a.download = `logo.webp`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({
          title: "Download started",
          description: "Your logo is being downloaded",
        });
      } else {
        throw new Error("Failed to download logo");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, bgClass, borderClass }: any) => (
    <Card className={`border transition-all duration-300 group shadow-none py-0 ${borderClass}`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${bgClass} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-5 h-5 ${colorClass}`} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            Dashboard
          </h1>
          <p className="text-muted-foreground max-w-lg">
            Create, manage, and download your brand assets.
          </p>
        </div>
        <Link href="/dashboard/generate">
          <Button size="lg" className="transition-all w-full md:w-auto">
            <Plus className="w-5 h-5 mr-2" />
            Create New Brand
          </Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Brands"
          value={totalDesigns}
          icon={IconPalette}
          colorClass="text-purple-600"
          bgClass="bg-purple-100"
          borderClass="hover:border-purple-200"
        />
        <StatCard
          title="This Week"
          value={thisWeekDesigns}
          icon={IconClock}
          colorClass="text-blue-600"
          bgClass="bg-blue-100"
          borderClass="hover:border-blue-200"
        />
        <StatCard
          title="This Month"
          value={thisMonthDesigns}
          icon={IconCalendarMonth}
          colorClass="text-green-600"
          bgClass="bg-green-100"
          borderClass="hover:border-green-200"
        />
      </div>

      {/* Recent Designs */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight">Recent Designs</h2>
          <Link href="/dashboard/my-designs">
            <Button variant="ghost" className="text-sm">
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {/* Quick Create Card */}
          <Link href="/dashboard/generate" className="group h-full">
            <Card className="h-full border-2 border-dashed hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 min-h-[300px] flex items-center justify-center cursor-pointer">
              <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Wand2 className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold">Create New</h3>
                  <p className="text-sm text-muted-foreground">Start a fresh brand identity</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {isLoading ? (
            [...Array(4)].map((_, index) => <SkeletonCard key={index} />)
          ) : logos.length > 0 ? (
            logos.slice(0, 4).map((logo) => (
              <LogoCard
                key={logo.id}
                logo={logo}
                onDownload={handleDownload}
              />
            ))
          ) : null}
        </div>
      </div>
    </div>
  );
}
