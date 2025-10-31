"use client";

import React from "react";
import Link from "next/link";
import { Button } from "../ui/button";
import { IconPointerFilled, IconSparkles } from "@tabler/icons-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { domain } from "@/lib/domain";
import { cn } from "@/lib/utils";
import { ArrowRightIcon } from "@radix-ui/react-icons";
import AnimatedShinyText from "../ui/animated-shiny-text";
import { artworkData } from "@/constants/data";

export default function Hero() {
  // Get first 6 logos for first row
  const displayLogos = artworkData.slice(0, 6);
  return (
    <>
      <div className="relative overflow-hidden" style={{ backgroundColor: '#FFEEE3' }}>
        <section className="flex max-w-full mx-auto relative flex-col items-center justify-center h-full pt-24 px-4 sm:pt-36 pb-24 border-b border-border/40 z-0">
        <div
          className={cn(
            "group relative rounded-full border border-black/5 bg-neutral-100 text-sm sm:text-base max-sm:mb-2 text-white transition-all ease-in hover:cursor-pointer hover:bg-neutral-200",
          )}
        >
          <AnimatedShinyText className="inline-flex items-center justify-center px-3 py-0.5">
            <span>✨ Create professional logos in seconds</span>
            <ArrowRightIcon className="ml-1 size-2.5 transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
          </AnimatedShinyText>
        </div>
          
          <div className="text-4xl sm:text-5xl md:text-5xl lg:text-7xl font-medium text-center">
            Design your dream logo in <br />{" "}
            <span className="font-semibold bg-gradient-to-tr from-white via-primary to-white bg-clip-text text-transparent">
              seconds, not days
            </span>
          </div>

          <div className="text-base md:text-lg mt-8 font-bold w-full lg:w-[50%] text-center text-neutral-500">
            Transform your brand identity with{" "}
            <span className="text-neutral-900 font-extrabold">
              AI-powered logo design
            </span>
            . <br className="md:block hidden" />
            <span className="text-neutral-900 font-extrabold">
              No design skills needed
            </span>
            {" "}— just describe your vision and watch it come to life.
          </div>

          <div className="mt-10 flex sm:flex-row flex-col w-full md:w-auto items-center gap-4">
            <SignedIn>
              <Link href="/dashboard/generate" className="w-full md:w-auto">
                <Button className="h-8 w-full px-6 py-5 transition-all hover:opacity-90 hover:scale-105">
                  Try for free! <IconPointerFilled className="w-4 h-4" />
                </Button>
              </Link>
            </SignedIn>
            <SignedOut>
              <SignInButton
              signUpForceRedirectUrl={`${domain}/dashboard`}
              forceRedirectUrl={`${domain}/dashboard`}
                mode="modal"
              >
                <Button className="h-8 w-full px-6 py-5 transition-all hover:opacity-90 hover:scale-105">
                  Try for free! <IconPointerFilled className="w-4 h-4" />
                </Button>
              </SignInButton>
            </SignedOut>
            <Link href="/gallery" className="w-full md:w-auto">
              <Button
                variant="outline"
                className="h-8 w-full px-6 py-5 transition-all hover:shadow-[0_0_20px_2px_hsl(var(--primary))]"
              >
                See Examples{" "}
                <IconSparkles className="fill-[hsl(var(--primary))] text-primary" />
              </Button>
            </Link>
          </div>

          {/* Logo Cards Grid - First Row (6 cards) */}
          <div className="mt-16 w-full">
            <div className="grid grid-cols-6 gap-4 w-full max-w-[1920px] mx-auto px-4">
              {displayLogos.map((logo, index) => (
                <div
                  key={index}
                  className="w-[270px] h-[170px] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg justify-self-center"
                >
                  <img
                    src={logo.imageUrl}
                    alt={`Logo example ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                    loading="eager"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
