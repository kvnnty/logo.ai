"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowRight, ArrowLeft, Check, Info, Globe, Mail, Phone, MapPin, Smartphone, Facebook, Instagram, Twitter } from "lucide-react";
import { updateBrandDetails } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";

interface BrandOnboardingDialogProps {
  brand: {
    _id: string;
    name: string;
  };
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  { id: 1, title: "Branding Ready" },
  { id: 2, title: "Industry" },
  { id: 3, title: "Contact Info" },
];

export function BrandOnboardingDialog({ brand, isOpen, onClose }: BrandOnboardingDialogProps) {
  const brandId = brand._id;
  const brandName = brand.name;
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    industry: "",
    contactInfo: {
      website: "",
      email: "",
      phone: "",
      address: "",
      mobile: "",
      facebook: "",
      instagram: "",
      twitter: "",
    },
  });

  const handleNext = () => {
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await updateBrandDetails(brandId, formData);
      if (result.success) {
        toast({
          title: "Brand updated",
          description: "Your brand details have been saved successfully.",
        });
        onClose();
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
      setIsSubmitting(false);
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
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-none bg-white rounded-3xl">
        <div className="relative h-1.5 bg-muted/20">
          <motion.div
            className="absolute h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${(currentStep / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        <DialogHeader className="p-6 pb-4 hidden">
          <DialogTitle className="text-2xl font-bold">{steps[currentStep - 1].title}</DialogTitle>
        </DialogHeader>

        <div className="p-8">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6 w-full"
              >
                <div className="space-y-4 text-center">
                  <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-2xl mb-2">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold tracking-tight">Your brand is ready</h2>
                  <p className="text-muted-foreground text-lg leading-relaxed">
                    Matching assets are ready to keep your brand cohesive—business cards, email signatures, social posts, menus, posters, letterheads, and more.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-8">
                  {["Business Cards", "Email Signatures", "Social Posts", "Letterheads"].map((item) => (
                    <div key={item} className="flex items-center gap-3 p-4 bg-muted/30 rounded-2xl border border-muted/50">
                      <div className="h-2 w-2 rounded-full bg-primary" />
                      <span className="font-medium text-sm">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold tracking-tight text-center">What Industry Are You In?</h2>
                  <p className="text-muted-foreground text-center">
                    Help us personalize your dashboard with industry-specific tools, templates, and recommendations.
                  </p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="industry" className="text-sm font-semibold">Business Category</Label>
                    <Select
                      value={formData.industry}
                      onValueChange={(value) => setFormData({ ...formData, industry: value })}
                    >
                      <SelectTrigger id="industry" className="h-12 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20">
                        <SelectValue placeholder="Select your industry" />
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

                  <div className="bg-primary/5 p-4 rounded-2xl border border-primary/10 flex gap-3 text-sm">
                    <Info className="h-5 w-5 text-primary shrink-0" />
                    <div className="space-y-1">
                      <p className="font-bold text-primary">Why we ask this</p>
                      <p className="text-muted-foreground leading-snug">
                        Your industry helps us recommend logo styles, colors, and design elements that resonate with your target audience.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-2 text-center">
                  <h2 className="text-2xl font-bold tracking-tight">Add Your Contact Information</h2>
                  <p className="text-muted-foreground">
                    Enter once, use everywhere. These details will automatically populate across your brand assets.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[350px] overflow-y-auto px-1 pt-2 custom-scrollbar">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Website address</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="www.example.com"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.website}
                        onChange={(e) => updateContactInfo("website", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="hello@example.com"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.email}
                        onChange={(e) => updateContactInfo("email", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Phone number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="+1 234 567 890"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.phone}
                        onChange={(e) => updateContactInfo("phone", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Mobile number</Label>
                    <div className="relative">
                      <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="+1 987 654 321"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.mobile}
                        onChange={(e) => updateContactInfo("mobile", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Street address, City, Country"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.address}
                        onChange={(e) => updateContactInfo("address", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Facebook</Label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="facebook.com/brand"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.facebook}
                        onChange={(e) => updateContactInfo("facebook", e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground pl-1">Instagram</Label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="@yourbrand"
                        className="pl-10 h-11 bg-muted/30 border-none rounded-xl focus:ring-2 focus:ring-primary/20"
                        value={formData.contactInfo.instagram}
                        onChange={(e) => updateContactInfo("instagram", e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-[11px] text-muted-foreground">
                    All fields are optional. You can update this information anytime from your settings.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center justify-between mt-8">
            <Button
              variant="ghost"
              onClick={handleBack}
              disabled={currentStep === 1 || isSubmitting}
              className="rounded-xl h-10 px-6 hover:bg-muted/50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isSubmitting}
              className="rounded-xl h-10 px-8 transition-all font-bold"
            >
              {isSubmitting ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <>
                  {currentStep === 3 ? "Complete" : "Continue"}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
