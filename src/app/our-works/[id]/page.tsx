"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";

type Work = {
  id: string;
  images: string[];
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  order: number;
  createdAt: string;
};

export default function WorkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t, language } = useLanguage();
  const [work, setWork] = useState<Work | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadWork(params.id as string);
    }
  }, [params.id]);

  const loadWork = async (id: string) => {
    try {
      const res = await fetch("/api/admin/works");
      const data = await res.json();
      const worksArray = Array.isArray(data) ? data : [];
      const foundWork = worksArray.find((w: Work) => w.id === id);
      setWork(foundWork || null);
    } catch (error) {
      console.error("Failed to load work:", error);
      setWork(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="container-padded mx-auto max-w-6xl py-16">
        <div className="text-center text-zinc-600 dark:text-zinc-400">
          {t('loading')}
        </div>
      </section>
    );
  }

  if (!work) {
    return (
      <section className="container-padded mx-auto max-w-6xl py-16">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-4">{t('workNotFound') || 'Work not found'}</h1>
          <Link
            href="/our-works"
            className="text-[var(--accent-gold)] hover:underline"
          >
            {t('backToWorks') || '← Back to Our Works'}
          </Link>
        </div>
      </section>
    );
  }

  const title = language === 'ru' ? work.titleRu : work.titleEn;
  const description = language === 'ru' ? work.descriptionRu : work.descriptionEn;
  const mainImage = work.images && work.images.length > 0 ? work.images[selectedImageIndex] : null;
  const hasMultipleImages = work.images && work.images.length > 1;

  const nextImage = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => (prev + 1) % work.images.length);
    }
  };

  const prevImage = () => {
    if (hasMultipleImages) {
      setSelectedImageIndex((prev) => (prev - 1 + work.images.length) % work.images.length);
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
    <section className="container-padded mx-auto max-w-6xl py-8 sm:py-16">
      {/* Back button */}
      <Link
        href="/our-works"
        className="inline-flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400 hover:text-[var(--accent-gold)] mb-6 transition-colors"
      >
        <span>←</span>
        <span>{t('backToWorks') || 'Back to Our Works'}</span>
      </Link>

      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-video rounded-2xl overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30 group">
            {mainImage ? (
              <>
                <Image
                  src={mainImage}
                  alt={title}
                  fill
                  className="object-cover"
                  unoptimized
                  priority
                />
                {/* Navigation arrows */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      aria-label="Previous image"
                    >
                      <span className="text-xl">←</span>
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm"
                      aria-label="Next image"
                    >
                      <span className="text-xl">→</span>
                    </button>
                    {/* Image counter */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-sm">
                      {selectedImageIndex + 1} / {work.images.length}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                {t('noImage')}
              </div>
            )}
          </div>

          {/* Thumbnail Gallery */}
          {work.images && work.images.length > 1 && (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
              {work.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-video rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImageIndex === index
                      ? 'border-[var(--accent-gold)] ring-2 ring-[var(--accent-gold)]/20'
                      : 'border-[var(--border-color)] opacity-60 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${title} - Image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-semibold mb-4">{title}</h1>
            <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                {description}
              </p>
            </div>
          </div>

          {/* CTA Button */}
          <div className="pt-4">
            <button
              onClick={() => setShowOrderForm(true)}
              className="h-12 px-6 rounded-full bg-[var(--accent-gold)] text-white font-medium hover:opacity-90 transition-opacity"
            >
              {t('getAnOffer')}
            </button>
          </div>
        </div>
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

