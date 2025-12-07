"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
  order?: number;
};

const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => {
  const [imgError, setImgError] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const hasMultipleYears = vehicle.years.length > 1;
  
  // Extract year range from years array
  const yearLabels = vehicle.years.map(y => y.label).join(", ");
  const firstYear = vehicle.years[0]?.label || "";
  
  // Extract model name without year (if title contains year info)
  const modelName = vehicle.title;
  
  // Normalize brand and model for URL - must match normalizeUrlParam function
  const normalizeForUrl = (value: string) => {
    return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };
  const normalizedBrand = normalizeForUrl(vehicle.brand || '');
  const normalizedModel = normalizeForUrl(vehicle.value || '');

  const handleCardClick = (e: React.MouseEvent) => {
    if (hasMultipleYears) {
      e.preventDefault();
      setShowYearDropdown(!showYearDropdown);
    }
  };

  return (
    <div className="group relative">
      <div
        onClick={handleCardClick}
        className={`block rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all duration-200 ${hasMultipleYears ? 'cursor-pointer' : ''}`}
      >
        <div className="relative h-48 bg-silver/20 dark:bg-zinc-800/30 overflow-hidden">
          {!imgError && vehicle.image ? (
            <Image
              src={vehicle.image}
              alt={vehicle.title}
              fill
              className="object-cover transition-transform duration-200 group-hover:scale-105"
              sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
              unoptimized
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs bg-silver/10 dark:bg-zinc-800/50">
              {vehicle.title}
            </div>
          )}
          {/* Arrow indicator for multiple years */}
          {hasMultipleYears && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <div className="flex flex-col items-center">
                <div className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                  {firstYear}
                </div>
                <div className={`text-white text-xl mt-1 transition-transform duration-200 ${showYearDropdown ? 'rotate-180' : ''}`}>
                  ↓
                </div>
              </div>
            </div>
          )}
          {/* Single year on hover */}
          {!hasMultipleYears && firstYear && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="flex flex-col items-center">
                <div className="text-white text-xs font-medium bg-black/60 px-3 py-1 rounded-full backdrop-blur-sm">
                  {firstYear}
                </div>
                <div className="text-white text-xl mt-1">↓</div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4">
          <div className="text-sm font-medium group-hover:text-[var(--accent-gold)] transition-colors duration-200">
            {modelName}
          </div>
          <div className="mt-1 text-xs text-zinc-500 group-hover:text-zinc-400 transition-colors">
            {yearLabels}
          </div>
        </div>
      </div>

      {/* Year Dropdown */}
      {hasMultipleYears && showYearDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[var(--space-black)] border border-[var(--border-color)] rounded-lg shadow-lg z-10 overflow-hidden">
          {vehicle.years.map((year, index) => {
            // Encode year value for URL (e.g., "2021+" -> "2021%2B")
            const encodedYear = encodeURIComponent(year.value);
            return (
              <Link
                key={index}
                href={`/services/${normalizedBrand}/${normalizedModel}/${encodedYear}`}
                className="block px-4 py-3 text-[var(--foreground)] hover:bg-[var(--accent-gold)]/10 hover:text-[var(--accent-gold)] transition-colors text-sm font-medium"
                onClick={() => setShowYearDropdown(false)}
              >
                {year.label}
              </Link>
            );
          })}
        </div>
      )}

      {/* Direct link for single year */}
      {!hasMultipleYears && vehicle.years[0] && (
        <Link
          href={`/services/${normalizedBrand}/${normalizedModel}/${encodeURIComponent(vehicle.years[0].value)}`}
          className="absolute inset-0"
          aria-label={`Go to services for ${vehicle.title}`}
        />
      )}
    </div>
  );
};

export default function VehiclesPage() {
  const { t } = useLanguage();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string>("all");

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      const vehiclesArray = Array.isArray(data) ? data : [];
      // Ensure vehicles are sorted by order
      vehiclesArray.sort((a: Vehicle, b: Vehicle) => (a.order || 0) - (b.order || 0));
      setVehicles(vehiclesArray);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
      setVehicles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVehicles = selectedBrand === "all" 
    ? vehicles 
    : vehicles.filter(v => v.brand === selectedBrand);

  // Get all unique brands dynamically
  const allBrands = Array.from(new Set(vehicles.map(v => v.brand))).sort((a, b) => {
    // Sort: land-rover first, jaguar second, then alphabetically
    if (a === "land-rover") return -1;
    if (b === "land-rover") return 1;
    if (a === "jaguar") return -1;
    if (b === "jaguar") return 1;
    return a.localeCompare(b);
  });

  if (loading) {
    return (
      <section className="container-padded mx-auto max-w-6xl py-24 text-center">
        <p>{t('loadingVehicles')}</p>
      </section>
    );
  }

  return (
    <section className="container-padded mx-auto max-w-6xl py-8 sm:py-16 px-4">
      <div className="flex items-center gap-4 sm:gap-8">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight">{t('vehicles').replace('VEHICLES', 'Vehicles').replace('АВТОМОБИЛИ', 'Автомобили')}</h1>
      </div>

      <div className="mt-6 sm:mt-10">
        <div className="flex gap-3 sm:gap-6 text-xs sm:text-sm flex-wrap">
          <button
            onClick={() => setSelectedBrand("all")}
            className={`px-4 sm:px-4 py-2.5 sm:py-2 rounded-full border-2 transition-colors min-h-[44px] sm:min-h-0 text-sm sm:text-xs font-semibold ${
              selectedBrand === "all"
                ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] shadow-lg"
                : "border-[var(--border-color)] bg-white dark:bg-[var(--space-black)] hover:bg-zinc-50 dark:hover:bg-zinc-900"
            }`}
          >
            {t('all')} ({vehicles.length})
          </button>
          {allBrands.map(brand => {
            const brandVehicles = vehicles.filter(v => v.brand === brand);
            const displayName = brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return (
              <button
                key={brand}
                onClick={() => setSelectedBrand(brand)}
                className={`px-4 sm:px-4 py-2.5 sm:py-2 rounded-full border-2 transition-colors min-h-[44px] sm:min-h-0 text-sm sm:text-xs font-semibold ${
                  selectedBrand === brand
                    ? "border-[var(--accent-gold)] bg-[var(--accent-gold)]/10 text-[var(--accent-gold)] shadow-lg"
                    : "border-[var(--border-color)] bg-white dark:bg-[var(--space-black)] hover:bg-zinc-50 dark:hover:bg-zinc-900"
                }`}
              >
                {displayName.toUpperCase()} ({brandVehicles.length})
              </button>
            );
          })}
        </div>

        {filteredVehicles.length > 0 ? (
          <div className="mt-6 sm:mt-10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredVehicles.map((vehicle, index) => (
              <VehicleCard key={`${vehicle.brand}-${vehicle.value}-${index}`} vehicle={vehicle} />
            ))}
          </div>
        ) : (
          <div className="mt-6 sm:mt-10 text-center py-8 sm:py-12">
            <p className="text-zinc-500 mb-4 text-sm sm:text-base">{t('noVehiclesFound')}</p>
            <p className="text-xs sm:text-sm text-zinc-400">
              {t('addVehiclesAdmin')}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
