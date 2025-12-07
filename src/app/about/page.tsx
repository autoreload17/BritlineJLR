"use client";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function AboutPage() {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-[60dvh] flex items-center bg-[var(--space-black)] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-30 bg-[url('/window.svg')] bg-cover bg-center pointer-events-none" />
        <div className="container-padded mx-auto max-w-7xl py-20 sm:py-28 lg:py-36 px-4 relative z-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight mb-6 lg:mb-8">
            {t('aboutUsTitle')}
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl text-zinc-300 max-w-3xl mb-6 lg:mb-8">
            {t('aboutUsSubtitle')}
          </p>
          <p className="text-base sm:text-lg text-zinc-400 max-w-2xl leading-relaxed">
            {t('aboutUsDescription')}
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container-padded mx-auto max-w-7xl py-12 sm:py-16 lg:py-20 px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 lg:mb-8 text-zinc-900 dark:text-white">
              {t('aboutUsMission')}
            </h2>
            <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('aboutUsMissionText')}
            </p>
          </div>
          <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="aspect-square flex items-center justify-center">
              <svg className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="bg-zinc-50 dark:bg-zinc-900/30 py-12 sm:py-16 lg:py-20">
        <div className="container-padded mx-auto max-w-7xl px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow order-2 lg:order-1">
              <div className="aspect-square flex items-center justify-center">
                <svg className="w-24 h-24 sm:w-32 sm:h-32 lg:w-40 lg:h-40 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 lg:mb-8 text-zinc-900 dark:text-white">
                {t('aboutUsExpertise')}
              </h2>
              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {t('aboutUsExpertiseText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="container-padded mx-auto max-w-7xl py-12 sm:py-16 lg:py-20 px-4">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-8 lg:mb-12 text-zinc-900 dark:text-white">
          {t('aboutUsValues')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {/* Quality */}
          <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center mb-4 lg:mb-6">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-3 lg:mb-4 text-zinc-900 dark:text-white">
              {t('aboutUsQuality')}
            </h3>
            <p className="text-sm lg:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('aboutUsQualityText')}
            </p>
          </div>

          {/* Reliability */}
          <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center mb-4 lg:mb-6">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-3 lg:mb-4 text-zinc-900 dark:text-white">
              {t('aboutUsReliability')}
            </h3>
            <p className="text-sm lg:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('aboutUsReliabilityText')}
            </p>
          </div>

          {/* Confidentiality */}
          <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center mb-4 lg:mb-6">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-3 lg:mb-4 text-zinc-900 dark:text-white">
              {t('aboutUsConfidentiality')}
            </h3>
            <p className="text-sm lg:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('aboutUsConfidentialityText')}
            </p>
          </div>

          {/* Experience */}
          <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
            <div className="w-12 h-12 lg:w-16 lg:h-16 rounded-full bg-[var(--accent-gold)]/10 flex items-center justify-center mb-4 lg:mb-6">
              <svg className="w-6 h-6 lg:w-8 lg:h-8 text-[var(--accent-gold)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg lg:text-xl xl:text-2xl font-semibold mb-3 lg:mb-4 text-zinc-900 dark:text-white">
              {t('aboutUsExperience')}
            </h3>
            <p className="text-sm lg:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {t('aboutUsExperienceText')}
            </p>
          </div>
        </div>
      </section>

      {/* Commitment Section */}
      <section className="container-padded mx-auto max-w-7xl py-12 sm:py-16 lg:py-20 px-4">
        <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-6 lg:mb-8 text-zinc-900 dark:text-white">
            {t('aboutUsCommitment')}
          </h2>
          <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed mb-8 lg:mb-12 max-w-4xl">
            {t('aboutUsCommitmentText')}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 rounded-full bg-[var(--accent-gold)] text-white text-base lg:text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl"
            >
              {t('contacts')}
            </Link>
            <Link
              href="/vehicles"
              className="inline-flex items-center justify-center px-6 lg:px-8 py-3 lg:py-4 rounded-full border-2 border-[var(--border-color)] bg-white dark:bg-[var(--space-black)] text-base lg:text-lg font-semibold hover:border-[var(--accent-gold)] transition-all"
            >
              {t('vehicles')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

