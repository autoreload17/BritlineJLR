"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function RetrofitsPage() {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* Hero Section with blurred car background */}
      <section className="relative min-h-[60dvh] flex items-center bg-[var(--space-black)] text-white">
        <div className="absolute inset-0 opacity-30 bg-[url('/window.svg')] bg-cover bg-center pointer-events-none" />
      </section>

      {/* Main Content */}
      <section className="container-padded mx-auto max-w-6xl py-12 sm:py-16 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Image on Left */}
          <div className="order-2 lg:order-1">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 border-[var(--accent-gold)]">
              <div className="absolute inset-0 bg-silver/20 flex items-center justify-center">
                <span className="text-zinc-400 text-sm">{t('retrofitsTitle')} Image</span>
              </div>
            </div>
          </div>

          {/* Text on Right */}
          <div className="order-1 lg:order-2">
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 uppercase">{t('retrofitsTitle')}</h1>
            <div className="space-y-4 text-base sm:text-lg text-zinc-700 dark:text-zinc-300">
              <p>{t('retrofitsPageDescription')}</p>
              <p>{t('retrofitsInstallation')}</p>
              <p>{t('retrofitsWhy')}</p>
              <p className="mt-6">{t('viewServicesByModel')}</p>
            </div>
            <div className="mt-8">
              <Link
                href="/contact"
                className="inline-block px-8 py-4 rounded-lg bg-[var(--accent-gold)] text-white font-semibold text-lg hover:opacity-90 transition-opacity"
              >
                {t('getAnOffer')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}



