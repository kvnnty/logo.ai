"use client";
import { SignedIn, UserButton } from "@clerk/nextjs";
import { SignInButton } from "@clerk/nextjs";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { LoaderIcon } from "lucide-react";
import StarBorder from "../ui/StarBorder";

export default function Navbar() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  return (
    <header className="fixed max-w-6xl mx-auto px-4 top-0 left-0 right-0 z-50">
      <StarBorder
        as="nav"
        className="mt-4"
        color="hsl(var(--primary))"
        speed="5s"
        thickness={2}
        style={{ width: '100%' }}
      >
        <div className="flex justify-between items-center py-2 px-5 text-sm backdrop-blur-md bg-background/50">
          <Link href="/" className="font-semibold">
            LogoAIpro
          </Link>
          <div className="hidden md:flex items-center font-semibold space-x-8 flex-1 justify-center">
            <Link href="/#features">Features</Link>
            <Link href="/#faq">FAQs</Link>
            <Link href="/gallery">Gallery</Link>
            
          </div>
          <div className="flex items-center justify-end space-x-4">
            {!isMounted && (
              <Button>
                <LoaderIcon className="animate-spin" />
              </Button>
            )}
            <SignedOut>
              <SignInButton
                signUpForceRedirectUrl="/dashboard"
                forceRedirectUrl="/dashboard"
                mode="modal"
              >
                <Button className="text-sm">Sign In</Button>
              </SignInButton>
            </SignedOut>
            <SignedIn>
              <UserButton />
              {/* <Link href="/generate">
                <Button className="text-white">
                  Get Started
                </Button> 
              </Link> */}
            </SignedIn>
          </div>
        </div>
      </StarBorder>
    </header>
  );
}
