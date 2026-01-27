"use client";

import { PageHeader } from "@/components/dashboard/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, CreditCard, Sparkles, Zap, ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { getCredits, createStripeCheckoutSession } from "@/app/actions/actions";
import { useToast } from "@/hooks/use-toast";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import Logo from "@/components/shared/Logo";

export default function CreditsPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    async function fetchCredits() {
      try {
        const data = await getCredits();
        if (data) {
          setCredits(data.remaining);
        }
      } catch (error) {
        console.error("Failed to fetch credits", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCredits();

    if (searchParams.get("success")) {
      toast({
        title: "Payment Successful",
        description: "Your credits have been added to your account.",
        variant: "success",
      });
      // Refetch credits to ensure UI is up to date
      fetchCredits();
    }

    if (searchParams.get("canceled")) {
      toast({
        title: "Payment Canceled",
        description: "You have not been charged.",
        variant: "info",
      });
    }
  }, [searchParams, toast]);

  const handlePurchase = async (planId: string) => {
    try {
      const result = await createStripeCheckoutSession(planId);
      if (result.success && result.url) {
        window.location.href = result.url;
      } else {
        throw new Error(result.error || "Failed to start checkout");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  const plans = [
    {
      id: "basic",
      name: "Starter",
      credits: 50,
      price: "$19",
      description: "Perfect for testing the waters",
      features: ["50 AI Generations", "High Resolution Downloads", "Basic Support"],
      icon: Zap
    },
    {
      id: "pro",
      name: "Professional",
      credits: 150,
      price: "$49",
      description: "For serious brand building",
      popular: true,
      features: ["150 AI Generations", "All File Formats (SVG, PNG, JPG)", "Priority Support", "Commercial License"],
      icon: Sparkles
    },
    {
      id: "enterprise",
      name: "Agency",
      credits: 500,
      price: "$99",
      description: "Best value for high volume",
      features: ["500 AI Generations", "White Label Options", "Dedicated Support", "Commercial License", "API Access"],
      icon: CreditCard
    }
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-5 pb-5 border-b border-border/40">
        <Logo />
      </div>
      <PageHeader
        heading="Credits & Plans"
        description="Purchase credits to generate more brand assets."
      >
        <Button
          asChild
          className="flex items-center gap-2"
        >
          <Link href="/dashboard/my-brands">
            <ArrowLeft className="w-4 h-4" />
            Go back to dashboard
          </Link>
        </Button>
      </PageHeader>

      {/* Current Balance */}
      <Card className="mb-12 bg-primary/5 border-primary/20 shadow-none">
        <CardContent className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-medium text-muted-foreground text-sm">Current Balance</h3>
            {loading ? (
              <Skeleton className="h-10 w-20" />
            ) : (
              <div className="text-2xl font-bold text-primary">{credits} Credits</div>
            )}
          </div>
          <Sparkles className="w-12 h-12 text-primary/40" />
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const Icon = plan.icon;
          return (
            <Card key={plan.id} className={`relative flex flex-col ${plan.popular ? 'border-primary shadow-lg scale-105 z-10' : 'hover:border-primary/50 transition-colors'}`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 text-primary">
                  <Icon className="w-6 h-6" />
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground"> / {plan.credits} credits</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check className="w-4 h-4 text-primary" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  size="lg"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePurchase(plan.id)}
                >
                  Get Started
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
