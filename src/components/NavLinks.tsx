"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

export default function NavLinks() {
  const { t } = useLanguage();
  
  return (
    <>
      <Link 
        href="/about" 
        className="font-medium hover:opacity-80 transition-opacity whitespace-nowrap px-1.5 lg:px-2 py-1.5 lg:py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {t('aboutUs')}
      </Link>
      <Link 
        href="/vehicles" 
        className="font-medium hover:opacity-80 transition-opacity whitespace-nowrap px-1.5 lg:px-2 py-1.5 lg:py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {t('vehicles')}
      </Link>
      <Link 
        href="/our-works" 
        className="font-medium hover:opacity-80 transition-opacity whitespace-nowrap px-1.5 lg:px-2 py-1.5 lg:py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {t('ourWorks')}
      </Link>
      <Link 
        href="/car-projects" 
        className="font-medium hover:opacity-80 transition-opacity whitespace-nowrap px-1.5 lg:px-2 py-1.5 lg:py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {t('carProjects')}
      </Link>
      <Link 
        href="/contact" 
        className="font-medium hover:opacity-80 transition-opacity whitespace-nowrap px-1.5 lg:px-2 py-1.5 lg:py-2 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
      >
        {t('contacts')}
      </Link>
    </>
  );
}







