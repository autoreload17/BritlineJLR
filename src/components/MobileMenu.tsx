"use client";
import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { TelegramIcon, InstagramIcon, WhatsAppIcon } from "./SocialIcons";

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [offerOpen, setOfferOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const { t } = useLanguage();

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        customerName: formData.name,
        vehicleVIN: formData.vin,
        contact: formData.contact,
        items: [],
        total: "£0",
        vehicle: {
          brand: "",
          model: "",
          year: "",
        },
        type: "general-inquiry",
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        setOfferOpen(false);
        setIsOpen(false);
        setFormData({ name: "", vin: "", contact: "" });
        alert(t('requestSubmitted'));
        window.location.reload();
      } else {
        alert(t('failedToSubmitRequest'));
      }
    } catch (error) {
      alert(t('failedToSubmitRequest'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Burger Button - показывается до lg (1024px) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden flex flex-col gap-1.5 p-2 min-w-[44px] min-h-[44px] items-center justify-center"
        aria-label="Toggle menu"
        aria-expanded={isOpen}
      >
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? "rotate-45 translate-y-2" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? "opacity-0" : ""
          }`}
        />
        <span
          className={`block h-0.5 w-6 bg-current transition-all duration-300 ${
            isOpen ? "-rotate-45 -translate-y-2" : ""
          }`}
        />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          <nav
            className={`fixed top-14 sm:top-16 left-0 right-0 bg-white/80 dark:bg-[var(--space-black)]/80 backdrop-blur-xl border-b border-[var(--border-color)] z-50 lg:hidden transition-transform duration-300 ${
              isOpen ? "translate-y-0" : "-translate-y-full"
            }`}
            style={{
              WebkitBackdropFilter: 'saturate(180%) blur(24px)',
              backdropFilter: 'saturate(180%) blur(24px)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="container-padded mx-auto py-4 sm:py-5">
              <div className="flex flex-col gap-3 sm:gap-4">
                <Link
                  href="/about"
                  className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2.5 sm:py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {t('aboutUs')}
                </Link>
                <Link
                  href="/vehicles"
                  className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2.5 sm:py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {t('vehicles')}
                </Link>
                <Link
                  href="/our-works"
                  className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2.5 sm:py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {t('ourWorks')}
                </Link>
                <Link
                  href="/car-projects"
                  className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2.5 sm:py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {t('carProjects')}
                </Link>
                <Link
                  href="/contact"
                  className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2.5 sm:py-2 min-h-[44px] flex items-center"
                  onClick={() => setIsOpen(false)}
                >
                  {t('contacts')}
                </Link>
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <LanguageSwitcher fullWidth={true} />
                </div>
                <div className="border-t border-[var(--border-color)] pt-4 mt-2">
                  <div className="flex flex-col gap-2.5 sm:gap-2">
                    <a
                      href="tel:+447840000321"
                      className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2 min-h-[44px] flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      0784 0000 321
                    </a>
                    <a
                      href="tel:+441622801501"
                      className="text-base sm:text-sm font-medium text-[var(--foreground)] hover:text-[var(--accent-gold)] transition-colors py-2 min-h-[44px] flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      01622 801 501
                    </a>
                  </div>
                  <div className="flex items-center gap-4 sm:gap-5 mt-4 sm:mt-5">
                    <a
                      href="https://t.me/lr_chip"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                      aria-label="Telegram"
                      onClick={() => setIsOpen(false)}
                    >
                      <TelegramIcon size={24} />
                    </a>
                    <a
                      href="https://instagram.com/ir_chip"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                      aria-label="Instagram"
                      onClick={() => setIsOpen(false)}
                    >
                      <InstagramIcon size={24} />
                    </a>
                    <a
                      href="https://wa.me/447840000321"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-80 transition-opacity"
                      aria-label="WhatsApp"
                      onClick={() => setIsOpen(false)}
                    >
                      <WhatsAppIcon size={24} />
                    </a>
                  </div>
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setOfferOpen(true);
                    }}
                    className="block w-full text-center px-6 py-3 rounded-lg bg-[var(--accent-gold)] text-white font-semibold hover:opacity-90 transition-opacity min-h-[44px]"
                  >
                    {t('getAnOffer')}
                  </button>
                </div>
              </div>
            </div>
          </nav>
        </>
      )}

      {/* OFFER MODAL */}
      {offerOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOfferOpen(false)} />
          <div className="relative z-[61] w-full max-w-2xl rounded-2xl bg-white dark:bg-[var(--space-black)] border-2 border-[var(--border-color)] p-4 sm:p-6 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <button aria-label="Close" className="absolute right-3 top-3 sm:right-4 sm:top-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-xl transition-colors" onClick={() => setOfferOpen(false)}>✕</button>
            <h3 className="text-lg sm:text-xl font-semibold pr-8 text-[var(--foreground)]">{t('getAnOfferTitle')}</h3>
            <form onSubmit={handleOfferSubmit} className="mt-4 sm:mt-6 grid gap-3">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('yourName')}
                required
              />
              <input
                type="text"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('vehicleVINNumber')}
                required
              />
              <input
                type="text"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('mobileNumberOrEmail')}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-12 sm:h-12 rounded-full bg-[var(--accent-gold)] text-white text-base sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                {submitting ? t('submitting') : t('getAListOfServices')}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}



