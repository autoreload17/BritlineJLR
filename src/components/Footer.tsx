"use client";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from "./SocialIcons";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="border-t border-[var(--border-color)] bg-white dark:bg-[var(--space-black)]">
      <div className="container-padded mx-auto py-12 sm:py-16 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-8">
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t('schedule')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>* {t('monFri')}</li>
              <li>* {t('satWorking')}</li>
              <li>* {t('sunDayOff')}</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm">
              <Link href="/about" className="hover:text-[var(--accent-gold)] transition-colors">{t('aboutUs').replace('ABOUT US', 'About us').replace('О НАС', 'О нас')}</Link>
            </h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li><Link href="/our-works" className="hover:text-[var(--accent-gold)]">{t('ourWorks').replace('OUR WORKS', 'Our works').replace('НАШИ РАБОТЫ', 'Наши работы')}</Link></li>
              <li><Link href="/retrofits" className="hover:text-[var(--accent-gold)]">{t('retrofits').replace('RETROFITS', 'Retrofits').replace('РЕТРОФИТЫ', 'Ретрофиты')}</Link></li>
              <li><Link href="/features-activation" className="hover:text-[var(--accent-gold)]">{t('featuresActivation').replace('FEATURES ACTIVATION', 'Features activation').replace('АКТИВАЦИЯ ФУНКЦИЙ', 'Активация функций')}</Link></li>
              <li><Link href="/power-upgrade" className="hover:text-[var(--accent-gold)]">{t('powerUpgrade').replace('POWER UPGRADE', 'Power upgrade').replace('УСИЛЕНИЕ МОЩНОСТИ', 'Усиление мощности')}</Link></li>
              <li><Link href="/accessories" className="hover:text-[var(--accent-gold)]">{t('accessories').replace('ACCESSORIES', 'Accessories').replace('АКСЕССУАРЫ', 'Аксессуары')}</Link></li>
              <li><Link href="/contact" className="hover:text-[var(--accent-gold)]">{t('carRepair').replace('CAR REPAIR', 'Car repair').replace('РЕМОНТ АВТО', 'Ремонт авто')}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t('contactsInUK')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>Unit 29 Integra:ME</li>
              <li>Parkwood Industrial Estate</li>
              <li>Bircholt Road, Maidstone</li>
              <li>ME15 9GQ</li>
              <li><a href="tel:+447840000321" className="hover:text-[var(--accent-gold)]">+44 784 0000 321</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-4 text-sm">{t('contactsInUkraine')}</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>Kraynya st. 1</li>
              <li>Kyiv, 02217</li>
              <li><a href="tel:+380670000321" className="hover:text-[var(--accent-gold)]">+38 067 0000 321</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-[var(--border-color)] pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <a href="mailto:lr.chip.com.ua@gmail.com" className="hover:text-[var(--accent-gold)]">lr.chip.com.ua@gmail.com</a>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://t.me/lr_chip"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Telegram"
              >
                <TelegramIcon size={24} />
              </a>
              <a
                href="https://instagram.com/ir_chip"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="Instagram"
              >
                <InstagramIcon size={24} />
              </a>
              <a
                href="https://wa.me/447840000321"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity"
                aria-label="WhatsApp"
              >
                <WhatsAppIcon size={24} />
              </a>
            </div>
            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <Link href="/" className="font-semibold">Britline JLR</Link>
            </div>
            <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              © {t('allRightsReserved')}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

