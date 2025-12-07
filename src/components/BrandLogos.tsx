"use client";
import Image from "next/image";

export default function BrandLogos() {
  return (
    <section className="relative w-full py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
      <div className="container-padded mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
        {/* flex-col до 767px (мобильные), flex-row с 768px (планшеты и десктопы) */}
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-16 2xl:gap-24">
          {/* Land Rover Logo */}
          <BrandLogoCard
            brand="Land Rover"
            description="British Excellence"
          />
          
          {/* Vertical Divider - показывается только на экранах 768px+ (md и выше) */}
          <div className="hidden md:block w-px h-32 lg:h-36 xl:h-40 bg-gradient-to-b from-transparent via-[var(--accent-gold)]/30 to-transparent" />
          
          {/* Horizontal Divider - показывается только до 767px (мобильные) */}
          <div className="md:hidden w-full max-w-xs h-px bg-gradient-to-r from-transparent via-[var(--accent-gold)]/30 to-transparent" />
          
          {/* Jaguar Logo */}
          <BrandLogoCard
            brand="Jaguar"
            description="Pure Performance"
          />
        </div>
      </div>
    </section>
  );
}

interface BrandLogoCardProps {
  brand: string;
  description: string;
}

function BrandLogoCard({ brand, description }: BrandLogoCardProps) {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-md xl:max-w-lg 2xl:max-w-xl">
      {/* Main card */}
      <div className="relative h-[280px] sm:h-80 md:h-[360px] lg:h-96 xl:h-[420px] 2xl:h-[480px] rounded-2xl sm:rounded-3xl border border-zinc-200/50 dark:border-zinc-800/50 bg-white dark:bg-zinc-900 shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 lg:p-10">
          {/* Logo Container */}
          <div className="mb-4 sm:mb-6 md:mb-8 flex items-center justify-center w-full flex-shrink-0">
            {brand === "Land Rover" ? (
              <LandRoverLogo />
            ) : (
              <JaguarLogo />
            )}
          </div>
          
          {/* Accent line - элегантная полоска с градиентом */}
          <div 
            className="mb-3 sm:mb-4 mx-auto flex-shrink-0"
            style={{
              width: 'clamp(100px, 25vw, 160px)',
              height: 'clamp(3px, 0.8vw, 4px)',
              maxWidth: '160px',
              minWidth: '100px',
              background: 'linear-gradient(to right, rgba(0, 66, 37, 0.2) 0%, rgba(0, 66, 37, 0.7) 15%, #004225 35%, #004225 65%, rgba(0, 66, 37, 0.7) 85%, rgba(0, 66, 37, 0.2) 100%)',
              borderRadius: '2px',
              boxShadow: '0 0 15px rgba(0, 66, 37, 0.9), 0 0 8px rgba(0, 66, 37, 0.5)',
              display: 'block',
              position: 'relative',
              zIndex: 1,
            }}
          />
          
          {/* Description */}
          <p className="text-xs sm:text-sm md:text-base lg:text-lg text-zinc-600 dark:text-zinc-400 font-light tracking-wide text-center max-w-[200px] sm:max-w-xs md:max-w-sm px-2">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function LandRoverLogo() {
  return (
    <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 flex items-center justify-center">
      <Image
        src="/logos/land-rover.png"
        alt="Land Rover Logo"
        width={288}
        height={288}
        className="object-contain w-full h-full"
        unoptimized
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}

function JaguarLogo() {
  return (
    <div className="relative w-32 h-32 sm:w-44 sm:h-44 md:w-48 md:h-48 lg:w-56 lg:h-56 xl:w-64 xl:h-64 2xl:w-72 2xl:h-72 flex items-center justify-center">
      <Image
        src="/logos/jaguar.png"
        alt="Jaguar Logo"
        width={288}
        height={288}
        className="object-contain w-full h-full"
        unoptimized
        loading="lazy"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
        }}
      />
    </div>
  );
}
