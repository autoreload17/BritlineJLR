"use client";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { t } = useLanguage();
  
  return (
    <section className="container-padded mx-auto max-w-7xl py-12 sm:py-16 lg:py-20 px-4">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold tracking-tight mb-8 lg:mb-12 text-zinc-900 dark:text-white">{t('contact')}</h1>
      <div className="mt-8 lg:mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 xl:gap-12">
        <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 lg:mb-6 text-zinc-900 dark:text-white">{t('unitedKingdom')}</h2>
          <p className="mt-2 text-sm lg:text-base xl:text-lg text-zinc-600 dark:text-zinc-400 mb-4 lg:mb-6">Unit 29 Integra:ME, Parkwood Industrial Estate, Maidstone ME15 9GQ</p>
          <a href="tel:+447840000321" className="mt-3 inline-block text-sm lg:text-base xl:text-lg font-medium text-[var(--accent-gold)] hover:opacity-80 transition-opacity">+44 784 0000 321</a>
        </div>
        <div className="rounded-2xl lg:rounded-3xl border-2 border-[var(--border-color)] p-6 lg:p-8 xl:p-10 bg-white dark:bg-[var(--space-black)] shadow-lg hover:shadow-xl transition-shadow">
          <h2 className="text-xl lg:text-2xl xl:text-3xl font-semibold mb-4 lg:mb-6 text-zinc-900 dark:text-white">{t('ukraine')}</h2>
          <p className="mt-2 text-sm lg:text-base xl:text-lg text-zinc-600 dark:text-zinc-400 mb-4 lg:mb-6">Kraynya st. 1, Kyiv 02217</p>
          <a href="tel:+380670000321" className="mt-3 inline-block text-sm lg:text-base xl:text-lg font-medium text-[var(--accent-gold)] hover:opacity-80 transition-opacity">+38 067 0000 321</a>
        </div>
      </div>
    </section>
  );
}






