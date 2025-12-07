"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";

type OrderFormData = {
  name: string;
  vin: string;
  contact: string;
};

type Work = {
  id: string;
  images: string[]; // Array of image paths
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  order: number;
  createdAt: string;
};

export default function OurWorksPage() {
  const { t, language } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState<OrderFormData>({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadWorks();
  }, []);

  const loadWorks = async () => {
    try {
      const res = await fetch("/api/admin/works");
      const data = await res.json();
      const worksArray = Array.isArray(data) ? data : [];
      setWorks(worksArray);
    } catch (error) {
      console.error("Failed to load works:", error);
      setWorks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        customerName: orderFormData.name,
        vehicleVIN: orderFormData.vin,
        contact: orderFormData.contact,
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
        setShowOrderForm(false);
        setOrderFormData({ name: "", vin: "", contact: "" });
        alert(t('requestSubmitted') || "Your request has been submitted! We will contact you soon.");
      } else {
        throw new Error("Failed to submit order");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      alert(t('failedToSubmitRequest') || "Failed to submit request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('ourWorks').replace('OUR WORKS', 'Our Works').replace('НАШИ РАБОТЫ', 'Наши работы')}</h1>
      
      {loading ? (
        <div className="mt-10 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('loading')}</p>
          </div>
        </div>
      ) : works.length === 0 ? (
        <div className="mt-10 text-center text-zinc-600 dark:text-zinc-400">
          {t('noWorksFound')}
        </div>
      ) : (
        <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {works.map((work) => (
            <Link
              key={work.id}
              href={`/our-works/${work.id}`}
              className="rounded-2xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
            >
              <article className="h-full flex flex-col">
                <div className="relative h-48 bg-silver/20 dark:bg-zinc-800/30">
                  {work.images && work.images.length > 0 && work.images[0] ? (
                    <>
                      <Image
                        src={work.images[0]}
                        alt={language === 'ru' ? work.titleRu : work.titleEn}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        unoptimized
                      />
                      {work.images.length > 1 && (
                        <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                          +{work.images.length - 1}
                        </div>
                      )}
                    </>
                  ) : null}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="text-lg font-semibold mb-2 group-hover:text-[var(--accent-gold)] transition-colors">
                    {language === 'ru' ? work.titleRu : work.titleEn}
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3 flex-1">
                    {language === 'ru' ? work.descriptionRu : work.descriptionEn}
                  </p>
                  <div className="mt-3 text-xs text-[var(--accent-gold)] opacity-0 group-hover:opacity-100 transition-opacity">
                    {t('readMore') || 'Read more →'}
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
      
      <div className="mt-10 flex items-center justify-center">
        <button
          onClick={() => setShowOrderForm(true)}
          className="h-12 px-6 rounded-full bg-[var(--accent-gold)] text-white font-medium hover:opacity-90 transition-opacity"
        >
          {t('getAnOffer')}
        </button>
      </div>

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowOrderForm(false)} />
          <div className="relative z-[61] w-full max-w-2xl rounded-2xl bg-white dark:bg-[var(--space-black)] border-2 border-[var(--border-color)] p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close"
              className="absolute right-4 top-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 text-2xl w-8 h-8 flex items-center justify-center transition-colors"
              onClick={() => setShowOrderForm(false)}
            >
              ✕
            </button>
            <h3 className="text-xl sm:text-2xl font-semibold mb-6 text-[var(--foreground)]">{t('getAnOfferTitle')}</h3>
            <form onSubmit={handleOrderSubmit} className="grid gap-4">
              <input
                type="text"
                value={orderFormData.name}
                onChange={(e) => setOrderFormData({ ...orderFormData, name: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('yourName')}
                required
              />
              <input
                type="text"
                value={orderFormData.vin}
                onChange={(e) => setOrderFormData({ ...orderFormData, vin: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('vehicleVINNumber')}
                required
              />
              <input
                type="text"
                value={orderFormData.contact}
                onChange={(e) => setOrderFormData({ ...orderFormData, contact: e.target.value })}
                className="h-12 sm:h-12 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('mobileNumberOrEmail')}
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="h-12 sm:h-12 rounded-full bg-[var(--accent-gold)] text-white text-base sm:text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] shadow-lg hover:shadow-xl active:scale-95 transition-all"
              >
                {submitting ? t('submitting') : t('submitOrder')}
              </button>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}






