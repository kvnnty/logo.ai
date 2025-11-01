import React from "react";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import {
  IconRocket,
  IconSparkles,
  IconBrandDribbble,
  IconBrandLinkedin,
  IconBrandYoutube,
} from "@tabler/icons-react";
import FooterGradient from "../ui/footer-gradient";
import { SignedIn } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative border-t border-border/40 mt-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-dot-black/[0.2] z-0"></div>
      <FooterGradient />

      {/* CTA Section */}
      <div className="relative z-10 py-10 md:py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Badge
            variant="outline"
            className="w-fit px-4 py-2 rounded-full flex items-center mx-auto mb-4 gap-2 border-primary/20 hover:border-primary/40 transition-colors"
          >
            <IconSparkles className="size-4 text-primary" />
            Let&apos;s Start now
            <IconRocket className="size-4 text-primary" />
          </Badge>
          <h2 className="text-3xl md:text-5xl font-medium mb-2">
            Are you ready to explore your
            <span className="text-muted-foreground/40 text-2xl md:text-4xl">
              <br /> Creativity with{" "}
              <span className="mx-2 text-primary">
                LogoAIpro
              </span>
            </span>
            ?
          </h2>
          <div className="mt-6">
            <SignedOut>
              <SignInButton
                signUpForceRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
              >
                <Button className="group text-sm">
                  Start Generating
                  <IconSparkles className="size-4 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <Link href="/dashboard/generate">
                <Button className="group text-sm">
                  Start Generating
                  <IconSparkles className="size-4 ml-2 group-hover:scale-110 transition-transform" />
                </Button>
              </Link>
            </SignedIn>
          </div>
        </div>
      </div>

      {/* Navigation & Links Section */}
      <div className="relative z-10 border-t border-border/40 bg-background/30 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
            {/* Brand */}
            <div className="flex flex-col items-center md:items-start">
              <Link href="/" className="inline-block mb-3">
                <h3 className="text-2xl font-bold text-primary">
                  LogoAIpro
                </h3>
              </Link>
              <p className="text-sm text-muted-foreground text-center md:text-left max-w-xs">
                AI-powered logo design that transforms your ideas into stunning brand identities.
              </p>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-6 md:gap-8">
              <Link
                href="/example"
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Example
              </Link>
              <Link
                href="/#features"
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                Features
              </Link>
              <Link
                href="/#faq"
                className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
              >
                FAQs
              </Link>
            </nav>

            {/* Social Links */}
            <div className="flex gap-3">
              <Link
                href="https://dribbble.com/webbuddy"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/10 transition-all"
                aria-label="Dribbble"
              >
                <IconBrandDribbble className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link
                href="https://www.linkedin.com/company/webbuddy-agency/posts/?feedView=all"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/10 transition-all"
                aria-label="LinkedIn"
              >
                <IconBrandLinkedin className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
              <Link
                href="https://www.youtube.com/@WebBuddyAgency"
                target="_blank"
                rel="noopener noreferrer"
                className="group p-2.5 rounded-lg border border-border/40 hover:border-primary/40 hover:bg-primary/10 transition-all"
                aria-label="YouTube"
              >
                <IconBrandYoutube className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center md:text-left">
              &copy; {new Date().getFullYear()} LogoAIpro. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/60">
              Powered by AI • Built with ❤️
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
