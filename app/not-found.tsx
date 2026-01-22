"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-primary/20 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.5, 1],
            rotate: [0, -45, 0],
            opacity: [0.05, 0.1, 0.05],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] -right-[5%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center space-y-12">
        {/* Animated 404 Number */}
        <div className="relative inline-block">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-[12rem] sm:text-[16rem] font-black leading-none tracking-tighter select-none bg-gradient-to-b from-primary via-primary/80 to-transparent bg-clip-text text-transparent opacity-20"
          >
            404
          </motion.h1>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="relative">
              <Sparkles className="w-24 h-24 text-primary animate-pulse" />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-2 border-dashed border-primary/30 rounded-full -m-4"
              />
            </div>
          </motion.div>
        </div>

        {/* Text Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h2 className="text-4xl sm:text-5xl font-bold tracking-tight">
              Oops! You've drifted off course.
            </h2>
            <p className="text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
              We couldn't find the page you're looking for. It might have been moved, deleted, or never existed in the first place.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
            <Button
              asChild
              size="lg"
            >
              <Link href="/">
                <Home className="h-5 w-5" />
                Back to Home
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-5 w-5" />
              Go Back
            </Button>
          </div>
        </motion.div>

        {/* Bottom Decorative Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="flex items-center justify-center gap-2 text-muted-foreground/50 pt-12"
        >
          <Search className="w-4 h-4" />
          <span className="text-sm font-medium tracking-wide uppercase">Page Not Found</span>
        </motion.div>
      </div >

      {/* Floating Animated Icons */}
      < motion.div
        animate={{
          y: [-10, 10, -10],
          x: [-5, 5, -5],
        }
        }
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[15%] hidden lg:block opacity-20"
      >
        <div className="p-4 bg-primary/10 rounded-2xl rotate-12">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
      </motion.div >

      <motion.div
        animate={{
          y: [10, -10, 10],
          x: [5, -5, 5],
        }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-[10%] hidden lg:block opacity-20"
      >
        <div className="p-4 bg-purple-500/10 rounded-2xl -rotate-12">
          <Search className="w-8 h-8 text-purple-500" />
        </div>
      </motion.div>
    </div >
  );
}
