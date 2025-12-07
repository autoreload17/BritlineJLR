"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NoServicesFound() {
  const { t } = useLanguage();
  
  return (
    <div className="container-padded mx-auto max-w-6xl py-24 text-center">
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-4 text-zinc-900 dark:text-zinc-100">
          {t('noServicesForVehicle')}
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 mb-6">
          {t('noServicesForVehicleDescription')}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm sm:text-base">
          <a 
            href="tel:+447840000321" 
            className="text-[var(--accent-gold)] hover:underline font-medium"
          >
            +44 784 0000 321
          </a>
          <span className="text-zinc-400 dark:text-zinc-600">•</span>
          <a 
            href="tel:+441622801501" 
            className="text-[var(--accent-gold)] hover:underline font-medium"
          >
            +44 1622 801 501
          </a>
        </div>
      </div>
    </div>
  );
}




