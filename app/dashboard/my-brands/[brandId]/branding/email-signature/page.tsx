"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { checkHistory } from "@/app/actions/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";

export default function EmailSignaturePage() {
  const [brandData, setBrandData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function fetchBrandData() {
      try {
        const history = await checkHistory();
        if (history && history.length > 0) {
          setBrandData(history[0]);
        }
      } catch (error) {
        console.error("Failed to fetch brand data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchBrandData();
  }, []);

  const primaryColor = brandData?.primary_color || "#2563EB";
  const logoUrl = brandData?.image_url;

  const handleCopy = () => {
    setCopied(true);
    toast({ title: "Copied to clipboard", description: "You can now paste it into your email settings." });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <PageHeader
        heading="Email Signatures"
        description="Professional email signatures to boost your brand visibility."
      />

      {loading ? (
        <Skeleton className="w-full h-64 rounded-xl" />
      ) : (
        <div className="grid md:grid-cols-2 gap-8">
          {/* Preview Area */}
          <Card className="md:col-span-2">
            <CardContent className="p-12 flex items-center justify-center bg-gray-50 min-h-[300px]">
              <div className="bg-white p-8 rounded-lg shadow-sm w-full max-w-2xl border">
                <table cellPadding="0" cellSpacing="0" style={{ fontFamily: 'Arial, sans-serif' }}>
                  <tbody>
                    <tr>
                      <td style={{ paddingRight: '24px', verticalAlign: 'top' }}>
                        {logoUrl ? (
                          <img src={logoUrl} alt="Logo" style={{ width: '80px', height: '80px', objectFit: 'contain', borderRadius: '4px' }} />
                        ) : (
                          <div style={{ width: '80px', height: '80px', backgroundColor: '#eee', borderRadius: '4px' }} />
                        )}
                      </td>
                      <td style={{ borderLeft: `2px solid ${primaryColor}`, paddingLeft: '24px' }}>
                        <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#111', marginBottom: '4px' }}>John Doe</div>
                        <div style={{ fontSize: '14px', color: primaryColor, marginBottom: '12px', fontWeight: 'bold' }}>Founder & CEO</div>

                        <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.5' }}>
                          <div><strong style={{ color: '#111' }}>E:</strong> john@example.com</div>
                          <div><strong style={{ color: '#111' }}>P:</strong> +1 (555) 123-4567</div>
                          <div><strong style={{ color: '#111' }}>W:</strong> www.example.com</div>
                        </div>

                        <div style={{ marginTop: '16px', fontSize: '11px', color: '#888' }}>
                          123 Innovation Dr, Tech City, CA 94000
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="md:col-span-2 flex justify-end">
            <Button onClick={handleCopy} className="w-full md:w-auto">
              {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copied ? "Copied!" : "Copy Signature"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
