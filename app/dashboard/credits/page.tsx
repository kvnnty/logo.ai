"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getCredits } from "@/app/actions/actions";
import {
  IconCreditCard,
  IconSparkles,
  IconCheck,
  IconX,
} from "@tabler/icons-react";

export default function CreditsPage() {
  const [credits, setCredits] = useState({ remaining: 10, limit: 10 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCredits = async () => {
      const result = await getCredits();
      setCredits(result);
      setIsLoading(false);
    };
    fetchCredits();
  }, []);

  const creditPlans = [
    {
      name: "Basic",
      credits: 50,
      price: "$9.99",
      features: [
        "50 AI logo generations",
        "HD quality outputs",
        "All style options",
        "Commercial license",
      ],
      popular: false,
    },
    {
      name: "Pro",
      credits: 150,
      price: "$24.99",
      features: [
        "150 AI logo generations",
        "HD quality outputs",
        "All style options",
        "Commercial license",
        "Priority support",
      ],
      popular: true,
    },
    {
      name: "Enterprise",
      credits: 500,
      price: "$79.99",
      features: [
        "500 AI logo generations",
        "HD quality outputs",
        "All style options",
        "Commercial license",
        "Priority support",
        "Custom branding",
      ],
      popular: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">
          Credits & Plans
        </h1>
        <p className="text-muted-foreground">
          Purchase credits to create amazing logos
        </p>
      </div>

      {/* Current Credits */}
      <Card className="border border-border/50 bg-card hover:shadow-xl transition-all duration-300">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <IconSparkles className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Credits</p>
                <p className="text-2xl font-bold">
                  {credits.remaining} / {credits.limit}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {credits.remaining > 3 ? (
                <>
                  <IconCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Good</span>
                </>
              ) : credits.remaining > 0 ? (
                <>
                  <IconX className="h-5 w-5 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">Low</span>
                </>
              ) : (
                <>
                  <IconX className="h-5 w-5 text-red-600" />
                  <span className="text-sm text-red-600 font-medium">Empty</span>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Plans */}
      <div>
        <h2 className="text-xl font-bold mb-4">Choose a Plan</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {creditPlans.map((plan) => (
            <Card
              key={plan.name}
              className={plan.popular
                ? "border-primary border-2 hover:shadow-xl transition-all duration-300 relative overflow-hidden"
                : "border border-border/50 hover:shadow-xl transition-all duration-300"
              }
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary text-primary-foreground text-xs font-medium py-1 text-center">
                  Most Popular
                </div>
              )}
              <CardContent className={`p-6 ${plan.popular ? "pt-10" : ""}`}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-sm text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <IconCreditCard className="h-5 w-5 text-primary" />
                    <span className="text-lg font-semibold">
                      {plan.credits} Credits
                    </span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <IconCheck className="h-4 w-4 text-green-600" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  className={plan.popular
                    ? "w-full bg-primary hover:bg-primary/90"
                    : "w-full"
                  }
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

