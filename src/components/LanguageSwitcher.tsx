"use client";
import { useLanguage } from "@/contexts/LanguageContext";

type LanguageSwitcherProps = {
  fullWidth?: boolean;
};

export default function LanguageSwitcher({ fullWidth = false }: LanguageSwitcherProps) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className={`flex items-center gap-1 lg:gap-2 border-2 border-[var(--border-color)] rounded-full px-0.5 lg:px-1 py-0.5 lg:py-1 bg-white dark:bg-[var(--space-black)] ${fullWidth ? 'w-full' : ''}`}>
      <button
        onClick={() => setLanguage('en')}
        className={`flex-1 px-4 py-2.5 sm:px-2 lg:px-3 sm:py-1 rounded-full text-sm sm:text-xs font-medium transition-colors min-h-[44px] sm:min-h-0 active:scale-95 ${
          language === 'en'
            ? 'bg-[var(--accent-gold)] text-white shadow-sm'
            : 'text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('ru')}
        className={`flex-1 px-4 py-2.5 sm:px-2 lg:px-3 sm:py-1 rounded-full text-sm sm:text-xs font-medium transition-colors min-h-[44px] sm:min-h-0 active:scale-95 ${
          language === 'ru'
            ? 'bg-[var(--accent-gold)] text-white shadow-sm'
            : 'text-[var(--foreground)] hover:bg-zinc-100 dark:hover:bg-zinc-800'
        }`}
      >
        RU
      </button>
    </div>
  );
}

