"use client";

import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "../ui/card";
import { ImageIcon, ArrowRight } from "lucide-react";

const items = [
  {
    title: "Social Stories",
    count: "+100",
    description: "Customizable story templates",
    image: "/feature-1.webp",
  },
  {
    title: "Social Posts",
    count: "+100",
    description: "Ready-to-post designs",
    image: "/feature-2.webp",
  },
  {
    title: "Business Cards",
    count: "+50",
    description: "Professional business cards",
    image: "/feature-3.webp",
  },
  {
    title: "Letterheads",
    count: "+50",
    description: "Letterheads (Microsoft word)",
    image: "/feature-4.webp",
  },
  {
    title: "YouTube Thumbnails",
    count: "+50",
    description: "Eye-catching thumbnails",
    image: "/feature-1.webp",
  },
  {
    title: "Marketing Ads",
    count: "+50",
    description: "High-conversion ads",
    image: "/feature-2.webp",
  },
];

export default function BrandKitShowcase() {
  return (
    <section className="py-20 bg-transparent">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-12 text-center lg:text-left">
          <h2 className="text-2xl font-bold tracking-tight mb-2">Your Brand Kit</h2>
          <p className="text-muted-foreground text-sm max-w-sm">
            Everything you need to build a consistent brand identity across all platforms.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="overflow-hidden border shadow-none hover:border-primary/50 transition-all group bg-white rounded-2xl">
                <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-bold text-primary shadow-sm hover:scale-110 transition-transform">
                    {item.count}
                  </div>
                </div>
                <CardContent className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-bold text-sm tracking-tight">{item.title}</h3>
                    <ArrowRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
