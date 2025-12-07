"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useLanguage } from "@/contexts/LanguageContext";
import ServiceCard from "./ServiceCard";
import Link from "next/link";

type ServiceOption = {
  title: string;
  image: string;
  price: string;
  requirements: string;
  description?: string; // Legacy field for backward compatibility
  descriptionEn?: string;
  descriptionRu?: string;
  status?: "in-stock" | "unavailable" | "coming-soon";
};

type ServicesPageClientProps = {
  brand: string;
  model: string;
  year: string;
  categoriesData: Record<string, ServiceOption[]>;
};

export default function ServicesPageClient({ brand, model, year, categoriesData }: ServicesPageClientProps) {
  const router = useRouter();
  const { t } = useLanguage();
  
  const categoryLabels: Record<string, string> = {
    "features-activation": t('featuresActivation'),
    "retrofits": t('retrofits'),
    "power-upgrade": t('powerUpgrade'),
    "accessories": t('accessories'),
  };
  // Get available categories from data - only those with at least one service
  const availableCategories = Object.keys(categoriesData).filter(
    catKey => categoriesData[catKey] && Array.isArray(categoriesData[catKey]) && categoriesData[catKey].length > 0
  );
  const [activeCategory, setActiveCategory] = useState(availableCategories[0] || "");
  const [showCart, setShowCart] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [orderFormData, setOrderFormData] = useState({
    name: "",
    vin: "",
    contact: "",
  });
  const [submitting, setSubmitting] = useState(false);
  
  const itemCount = useCartStore((state) => state.getItemCount());
  const totalPrice = useCartStore((state) => state.getTotalPrice());
  const items = useCartStore((state) => state.items);
  const removeItem = useCartStore((state) => state.removeItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const checkAndClearForNewVehicle = useCartStore((state) => state.checkAndClearForNewVehicle);

  // Update active category when categoriesData changes
  useEffect(() => {
    if (availableCategories.length > 0 && !availableCategories.includes(activeCategory)) {
      setActiveCategory(availableCategories[0]);
    } else if (availableCategories.length > 0 && !activeCategory) {
      setActiveCategory(availableCategories[0]);
    }
  }, [availableCategories, activeCategory]);

  // Check and clear cart if vehicle changed
  useEffect(() => {
    checkAndClearForNewVehicle(brand, model, year);
  }, [brand, model, year, checkAndClearForNewVehicle]);

  // Get options for active category
  const currentOptions = categoriesData[activeCategory] || [];

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const orderData = {
        customerName: orderFormData.name,
        vehicleVIN: orderFormData.vin,
        contact: orderFormData.contact,
        items: items,
        total: totalPrice,
        vehicle: {
          brand,
          model,
          year,
        },
      };

      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      });

      if (res.ok) {
        clearCart();
        setShowOrderForm(false);
        setShowCart(false);
        setOrderFormData({ name: "", vin: "", contact: "" });
        // Show success message and redirect to home page
        alert(t('orderSubmitted'));
        router.push("/");
      } else {
        alert(t('failedToSubmitOrder'));
      }
    } catch (error) {
      alert(t('failedToSubmitOrder'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-padded mx-auto max-w-6xl py-8">
      {/* Breadcrumb */}
      <div className="text-xs uppercase text-zinc-500 mb-4">
        {brand.replace('-', ' ').toUpperCase()} / {model.replace(/-/g, ' ').toUpperCase()} {year}
      </div>

      {/* Category Tabs + Cart */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-2 sm:gap-3 flex-wrap">
          {availableCategories.map((catKey) => (
            <button
              key={catKey}
              onClick={() => setActiveCategory(catKey)}
              className={`px-4 sm:px-5 py-2.5 sm:py-2 rounded-full text-sm sm:text-xs font-semibold transition-colors min-h-[44px] sm:min-h-0 ${
                activeCategory === catKey
                  ? "bg-[var(--accent-gold)] text-white shadow-lg"
                  : "border-2 border-[var(--border-color)] bg-white dark:bg-[var(--space-black)] hover:bg-zinc-50 dark:hover:bg-zinc-900"
              }`}
            >
              {categoryLabels[catKey] || catKey.toUpperCase()}
            </button>
          ))}
        </div>
        {/* Cart Icon */}
        <button
          onClick={() => setShowCart(true)}
          className="flex items-center gap-2 sm:gap-3 hover:opacity-80 active:opacity-60 transition-opacity min-h-[44px] px-2 sm:px-0"
        >
          <div className="relative">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-zinc-700 dark:text-zinc-300 sm:w-8 sm:h-8">
              <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H16.55C17.3 13 17.96 12.59 18.3 11.97L21.88 6H5.21L4.27 4H1V2ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[var(--accent-gold)] text-white text-xs sm:text-[10px] font-bold rounded-full w-6 h-6 sm:w-5 sm:h-5 flex items-center justify-center border-2 border-white dark:border-[var(--space-black)]">
                {itemCount}
              </span>
            )}
          </div>
          <span className="text-base sm:text-sm font-semibold">{t('added')}</span>
        </button>
      </div>

      {/* Category Title */}
      <h2 className="text-xl font-semibold mb-6 uppercase">
        {categoryLabels[activeCategory] || activeCategory.toUpperCase()}
      </h2>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12" style={{ alignItems: 'start' }}>
        {currentOptions.map((opt: ServiceOption, index: number) => {
          // Create a truly unique identifier for each card
          // Include all identifying fields plus index and category to ensure uniqueness
          const cardUniqueId = `${opt.title}-${opt.price}-${opt.image}-${opt.requirements}-${index}-${activeCategory}`;
          // Create a stable unique key that doesn't change between renders
          // This ensures React doesn't reuse components incorrectly
          const cardKey = `card-${brand}-${model}-${year}-${activeCategory}-${index}-${opt.title}-${opt.price}-${opt.image}`;
          
          return (
            <ServiceCard 
              key={cardKey}
              option={opt} 
              brand={brand} 
              model={model}
              year={year}
              uniqueId={cardUniqueId}
            />
          );
        })}
      </div>

      {/* Total + CTA Footer */}
      {itemCount > 0 && (
        <div className="sticky bottom-0 bg-white dark:bg-zinc-800 border-t border-[var(--border-color)] py-6 mt-8">
          <div className="flex items-center justify-between">
            <div className="text-right">
              <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">{t('total')}</div>
              <div className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{totalPrice}</div>
            </div>
            <button
              onClick={() => {
                setShowCart(false);
                setShowOrderForm(true);
              }}
              className="px-8 py-4 sm:py-3 rounded-full bg-[var(--accent-gold)] text-white font-semibold hover:bg-[var(--accent-gold)]/90 active:scale-95 min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-xl transition-all text-base sm:text-sm"
            >
              {t('getAnOffer')}
            </button>
          </div>
        </div>
      )}

      {/* Cart Modal */}
      {showCart && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowCart(false)} />
          <div className="relative z-[61] w-[92vw] max-w-2xl rounded-2xl bg-white text-black p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Shopping Cart</h2>
              <button
                onClick={() => setShowCart(false)}
                className="text-zinc-500 hover:text-black"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {items.length === 0 ? (
              <p className="text-center py-8 text-zinc-500">Your cart is empty</p>
            ) : (
              <>
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-4 p-4 border border-[var(--border-color)] rounded-lg">
                      <div className="relative w-20 h-20 bg-silver/20 rounded overflow-hidden flex-shrink-0">
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm mb-1">{item.title}</h3>
                        <p className="text-xs text-zinc-500 mb-2">
                          {item.brand.replace('-', ' ')} / {item.model.replace(/-/g, ' ')} / {item.year}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="text-lg font-semibold">{item.price}</div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-600 hover:text-red-800 underline"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--border-color)] pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold">Total</span>
                    <span className="text-2xl font-semibold">{totalPrice}</span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={clearCart}
                      className="flex-1 px-4 py-3 sm:py-2 rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-sm sm:text-sm font-semibold min-h-[44px] sm:min-h-0 transition-colors"
                    >
                      {t('clearCart')}
                    </button>
                    <button
                      onClick={() => {
                        setShowCart(false);
                        setShowOrderForm(true);
                      }}
                      className="flex-1 px-4 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-semibold hover:bg-[var(--accent-gold)]/90 active:scale-95 min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-xl transition-all text-sm sm:text-sm"
                    >
                      {t('getAnOffer')}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Order Form Modal */}
      {showOrderForm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowOrderForm(false)} />
          <div className="relative z-[61] w-[92vw] max-w-2xl rounded-2xl bg-white dark:bg-[var(--space-black)] text-black dark:text-[var(--foreground)] p-6" onClick={(e) => e.stopPropagation()}>
            <button
              aria-label="Close"
              className="absolute right-4 top-4 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
              onClick={() => setShowOrderForm(false)}
            >
              ✕
            </button>
            <h3 className="text-xl font-semibold mb-6">{t('getAnOfferTitle')}</h3>
            <form onSubmit={handleOrderSubmit} className="grid gap-3">
              <input
                type="text"
                value={orderFormData.name}
                onChange={(e) => setOrderFormData({ ...orderFormData, name: e.target.value })}
                className="h-12 sm:h-12 rounded-md border-2 border-zinc-200 dark:border-zinc-700 px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('yourName')}
                required
              />
              <input
                type="text"
                value={orderFormData.vin}
                onChange={(e) => setOrderFormData({ ...orderFormData, vin: e.target.value })}
                className="h-12 sm:h-12 rounded-md border-2 border-zinc-200 dark:border-zinc-700 px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('vehicleVINNumber')}
                required
              />
              <input
                type="text"
                value={orderFormData.contact}
                onChange={(e) => setOrderFormData({ ...orderFormData, contact: e.target.value })}
                className="h-12 sm:h-12 rounded-md border-2 border-zinc-200 dark:border-zinc-700 px-4 bg-white dark:bg-[var(--space-black)] text-[var(--foreground)] text-base sm:text-sm font-medium min-h-[44px] focus:border-[var(--accent-gold)] focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
                placeholder={t('mobileNumberOrEmail')}
                required
              />
              <div className="mt-2 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                <div className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{t('orderSummary')}:</div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  {items.map((item) => (
                    <div key={item.id}>
                      {item.title} - {item.price}
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
                  <span className="font-semibold">Total:</span>
                  <span className="text-lg font-bold">{totalPrice}</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full h-12 sm:h-11 rounded-full bg-[var(--accent-gold)] text-white font-semibold hover:bg-[var(--accent-gold)]/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] sm:min-h-0 shadow-lg hover:shadow-xl transition-all text-base sm:text-sm"
              >
                {submitting ? t('submitting') : t('getAnOffer')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

