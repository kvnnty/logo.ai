"use client";

import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import LogoShowcase from "@/components/landing/logo-showcase";
import Footer from "@/components/landing/footer";
import Faq from "@/components/landing/faq";
import { artworkData } from "@/constants/data";

const Index = () => {
  // Get 12 logos (duplicate if needed for 2 rows of 6 cards each)
  const displayLogos = [
    ...artworkData,
    ...artworkData.slice(0, 5), // Add 5 more to make 12 total
  ];

  return (
    <>
      <div className="overflow-hidden">
        <div className="bg-red-400">
          <Navbar />
        </div>
        <Hero />
        
        {/* Second Row - Outside Hero Section */}
        <div className="relative w-full -mt-[60px] z-20 overflow-hidden">
          <div className="flex justify-end gap-4 w-full pr-4">
            {displayLogos.slice(6, 12).map((logo, index) => (
              <div
                key={index + 6}
                className={`w-[270px] h-[170px] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg flex-shrink-0 ${
                  index === 5 ? 'mr-[-135px]' : ''
                }`}
              >
                <img
                  src={logo.imageUrl}
                  alt={`Logo example ${index + 7}`}
                  className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>

        <main className="max-w-6xl mx-auto">
          <div className="px-4">
            <Features />
          </div>
        </main>
        <LogoShowcase />
        <main className="max-w-6xl mx-auto">
          <div className="px-4">
            <Faq />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
