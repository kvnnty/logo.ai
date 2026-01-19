"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { useBrand } from "@/components/providers/brand-provider";
import { updateBrandDetails } from "@/app/actions/actions";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function AboutBrandPage() {
  const brand = useBrand();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: brand.name || "",
    description: brand.description || "",
    industry: brand.industry || "",
    contactInfo: {
      website: brand.contactInfo?.website || "",
      email: brand.contactInfo?.email || "",
      phone: brand.contactInfo?.phone || "",
      address: brand.contactInfo?.address || "",
      mobile: brand.contactInfo?.mobile || "",
      facebook: brand.contactInfo?.facebook || "",
      instagram: brand.contactInfo?.instagram || "",
      twitter: brand.contactInfo?.twitter || "",
    }
  });

  // Update form data if brand changes
  useEffect(() => {
    setFormData({
      name: brand.name || "",
      description: brand.description || "",
      industry: brand.industry || "",
      contactInfo: {
        website: brand.contactInfo?.website || "",
        email: brand.contactInfo?.email || "",
        phone: brand.contactInfo?.phone || "",
        address: brand.contactInfo?.address || "",
        mobile: brand.contactInfo?.mobile || "",
        facebook: brand.contactInfo?.facebook || "",
        instagram: brand.contactInfo?.instagram || "",
        twitter: brand.contactInfo?.twitter || "",
      }
    });
  }, [brand]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateBrandDetails(brand._id, {
        industry: formData.industry,
        contactInfo: formData.contactInfo
      });

      if (result.success) {
        setIsEditing(false);
        toast({
          title: "Changes saved",
          description: "Your brand information has been updated successfully.",
        });
        router.refresh();
      } else {
        throw new Error(result.error);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update brand details.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContactInfo = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      contactInfo: {
        ...prev.contactInfo,
        [field]: value,
      },
    }));
  };

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <PageHeader
        heading="About Your Brand"
        description="Manage your brand's core identity and details."
      >
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Details</Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(false)} disabled={isSaving}>Cancel</Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </PageHeader>

      <div className="grid gap-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="general">General Info</TabsTrigger>
            <TabsTrigger value="voice">Brand Voice</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="mt-6">
            <Card className="rounded-2xl shadow-sm border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle>General Information</CardTitle>
                <CardDescription>
                  Basic details about your business that will appear on assets.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brandName">Brand Name</Label>
                    <Input
                      id="brandName"
                      value={formData.name}
                      disabled={true}
                      className="bg-muted/30 border-none rounded-xl"
                    />
                    <p className="text-[10px] text-muted-foreground pl-1">Name can be changed via "Edit Brand Details" on dashboard.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select disabled={!isEditing} value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger className="bg-muted/30 border-none rounded-xl h-10">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="media">Media & Communications</SelectItem>
                        <SelectItem value="finance">Finance & Insurance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="retail">Retail & E-commerce</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="travel">Travel & Tourism</SelectItem>
                        <SelectItem value="real_estate">Real Estate</SelectItem>
                        <SelectItem value="entertainment">Entertainment</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Brand Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    disabled={true}
                    className="min-h-[120px] bg-muted/30 border-none rounded-xl resize-none"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6 rounded-2xl shadow-sm border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle>Contact Details</CardTitle>
                <CardDescription>
                  Used for business cards, letterheads, and email signatures.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.contactInfo.website}
                      onChange={(e) => updateContactInfo("website", e.target.value)}
                      disabled={!isEditing}
                      placeholder="www.example.com"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={formData.contactInfo.email}
                      onChange={(e) => updateContactInfo("email", e.target.value)}
                      disabled={!isEditing}
                      type="email"
                      placeholder="hello@example.com"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.contactInfo.phone}
                      onChange={(e) => updateContactInfo("phone", e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 234 567 890"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="mobile">Mobile Number</Label>
                    <Input
                      id="mobile"
                      value={formData.contactInfo.mobile}
                      onChange={(e) => updateContactInfo("mobile", e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 987 654 321"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.contactInfo.address}
                      onChange={(e) => updateContactInfo("address", e.target.value)}
                      disabled={!isEditing}
                      placeholder="Street address, City, Country"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="facebook">Facebook</Label>
                    <Input
                      id="facebook"
                      value={formData.contactInfo.facebook}
                      onChange={(e) => updateContactInfo("facebook", e.target.value)}
                      disabled={!isEditing}
                      placeholder="facebook.com/brand"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={formData.contactInfo.instagram}
                      onChange={(e) => updateContactInfo("instagram", e.target.value)}
                      disabled={!isEditing}
                      placeholder="@yourbrand"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="twitter">X (Twitter)</Label>
                    <Input
                      id="twitter"
                      value={formData.contactInfo.twitter}
                      onChange={(e) => updateContactInfo("twitter", e.target.value)}
                      disabled={!isEditing}
                      placeholder="@yourbrand"
                      className="bg-muted/30 border-none rounded-xl"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="mt-6">
            <Card className="rounded-2xl shadow-sm border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
              <CardHeader>
                <CardTitle>Brand Voice & Personality</CardTitle>
                <CardDescription>
                  Define how your brand communicates to ensure consistency across AI-generated content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed rounded-3xl bg-muted/10 border-muted/50">
                  <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-bold">AI Brand Voice analysis</h3>
                  <p className="text-muted-foreground max-w-xs mx-auto mt-1">
                    This feature is coming soon to help you maintain a consistent tone of voice across all your marketing channels.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
