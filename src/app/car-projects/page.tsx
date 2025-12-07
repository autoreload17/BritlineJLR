"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

type CarProject = {
  id: string;
  images: string[]; // Array of image paths
  order: number;
  createdAt: string;
};

export default function CarProjectsPage() {
  const { t } = useLanguage();
  const [projects, setProjects] = useState<CarProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [allImages, setAllImages] = useState<string[]>([]);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  useEffect(() => {
    loadProjects();
    
    // Cleanup: restore body scroll on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const loadProjects = async () => {
    try {
      const res = await fetch("/api/admin/car-projects");
      const data = await res.json();
      const projectsArray = Array.isArray(data) ? data : [];
      setProjects(projectsArray);
      
      // Flatten all images from all projects into a single array
      const images: string[] = [];
      projectsArray.forEach((project: CarProject) => {
        if (project.images && project.images.length > 0) {
          images.push(...project.images);
        }
      });
      setAllImages(images);
    } catch (error) {
      console.error("Failed to load car projects:", error);
      setProjects([]);
      setAllImages([]);
    } finally {
      setLoading(false);
    }
  };

  const openGallery = useCallback((imageIndex: number) => {
    setSelectedImageIndex(imageIndex);
    // Prevent body scroll when gallery is open
    document.body.style.overflow = 'hidden';
  }, []);

  const closeGallery = useCallback(() => {
    setSelectedImageIndex(null);
    document.body.style.overflow = 'unset';
  }, []);

  const nextImage = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex < allImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  }, [selectedImageIndex, allImages.length]);

  const prevImage = useCallback(() => {
    if (selectedImageIndex !== null && selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  }, [selectedImageIndex]);

  // Keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeGallery();
      } else if (e.key === 'ArrowRight' && selectedImageIndex < allImages.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      } else if (e.key === 'ArrowLeft' && selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, allImages.length, closeGallery]);

  // Touch gestures for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    }
    if (isRightSwipe) {
      prevImage();
    }
  };
  
  return (
    <section className="container-padded mx-auto max-w-6xl py-16">
      <h1 className="text-4xl font-semibold tracking-tight">{t('carProjects').replace('CAR PROJECTS', 'Car Projects').replace('ПРОЕКТЫ', 'Проекты')}</h1>
      
      {loading ? (
        <div className="mt-10 flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block w-8 h-8 border-4 border-[var(--accent-gold)] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">{t('loading')}</p>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="mt-10 text-center text-zinc-600 dark:text-zinc-400">
          <p className="mb-4">{t('galleryComingSoon')}</p>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-xl bg-silver/20" />
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="mt-10 grid grid-cols-2 md:grid-cols-3 gap-6">
            {allImages.map((image, index) => (
              <div
                key={`image-${index}`}
                onClick={() => openGallery(index)}
                className="rounded-xl border border-[var(--border-color)] overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              >
                <div className="relative aspect-video bg-silver/20 dark:bg-zinc-800/30">
                  <Image
                    src={image}
                    alt={`Car project image ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    unoptimized
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Fullscreen Gallery Modal */}
          {selectedImageIndex !== null && (
            <div
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
              onClick={closeGallery}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
            >
              {/* Close Button */}
              <button
                onClick={closeGallery}
                className="absolute top-4 right-4 z-[101] text-white hover:text-[var(--accent-gold)] transition-colors p-2"
                aria-label="Close gallery"
              >
                <svg
                  className="w-8 h-8 sm:w-10 sm:h-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Previous Button */}
              {selectedImageIndex > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    prevImage();
                  }}
                  className="absolute left-2 sm:left-4 z-[101] text-white hover:text-[var(--accent-gold)] transition-colors p-2 sm:p-4 bg-black/50 rounded-full"
                  aria-label="Previous image"
                >
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
              )}

              {/* Next Button */}
              {selectedImageIndex < allImages.length - 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    nextImage();
                  }}
                  className="absolute right-2 sm:right-4 z-[101] text-white hover:text-[var(--accent-gold)] transition-colors p-2 sm:p-4 bg-black/50 rounded-full"
                  aria-label="Next image"
                >
                  <svg
                    className="w-6 h-6 sm:w-8 sm:h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              )}

              {/* Image Counter */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-[101] text-white text-sm sm:text-base bg-black/50 px-4 py-2 rounded-full">
                {selectedImageIndex + 1} / {allImages.length}
              </div>

              {/* Image Container */}
              <div
                className="relative w-full h-full flex items-center justify-center max-w-7xl max-h-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative w-full h-full flex items-center justify-center">
                  <Image
                    src={allImages[selectedImageIndex]}
                    alt={`Car project image ${selectedImageIndex + 1}`}
                    fill
                    className="object-contain p-4 sm:p-8"
                    unoptimized
                    priority
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}






