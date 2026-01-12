"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export default function AboutBrandPage() {
  const [isEditing, setIsEditing] = useState(false);

  // Mock initial data - in a real app this would come from the DB
  const [formData, setFormData] = useState({
    brandName: "Acme Corp",
    slogan: "Innovation for tomorrow",
    description: "We are a leading technology company focused on sustainable energy solutions.",
    industry: "technology",
    website: "www.acmecorp.com",
    email: "contact@acmecorp.com"
  });

  const handleSave = () => {
    // Simulate API call
    setTimeout(() => {
      setIsEditing(false);
      toast({
        title: "Changes saved",
        description: "Your brand information has been updated successfully.",
        variant: "success",
      });
    }, 800);
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
            <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
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
            <Card>
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
                      value={formData.brandName}
                      onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                      disabled={!isEditing}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="industry">Industry</Label>
                    <Select disabled={!isEditing} value={formData.industry} onValueChange={(v) => setFormData({ ...formData, industry: v })}>
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Select industry" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="retail">Retail</SelectItem>
                        <SelectItem value="food">Food & Beverage</SelectItem>
                        <SelectItem value="fashion">Fashion</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slogan">Slogan / Tagline</Label>
                  <Input
                    id="slogan"
                    value={formData.slogan}
                    onChange={(e) => setFormData({ ...formData, slogan: e.target.value })}
                    disabled={!isEditing}
                    className="bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Brand Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={!isEditing}
                    className="min-h-[120px] bg-background"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="mt-6">
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
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      disabled={!isEditing}
                      type="url"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      disabled={!isEditing}
                      type="email"
                      className="bg-background"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="voice" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Brand Voice & Personality</CardTitle>
                <CardDescription>
                  Define how your brand communicates to ensure consistency across AI-generated content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-lg bg-muted/10">
                  <p className="text-muted-foreground">AI Brand Voice analysis is coming soon.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
