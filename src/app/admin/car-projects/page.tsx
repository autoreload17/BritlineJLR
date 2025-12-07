"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

type CarProject = {
  id: string;
  images: string[]; // Array of image paths
  order: number;
  createdAt: string;
};

export default function CarProjectsAdminPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<CarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const [formData, setFormData] = useState<Omit<CarProject, "id" | "createdAt" | "order">>({
    images: [],
  });

  useEffect(() => {
    loadProjects();
    loadImages();
    
    // Auto-refresh every 10 seconds (silently)
    const interval = setInterval(() => {
      loadProjects(false);
    }, 10000);
    
    const handleFocus = () => {
      loadProjects(false);
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadProjects = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const res = await fetch("/api/admin/car-projects");
      const data = await res.json();
      const projectsArray = Array.isArray(data) ? data : [];
      
      setProjects(prevProjects => {
        const prevIds = prevProjects.map(p => p.id).sort().join(',');
        const newIds = projectsArray.map(p => p.id).sort().join(',');
        if (prevIds !== newIds || prevProjects.length !== projectsArray.length) {
          setRefreshKey(prev => prev + 1);
          return projectsArray;
        }
        return prevProjects;
      });
      
      return projectsArray;
    } catch (error) {
      console.error("Failed to load car projects:", error);
      if (showLoading) {
        setProjects([]);
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
      // Load images from /public/car-projects/ directory
      const res = await fetch("/api/admin/car-project-images");
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
      const projectData = { ...formData, images: filteredImages };
      if (editingId) {
        // Update existing project
        const res = await fetch("/api/admin/car-projects", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...projectData }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to update car project");
        }
      } else {
        // Create new project
        const res = await fetch("/api/admin/car-projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectData),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(errorText || "Failed to create car project");
        }
      }

      await loadProjects();
      setShowAddForm(false);
      setEditingId(null);
      setFormData({
        images: [],
      });
      alert(t('carProjectSavedSuccessfully') || "Car project saved successfully!");
    } catch (error) {
      console.error("Error saving car project:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save car project";
      alert(`${t('failedToSaveCarProject') || 'Failed to save car project'}: ${errorMessage}`);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (project: CarProject) => {
    setFormData({
      images: project.images || [],
    });
    setEditingId(project.id);
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
    if (!confirm(t('areYouSureDeleteCarProject') || "Are you sure you want to delete this car project?")) return;

    try {
      // Optimistically remove from UI
      setProjects(prevProjects => prevProjects.filter(p => p.id !== id));
      setRefreshKey(prev => prev + 1);

      const res = await fetch("/api/admin/car-projects", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to delete car project");
      }

      await loadProjects();
    } catch (error) {
      console.error("Error deleting car project:", error);
      alert(t('failedToDeleteCarProject') || "Failed to delete car project");
      await loadProjects();
    }
  };

  const handleMove = async (id: string, direction: "up" | "down") => {
    try {
      const res = await fetch("/api/admin/car-projects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, direction }),
      });

      if (!res.ok) {
        throw new Error("Failed to move car project");
      }

      await loadProjects();
    } catch (error) {
      console.error("Error moving car project:", error);
      alert(t('failedToMoveCarProject') || "Failed to move car project");
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
    <div className="container-padded mx-auto max-w-6xl py-4 sm:py-6 md:py-12 px-3 sm:px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 md:mb-8 gap-3 sm:gap-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold">{t('manageCarProjects')}</h1>
        <Link
          href="/admin"
          className="text-xs sm:text-sm text-[var(--accent-gold)] hover:underline whitespace-nowrap"
        >
          {t('backToAdmin')}
        </Link>
      </div>

      <div className="mb-4 sm:mb-6">
        <button
          onClick={() => {
            setShowAddForm(true);
            setEditingId(null);
            setFormData({
              images: [],
            });
          }}
          className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-medium text-sm sm:text-base md:text-sm min-h-[44px] sm:min-h-0 shadow-lg active:scale-95 transition-all"
        >
          + {t('addCarProject')}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border-2 border-[var(--border-color)] p-3 sm:p-6 bg-white dark:bg-[var(--space-black)]">
          <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4">
            {editingId ? t('editCarProject') : t('addCarProject')}
          </h2>

          <div className="grid gap-3 sm:gap-4 md:gap-6">
            <div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 mb-2">
                <label className="block text-xs sm:text-sm font-medium">{t('selectImage')} ({formData.images.length})</label>
                <button
                  type="button"
                  onClick={addImage}
                  className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg border-2 border-[var(--border-color)] text-xs sm:text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[40px] sm:min-h-[36px] active:scale-95"
                >
                  + {t('addImage')}
                </button>
              </div>
              {formData.images.length === 0 && (
                <div className="text-xs sm:text-sm text-zinc-500 mb-2">{t('noImagesAdded')}</div>
              )}
              {formData.images.map((img, index) => (
                <div key={index} className="mb-3 sm:mb-4 space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    {loadingImages ? (
                      <div className="flex-1 text-xs sm:text-sm text-zinc-500 py-3">{t('loadingImages')}</div>
                    ) : (
                      <select
                        value={img}
                        onChange={(e) => updateImage(index, e.target.value)}
                        className="flex-1 h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-3 sm:px-4 bg-white dark:bg-[var(--space-black)] text-sm sm:text-base md:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                      >
                        <option value="">{t('selectAnImage')}</option>
                        {availableImages.map((availableImg) => (
                          <option key={availableImg} value={availableImg}>
                            {availableImg.length > 40 ? `${availableImg.substring(0, 37)}...` : availableImg}
                          </option>
                        ))}
                      </select>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="w-full sm:w-auto px-3 sm:px-4 py-2 rounded-lg border-2 border-red-300 text-red-600 text-xs sm:text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] sm:min-h-0 active:scale-95 whitespace-nowrap"
                    >
                      {t('removeImage')}
                    </button>
                  </div>
                  {img && (
                    <div className="relative w-full h-40 sm:h-48 rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30">
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

            <div className="flex flex-col gap-2.5 sm:gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="w-full px-4 sm:px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-medium text-sm sm:text-base md:text-sm min-h-[44px] sm:min-h-0 shadow-lg active:scale-95 transition-all disabled:opacity-50"
              >
                {saving ? t('saving') : editingId ? t('updateCarProject') : t('addCarProject')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingId(null);
                  setFormData({
                    images: [],
                  });
                }}
                className="w-full px-4 sm:px-6 py-3 sm:py-2 rounded-full border-2 border-[var(--border-color)] font-medium text-sm sm:text-base md:text-sm min-h-[44px] sm:min-h-0 active:scale-95 transition-all"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
            {t('noCarProjectsFound')}
          </div>
        ) : (
          projects.map((project, index) => (
            <div
              key={`${project.id}-${refreshKey}`}
              className="rounded-2xl border-2 border-[var(--border-color)] p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            >
              <div className="flex gap-4 flex-1 min-w-0">
                <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30 flex-shrink-0">
                  {project.images && project.images.length > 0 && project.images[0] ? (
                    <>
                      <Image
                        src={project.images[0]}
                        alt={`Car project ${index + 1}`}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      {project.images.length > 1 && (
                        <div className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 py-1 rounded">
                          +{project.images.length - 1}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs">
                      {t('noImage')}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex items-center">
                  <div className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                    {project.images.length} {project.images.length === 1 ? 'изображение' : 'изображений'}
                  </div>
                </div>
              </div>
              <div className="flex gap-1.5 sm:gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <button
                  onClick={() => handleMove(project.id, "up")}
                  disabled={index === 0}
                  className="px-2 py-1.5 sm:px-3 sm:py-1 rounded-lg border-2 border-[var(--border-color)] text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title={t('moveUp')}
                >
                  ↑
                </button>
                <button
                  onClick={() => handleMove(project.id, "down")}
                  disabled={index === projects.length - 1}
                  className="px-2 py-1.5 sm:px-3 sm:py-1 rounded-lg border-2 border-[var(--border-color)] text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                  title={t('moveDown')}
                >
                  ↓
                </button>
                <button
                  onClick={() => handleEdit(project)}
                  className="flex-1 sm:flex-none px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-lg border-2 border-[var(--border-color)] text-xs sm:text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[36px] sm:min-h-0 active:scale-95 shadow-sm"
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => handleDelete(project.id)}
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

