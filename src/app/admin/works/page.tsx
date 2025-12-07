"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

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

export default function WorksAdminPage() {
  const { t, language } = useLanguage();
  const [works, setWorks] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const [formData, setFormData] = useState<Omit<Work, "id" | "createdAt" | "order">>({
    images: [],
    titleEn: "",
    titleRu: "",
    descriptionEn: "",
    descriptionRu: "",
  });

  useEffect(() => {
    loadWorks();
    loadImages();
    
    // Auto-refresh every 10 seconds (silently)
    const interval = setInterval(() => {
      loadWorks(false);
    }, 10000);
    
    const handleFocus = () => {
      loadWorks(false);
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadWorks = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await fetch("/api/admin/works");
      const data = await res.json();
      const worksArray = Array.isArray(data) ? data : [];
      
      setWorks(prevWorks => {
        const prevIds = prevWorks.map(w => w.id).sort().join(',');
        const newIds = worksArray.map(w => w.id).sort().join(',');
        if (prevIds !== newIds || prevWorks.length !== worksArray.length) {
          setRefreshKey(prev => prev + 1);
          return worksArray;
        }
        return prevWorks;
      });
      
      return worksArray;
    } catch (error) {
      console.error("Failed to load works:", error);
      if (showLoading) {
        setWorks([]);
        setRefreshKey(prev => prev + 1);
      }
      return [];
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadImages = async () => {
    setLoadingImages(true);
    try {
      // Load images from /public/our-works/ directory
      const res = await fetch("/api/admin/work-images");
      const data = await res.json();
      setAvailableImages(data.images || []);
    } catch (error) {
      console.error("Failed to load images:", error);
      setAvailableImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that at least one image is added
    if (formData.images.length === 0 || formData.images.every(img => !img || img.trim() === "")) {
      alert(t('noImagesAdded') || "Please add at least one image.");
      return;
    }
    
    // Filter out empty images
    const filteredImages = formData.images.filter(img => img && img.trim() !== "");
    if (filteredImages.length === 0) {
      alert(t('noImagesAdded') || "Please add at least one image.");
      return;
    }
    
    setSaving(true);

    try {
      const workData = { ...formData, images: filteredImages };
      if (editingId) {
        // Update existing work
        const res = await fetch("/api/admin/works", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...workData }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to update work");
        }
      } else {
        // Create new work
        const res = await fetch("/api/admin/works", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(workData),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to create work");
        }
      }

      await loadWorks();
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        images: [],
        titleEn: "",
        titleRu: "",
        descriptionEn: "",
        descriptionRu: "",
      });
      alert(t('workSavedSuccessfully') || "Work saved successfully!");
    } catch (error) {
      console.error("Error saving work:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save work";
      alert(`${t('failedToSaveWork') || 'Failed to save work'}: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (work: Work) => {
    setFormData({
      images: work.images || [],
      titleEn: work.titleEn,
      titleRu: work.titleRu,
      descriptionEn: work.descriptionEn,
      descriptionRu: work.descriptionRu,
    });
    setEditingId(work.id);
    setShowAddForm(true);
  };

  const addImage = () => {
    setFormData({ ...formData, images: [...formData.images, ""] });
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const updateImage = (index: number, value: string) => {
    const newImages = [...formData.images];
    newImages[index] = value;
    setFormData({ ...formData, images: newImages });
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('areYouSureDeleteWork') || "Are you sure you want to delete this work?")) return;

    try {
      // Optimistically remove from UI
      setWorks(prevWorks => prevWorks.filter(w => w.id !== id));
      setRefreshKey(prev => prev + 1);

      const res = await fetch("/api/admin/works", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete work");
      }

      await loadWorks();
    } catch (error) {
      console.error("Error deleting work:", error);
      alert(t('failedToDeleteWork') || "Failed to delete work");
      await loadWorks();
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    try {
      const res = await fetch("/api/admin/works", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });

      if (!res.ok) {
        throw new Error("Failed to move work");
      }

      await loadWorks();
    } catch (error) {
      console.error("Error moving work:", error);
      alert(t('failedToMoveWork') || "Failed to move work");
    }
  };

  if (loading) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
        <div className="text-center">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">{t('manageWorks')}</h1>
        <Link
          href="/admin"
          className="text-sm text-[var(--accent-gold)] hover:underline"
        >
          {t('backToAdmin')}
        </Link>
      </div>

      <div className="mb-6">
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({
              images: [],
              titleEn: "",
              titleRu: "",
              descriptionEn: "",
              descriptionRu: "",
            });
          }}
          className="px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-medium text-base sm:text-sm w-full sm:w-auto min-h-[44px] sm:min-h-0 shadow-lg active:scale-95 transition-all"
        >
          + {t('addWork')}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border-2 border-[var(--border-color)] p-4 sm:p-6 bg-white dark:bg-[var(--space-black)]">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingId ? t('editWork') : t('addWork')}
          </h2>

          <div className="grid gap-4 sm:gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium">{t('selectImage')} ({formData.images.length})</label>
                <button
                  type="button"
                  onClick={addImage}
                  className="px-4 py-2 rounded-lg border-2 border-[var(--border-color)] text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] active:scale-95"
                >
                  + {t('addImage')}
                </button>
              </div>
              {formData.images.length === 0 && (
                <div className="text-sm text-zinc-500 mb-2">{t('noImagesAdded')}</div>
              )}
              {formData.images.map((img, index) => (
                <div key={index} className="mb-4 space-y-2">
                  <div className="flex gap-2">
                    {loadingImages ? (
                      <div className="flex-1 text-sm text-zinc-500">{t('loadingImages')}</div>
                    ) : (
                      <select
                        value={img}
                        onChange={(e) => updateImage(index, e.target.value)}
                        className="flex-1 h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                      >
                        <option value="">{t('selectAnImage')}</option>
                        {availableImages.map((availableImg) => (
                          <option key={availableImg} value={availableImg}>
                            {availableImg}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="px-4 py-2 rounded-lg border-2 border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] sm:min-h-0 active:scale-95"
                    >
                      {t('removeImage')}
                    </button>
                  </div>
                  {img && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30">
                      <Image
                        src={img}
                        alt={`Preview ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('title')} (English)</label>
              <input
                type="text"
                value={formData.titleEn}
                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('title')} (Русский)</label>
              <input
                type="text"
                value={formData.titleRu}
                onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('description')} (English)</label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                rows={4}
                className="w-full rounded-lg border-2 border-[var(--border-color)] px-4 py-3 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm min-h-[100px] focus:border-[var(--accent-gold)] focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('description')} (Русский)</label>
              <textarea
                value={formData.descriptionRu}
                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                rows={4}
                className="w-full rounded-lg border-2 border-[var(--border-color)] px-4 py-3 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm min-h-[100px] focus:border-[var(--accent-gold)] focus:outline-none"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0 shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? t('saving') : editingId ? t('updateWork') : t('addWork')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({
                    images: [],
                    titleEn: "",
                    titleRu: "",
                    descriptionEn: "",
                    descriptionRu: "",
                  });
                }}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 rounded-full border-2 border-[var(--border-color)] font-medium text-base sm:text-sm min-h-[44px] sm:min-h-0 active:scale-95 transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {works.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            {t('noWorksFound')}
          </div>
        ) : (
          works.map((work, index) => (
            <div
              key={`${work.id}-${refreshKey}`}
              className="rounded-2xl border-2 border-[var(--border-color)] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30 flex-shrink-0">
                  {work.images && work.images.length > 0 && work.images[0] ? (
                    <>
                      <Image
                        src={work.images[0]}
                        alt={language === 'ru' ? work.titleRu : work.titleEn}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {work.images.length > 1 && (
                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{work.images.length - 1}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
                      {t('noImage')}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm sm:text-base mb-1">
                    {language === 'ru' ? work.titleRu : work.titleEn}
                  </div>
                  <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 line-clamp-2">
                    {language === 'ru' ? work.descriptionRu : work.descriptionEn}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => handleMove(work.id, "up")}
                  disabled={index === 0}
                  className="px-2 py-1.5 sm:px-3 sm:py-1 rounded-lg border-2 border-[var(--border-color)] text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title={t('moveUp')}
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(work.id, "down")}
                  disabled={index === works.length - 1}
                  className="px-2 py-1.5 sm:px-3 sm:py-1 rounded-lg border-2 border-[var(--border-color)] text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title={t('moveDown')}
                >
                  ↓
                </button>
                <button
                  onClick={() => handleEdit(work)}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-[var(--border-color)] text-xs sm:text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 shadow-sm"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => handleDelete(work.id)}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-red-300 text-red-600 text-xs sm:text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 shadow-sm"
                >
                  {t('delete')}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


