"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";

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

type Vehicle = {
  brand: string;
  value: string;
  title: string;
  image: string;
  years: Array<{ value: string; label: string }>;
};

type ServiceWithVehicle = ServiceOption & {
  brand: string;
  model: string;
  year: string;
  category: string;
  index: number;
};

export default function ServicesAdminPage() {
  const { t, language } = useLanguage();
  const [services, setServices] = useState<any>({});
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0); // Force re-render key
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("features-activation");
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<"all" | "filtered">("all");
  const [filterBrand, setFilterBrand] = useState<string>("all");
  const [filterModel, setFilterModel] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [availableImages, setAvailableImages] = useState<string[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

  const [formData, setFormData] = useState<ServiceOption>({
    title: "",
    image: "",
    price: "",
    requirements: "No",
    description: "",
    descriptionEn: "",
    descriptionRu: "",
    status: "in-stock",
  });

  useEffect(() => {
    loadServices();
    loadVehicles();
    
    // Auto-refresh every 10 seconds (silently, without loading indicator)
    const interval = setInterval(() => {
      loadServices(false);
    }, 10000);
    
    // Refresh when window gains focus (silently)
    const handleFocus = () => {
      loadServices(false);
      loadVehicles();
    };
    window.addEventListener('focus', handleFocus);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  useEffect(() => {
    if (selectedCategory && showAddForm) {
      loadImages(selectedCategory);
    }
  }, [selectedCategory, showAddForm]);

  // Clear selectedModel and selectedYear when selectedBrand changes
  useEffect(() => {
    if (selectedBrand) {
      const availableVehiclesForBrand = vehicles.filter(v => v.brand === selectedBrand);
      const modelExists = availableVehiclesForBrand.some(v => v.value === selectedModel);
      if (!modelExists) {
        setSelectedModel("");
        setSelectedYear("");
      }
    } else {
      setSelectedModel("");
      setSelectedYear("");
    }
  }, [selectedBrand, vehicles]);

  // Clear selectedYear when selectedModel changes
  useEffect(() => {
    if (selectedModel) {
      const availableVehiclesForBrand = vehicles.filter(v => v.brand === selectedBrand);
      const selectedVehicle = availableVehiclesForBrand.find(v => v.value === selectedModel);
      const availableYears = selectedVehicle?.years || [];
      const yearExists = availableYears.some(y => y.value === selectedYear);
      if (!yearExists) {
        setSelectedYear("");
      }
    } else {
      setSelectedYear("");
    }
  }, [selectedModel, selectedBrand, vehicles]);

  const loadServices = async (showLoading = true, forceReload = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      // Add cache-busting parameter to force fresh data from server
      const cacheBuster = forceReload ? `?t=${Date.now()}` : '';
      const res = await fetch(`/api/admin/services${cacheBuster}`);
      const data = await res.json();
      const servicesData = data || {};
      
      
      // Only update if data actually changed OR if forceReload is true
      setServices((prevServices: any) => {
        if (forceReload) {
          setRefreshKey(prev => prev + 1);
          return servicesData;
        }
        const prevStr = JSON.stringify(prevServices);
        const newStr = JSON.stringify(servicesData);
        if (prevStr !== newStr) {
          setRefreshKey(prev => prev + 1);
          return servicesData;
        }
        return prevServices;
      });
      
      return servicesData;
    } catch (error) {
      console.error("Failed to load services:", error);
      if (showLoading) {
        setServices({});
        setRefreshKey(prev => prev + 1);
      }
      return {};
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const loadVehicles = async () => {
    try {
      const res = await fetch("/api/admin/vehicles");
      const data = await res.json();
      setVehicles(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to load vehicles:", error);
    }
  };

  const loadImages = async (category: string) => {
    setLoadingImages(true);
    try {
      const res = await fetch(`/api/admin/service-images?category=${category}`);
      const data = await res.json();
      setAvailableImages(data.images || []);
    } catch (error) {
      console.error("Failed to load images:", error);
      setAvailableImages([]);
    } finally {
      setLoadingImages(false);
    }
  };

  // Get available models from vehicles (not from services)
  // Normalize selectedBrand for comparison
  const normalizedSelectedBrand = selectedBrand.trim().toLowerCase().replace(/\s+/g, '-');
  const availableVehicles = vehicles.filter(v => {
    const normalizedVehicleBrand = v.brand?.trim().toLowerCase().replace(/\s+/g, '-') || '';
    return normalizedVehicleBrand === normalizedSelectedBrand;
  });
  
  // Normalize selectedModel for comparison
  const normalizedSelectedModel = selectedModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const selectedVehicle = availableVehicles.find(v => {
    const normalizedVehicleValue = v.value?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
    return normalizedVehicleValue === normalizedSelectedModel || v.value === selectedModel;
  });
  const availableYears = selectedVehicle?.years || [];

  // Get services data for selected vehicle (with normalized lookup)
  const normalizedBrandForServices = selectedBrand.trim().toLowerCase().replace(/\s+/g, '-');
  const normalizedModelForServices = selectedModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  
  // Try to find services with normalized keys first, then try original keys
  let brandData = services[normalizedBrandForServices] || services[selectedBrand];
  let modelData = brandData?.[normalizedModelForServices] || brandData?.[selectedModel];
  const yearData = modelData?.[selectedYear] as Record<string, ServiceOption[]> | undefined;
  const availableCategories = yearData ? Object.keys(yearData) : [];

  // Collect all services with vehicle information
  const getAllServices = (): ServiceWithVehicle[] => {
    const allServices: ServiceWithVehicle[] = [];
    
    if (services && typeof services === 'object' && !Array.isArray(services)) {
      for (const brand in services) {
        if (services[brand] && typeof services[brand] === 'object') {
          for (const model in services[brand]) {
            if (services[brand][model] && typeof services[brand][model] === 'object') {
              for (const year in services[brand][model]) {
                if (services[brand][model][year] && typeof services[brand][model][year] === 'object') {
                  for (const category in services[brand][model][year]) {
                    const serviceArray = services[brand][model][year][category];
                    if (Array.isArray(serviceArray)) {
                      serviceArray.forEach((service: ServiceOption, index: number) => {
                        // IMPORTANT: Preserve all properties including descriptionEn and descriptionRu
                        allServices.push({
                          ...service,
                          // Explicitly preserve descriptionEn and descriptionRu
                          descriptionEn: service.descriptionEn,
                          descriptionRu: service.descriptionRu,
                          brand,
                          model,
                          year,
                          category,
                          index,
                        });
                      });
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    
    return allServices;
  };

  const allServices = getAllServices();

  // Filter services by brand and model first to get available years and categories (with normalized comparison)
  let servicesForFilters = allServices;
  if (filterBrand !== "all") {
    servicesForFilters = servicesForFilters.filter(s => {
      const normalizedServiceBrand = s.brand?.trim().toLowerCase().replace(/\s+/g, '-') || '';
      const normalizedFilterBrand = filterBrand.trim().toLowerCase().replace(/\s+/g, '-');
      return normalizedServiceBrand === normalizedFilterBrand || s.brand === filterBrand;
    });
  }
  if (filterModel !== "all") {
    servicesForFilters = servicesForFilters.filter(s => {
      const normalizedServiceModel = s.model?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      const normalizedFilterModel = filterModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return normalizedServiceModel === normalizedFilterModel || s.model === filterModel;
    });
  }

  // Get unique years and categories from filtered services (based on selected brand/model)
  const filterYears = Array.from(new Set(servicesForFilters.map(s => s.year))).sort();
  const filterCategories = Array.from(new Set(servicesForFilters.map(s => s.category))).sort();

  // Filter all services with normalized comparison
  const filteredAllServices = allServices.filter((service) => {
    if (filterBrand !== "all") {
      const normalizedServiceBrand = service.brand?.trim().toLowerCase().replace(/\s+/g, '-') || '';
      const normalizedFilterBrand = filterBrand.trim().toLowerCase().replace(/\s+/g, '-');
      if (normalizedServiceBrand !== normalizedFilterBrand && service.brand !== filterBrand) return false;
    }
    if (filterModel !== "all") {
      const normalizedServiceModel = service.model?.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';
      const normalizedFilterModel = filterModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      if (normalizedServiceModel !== normalizedFilterModel && service.model !== filterModel) return false;
    }
    if (filterYear !== "all" && service.year !== filterYear) return false;
    if (filterCategory !== "all" && service.category !== filterCategory) return false;
    if (searchQuery && !service.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  // Get vehicle title by model value
  const getVehicleTitle = (brand: string, modelValue: string): string => {
    const vehicle = vehicles.find(v => v.brand === brand && v.value === modelValue);
    return vehicle?.title || modelValue;
  };

  const categoryLabels: Record<string, string> = {
    "features-activation": t('featuresActivation'),
    "retrofits": t('retrofits'),
    "power-upgrade": t('powerUpgrade'),
    "accessories": t('accessories'),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate that image is selected if availableImages exist
    if (availableImages.length > 0 && !formData.image) {
      if (!confirm("No image selected. Do you want to continue without an image?")) {
        return;
      }
    }
    
    setSaving(true);

    try {
      // Prepare service data
      const serviceData = {
        ...formData,
        // Ensure image path is properly formatted
        image: formData.image || "",
        // Ensure descriptionEn and descriptionRu are included
        // Use explicit check to preserve empty strings
        descriptionEn: formData.descriptionEn !== undefined ? formData.descriptionEn : "",
        descriptionRu: formData.descriptionRu !== undefined ? formData.descriptionRu : "",
      };
      
      

      if (editingIndex !== null) {
        // Update existing service
        // Remove index from serviceData if it exists (it's a client-side field)
        const cleanServiceData: ServiceOption = {
          title: serviceData.title,
          image: serviceData.image,
          price: serviceData.price,
          requirements: serviceData.requirements,
          description: serviceData.description,
          // Preserve descriptionEn and descriptionRu even if they are empty strings
          descriptionEn: serviceData.descriptionEn !== undefined ? serviceData.descriptionEn : '',
          descriptionRu: serviceData.descriptionRu !== undefined ? serviceData.descriptionRu : '',
          status: serviceData.status,
        };
        
        // Verify that the category array exists and has items
        const brandData = services[selectedBrand];
        const modelData = brandData?.[selectedModel];
        const yearData = modelData?.[selectedYear] as Record<string, ServiceOption[]> | undefined;
        const categoryArray = yearData?.[selectedCategory];
        
        // Validate index before sending
        if (!categoryArray || !Array.isArray(categoryArray) || categoryArray.length === 0) {
          alert(t('cannotEditCategoryEmpty'));
          setEditingIndex(null);
          return;
        }
        
        if (editingIndex < 0 || editingIndex >= categoryArray.length) {
          alert(t('invalidIndexCategory').replace('{count}', categoryArray.length.toString()));
          setEditingIndex(null);
          return;
        }
        
        // Normalize brand and model before sending
        const normalizedBrand = selectedBrand.trim().toLowerCase().replace(/\s+/g, '-');
        const normalizedModel = selectedModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        
        const response = await fetch("/api/admin/services", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: normalizedBrand,
            model: normalizedModel,
            year: selectedYear,
            category: selectedCategory,
            index: editingIndex,
            service: cleanServiceData,
          }),
        });
        
        if (!response.ok) {
          let errorData: any = {};
          let errorText = "";
          
          try {
            // Try to get response as text first
            errorText = await response.text();
            console.error("Raw error response text:", errorText);
            
            // Try to parse as JSON
            try {
              errorData = JSON.parse(errorText);
            } catch (parseError) {
              console.error("Failed to parse error as JSON, using raw text");
              errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
            }
          } catch (e) {
            console.error("Failed to read error response:", e);
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          
          const errorMsg = errorData.message || errorData.error || `Failed to update service (HTTP ${response.status})`;
          console.error("=== SERVER ERROR DETAILS ===");
          console.error("Status:", response.status, response.statusText);
          console.error("Error data:", errorData);
          console.error("Error text:", errorText);
          console.error("Request details:", {
            brand: selectedBrand,
            model: selectedModel,
            year: selectedYear,
            category: selectedCategory,
            index: editingIndex,
            serviceTitle: serviceData?.title
          });
          console.error("============================");
          
          // Include details in error message if available
          let fullErrorMsg = errorMsg;
          if (errorData.details) {
            fullErrorMsg += `\n\nDetails: ${JSON.stringify(errorData.details, null, 2)}`;
          }
          if (errorText && errorText !== errorMsg) {
            fullErrorMsg += `\n\nRaw response: ${errorText.substring(0, 200)}`;
          }
          
          throw new Error(fullErrorMsg);
        }
      } else {
        // Add new service
        // Normalize brand and model before sending
        const normalizedBrand = selectedBrand.trim().toLowerCase().replace(/\s+/g, '-');
        const normalizedModel = selectedModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        
        const response = await fetch("/api/admin/services", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            brand: normalizedBrand,
            model: normalizedModel,
            year: selectedYear,
            category: selectedCategory,
            service: serviceData,
          }),
        });
        
        if (!response.ok) {
          let errorData: any = {};
          let errorText = "";
          
          try {
            // Try to get response as text first
            errorText = await response.text();
            console.error("Raw error response text:", errorText);
            
            // Try to parse as JSON
            try {
              errorData = JSON.parse(errorText);
            } catch (parseError) {
              console.error("Failed to parse error as JSON, using raw text");
              errorData = { error: errorText || `HTTP ${response.status}: ${response.statusText}` };
            }
          } catch (e) {
            console.error("Failed to read error response:", e);
            errorData = { error: `HTTP ${response.status}: ${response.statusText}` };
          }
          
          const errorMsg = errorData.message || errorData.error || `Failed to save service (HTTP ${response.status})`;
          console.error("=== SERVER ERROR DETAILS ===");
          console.error("Status:", response.status, response.statusText);
          console.error("Error data:", errorData);
          console.error("Error text:", errorText);
          console.error("============================");
          
          // Include details in error message if available
          let fullErrorMsg = errorMsg;
          if (errorData.details) {
            fullErrorMsg += `\n\nDetails: ${JSON.stringify(errorData.details, null, 2)}`;
          }
          if (errorText && errorText !== errorMsg) {
            fullErrorMsg += `\n\nRaw response: ${errorText.substring(0, 200)}`;
          }
          
          throw new Error(fullErrorMsg);
        }
      }
      
      // Reload services to show updated data
      await loadServices();
      await loadVehicles(); // Also reload vehicles to get any new brands/models
      setFormData({
        title: "",
        image: "",
        price: "",
        requirements: "No",
        description: "",
        descriptionEn: "",
        descriptionRu: "",
        status: "in-stock",
      });
      setShowAddForm(false);
      setEditingIndex(null);
      setSelectedCategory(""); // Reset category selection to show all services
    } catch (error) {
      console.error("Error saving service:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("Full error details:", error);
      
      // Try to get more details from the error
      let detailedMessage = errorMessage;
      if (error instanceof Error && error.message) {
        detailedMessage = error.message;
      }
      
      // Show detailed error to user
      alert(`Failed to save service!\n\nError: ${detailedMessage}\n\nPlease check:\n1. Browser console (F12) for more details\n2. Netlify Functions logs for server-side errors\n\nIf the problem persists, the error details are in the browser console.`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container-padded mx-auto max-w-6xl py-12">
        <p>{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="container-padded mx-auto max-w-6xl py-6 sm:py-12 px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
        <h1 className="text-2xl sm:text-3xl font-semibold">{t('manageServices')}</h1>
        <Link href="/admin" className="text-sm text-zinc-600 hover:underline w-full sm:w-auto text-center sm:text-left">{t('backToAdmin')}</Link>
      </div>

      {/* View Mode Toggle */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <button
          onClick={() => setViewMode("all")}
          className={`px-4 py-3 sm:py-2 rounded-lg border-2 text-sm sm:text-base font-medium min-h-[44px] sm:min-h-0 shadow-sm active:scale-95 transition-all ${
            viewMode === "all"
              ? "bg-[var(--accent-gold)] text-white border-[var(--accent-gold)]"
              : "border-[var(--border-color)] hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          {t('allServices')} ({allServices.length})
        </button>
        <button
          onClick={() => setViewMode("filtered")}
          className={`px-4 py-3 sm:py-2 rounded-lg border-2 text-sm sm:text-base font-medium min-h-[44px] sm:min-h-0 shadow-sm active:scale-95 transition-all ${
            viewMode === "filtered"
              ? "bg-[var(--accent-gold)] text-white border-[var(--accent-gold)]"
              : "border-[var(--border-color)] hover:bg-zinc-50 dark:hover:bg-zinc-900"
          }`}
        >
          {t('addEditServices')}
        </button>
      </div>

      {/* All Services View */}
      {viewMode === "all" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <select
              value={filterBrand}
              onChange={(e) => {
                setFilterBrand(e.target.value);
                setFilterModel("all");
                setFilterYear("all");
                setFilterCategory("all");
              }}
              className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
            >
              <option value="all">{t('allBrands')}</option>
              {Array.from(new Set(vehicles.map(v => v.brand)))
                .sort((a, b) => {
                  // Sort: land-rover first, jaguar second, then alphabetically
                  if (a === "land-rover") return -1;
                  if (b === "land-rover") return 1;
                  if (a === "jaguar") return -1;
                  if (b === "jaguar") return 1;
                  return a.localeCompare(b);
                })
                .map(brand => {
                  const displayName = brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                  return (
                    <option key={brand} value={brand}>{displayName}</option>
                  );
                })
              }
            </select>

            <select
              key={`filter-model-${filterBrand}`}
              value={filterModel}
              onChange={(e) => {
                setFilterModel(e.target.value);
                setFilterYear("all");
                setFilterCategory("all");
              }}
              className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
              disabled={filterBrand === "all"}
            >
              <option value="all">{t('allModels')}</option>
              {filterBrand !== "all" &&
                vehicles
                  .filter((v) => {
                    const normalizedVehicleBrand = v.brand?.trim().toLowerCase().replace(/\s+/g, '-') || '';
                    const normalizedFilterBrand = filterBrand.trim().toLowerCase().replace(/\s+/g, '-');
                    return normalizedVehicleBrand === normalizedFilterBrand || v.brand === filterBrand;
                  })
                  .map((vehicle) => (
                    <option key={vehicle.value} value={vehicle.value}>
                      {vehicle.title}
                    </option>
                  ))}
            </select>

            <select
              key={`filter-year-${filterBrand}-${filterModel}`}
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
              disabled={filterBrand === "all" && filterModel === "all"}
            >
              <option value="all">{t('allYears')}</option>
              {filterYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
            >
              <option value="all">{t('allCategories')}</option>
              {filterCategories.map((category) => {
                const displayName = categoryLabels[category] || category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                return (
                  <option key={category} value={category}>{displayName}</option>
                );
              })}
            </select>

            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchByTitle')}
              className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] flex-1 text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
            />
          </div>

          {/* Services Table - Desktop / Cards - Mobile */}
          <div className="hidden md:block rounded-2xl border-2 border-[var(--border-color)] overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-zinc-50 dark:bg-zinc-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('image')}</th>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('title')}</th>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('vehicleVIN')}</th>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('category')}</th>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('price')}</th>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('status')}</th>
                    <th className="px-4 py-3 text-left text-sm sm:text-sm font-semibold">{t('actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAllServices.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-zinc-500">
                        {allServices.length === 0
                          ? "No services found. Add services using the 'Add/Edit Services' view."
                          : "No services match your filters."}
                      </td>
                    </tr>
                  ) : (
                    filteredAllServices.map((service, idx) => (
                      <tr key={`${service.brand}-${service.model}-${service.year}-${service.category}-${service.index}-${refreshKey}`} className="border-t border-[var(--border-color)] hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                        <td className="px-4 py-3">
                          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30">
                            {service.image && !service.image.includes(".фв") ? (
                              <Image
                                src={service.image}
                                alt={service.title}
                                fill
                                className="object-cover"
                                unoptimized
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display = 'none';
                                  const parent = (e.target as HTMLImageElement).parentElement;
                                  if (parent && !parent.querySelector('.no-image-message')) {
                                    const errorMsg = document.createElement("div");
                                    errorMsg.className = "no-image-message absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs px-2 text-center";
                                    errorMsg.textContent = "No image";
                                    parent.appendChild(errorMsg);
                                  }
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs px-2 text-center">
                                No image
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{service.title}</div>
                          {(service.descriptionEn || service.descriptionRu || service.description) && (
                            <div className="text-xs text-zinc-500 mt-1 line-clamp-1">
                              {language === 'ru' ? (service.descriptionRu || service.description || '') : (service.descriptionEn || service.description || '')}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm">
                            <div className="font-medium capitalize">{service.brand.replace("-", " ")}</div>
                            <div className="text-xs text-zinc-500">
                              {getVehicleTitle(service.brand, service.model)} / {service.year}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                            {categoryLabels[service.category] || service.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium">{service.price}</td>
                        <td className="px-4 py-3">
                          {service.status === "in-stock" && (
                            <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              IN STOCK
                            </span>
                          )}
                          {service.status === "unavailable" && (
                            <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              UNAVAILABLE
                            </span>
                          )}
                          {service.status === "coming-soon" && (
                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                              COMING SOON
                            </span>
                          )}
                          {!service.status && (
                            <span className="text-xs px-2 py-1 rounded bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400">
                              No status
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                // Force reload services from server (bypass cache)
                                const freshServices = await loadServices(false, true);
                                
                                // Try multiple ways to find the service (normalized and original keys)
                                const normalizedBrand = service.brand.trim().toLowerCase().replace(/\s+/g, '-');
                                const normalizedModel = service.model.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                
                                // Try all possible key combinations
                                let brandData: any = null;
                                let modelData: any = null;
                                let yearData: Record<string, ServiceOption[]> | undefined = undefined;
                                let categoryArray: ServiceOption[] | undefined = undefined;
                                
                                // Try normalized keys first
                                brandData = freshServices[normalizedBrand] || freshServices[service.brand];
                                if (brandData) {
                                  modelData = brandData[normalizedModel] || brandData[service.model];
                                  if (modelData) {
                                    yearData = modelData[service.year] as Record<string, ServiceOption[]> | undefined;
                                    if (yearData) {
                                      categoryArray = yearData[service.category];
                                    }
                                  }
                                }
                                
                                // If not found, try all brand/model combinations
                                if (!categoryArray) {
                                  for (const brandKey in freshServices) {
                                    const brand = freshServices[brandKey];
                                    if (!brand || typeof brand !== 'object') continue;
                                    
                                    // Check if this brand matches (normalized or original)
                                    const brandNormalized = brandKey.trim().toLowerCase().replace(/\s+/g, '-');
                                    if (brandNormalized !== normalizedBrand && brandKey !== service.brand) continue;
                                    
                                    for (const modelKey in brand) {
                                      const model = brand[modelKey];
                                      if (!model || typeof model !== 'object') continue;
                                      
                                      // Check if this model matches (normalized or original)
                                      const modelNormalized = modelKey.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                                      if (modelNormalized !== normalizedModel && modelKey !== service.model) continue;
                                      
                                      // Check year
                                      if (model[service.year] && typeof model[service.year] === 'object') {
                                        const year = model[service.year] as Record<string, ServiceOption[]>;
                                        
                                        // Check category
                                        if (year[service.category] && Array.isArray(year[service.category])) {
                                          brandData = brand;
                                          modelData = model;
                                          yearData = year;
                                          categoryArray = year[service.category];
                                          break;
                                        }
                                      }
                                    }
                                    if (categoryArray) break;
                                  }
                                }
                                
                                // Final validation
                                if (!categoryArray || !Array.isArray(categoryArray)) {
                                  alert(t('serviceDataChanged'));
                                  return;
                                }
                                
                                if (categoryArray.length === 0) {
                                  alert(t('cannotEditCategoryEmpty'));
                                  return;
                                }
                                
                                if (service.index >= categoryArray.length) {
                                  alert(t('invalidIndexCategory').replace('{count}', categoryArray.length.toString()));
                                  return;
                                }
                                
                                // Validate category exists
                                if (!service.category) {
                                  alert(t('cannotEditCategoryEmpty'));
                                  return;
                                }
                                
                                // Get the FRESH service data from the server
                                const freshService = categoryArray[service.index];
                                
                                setSelectedBrand(service.brand);
                                setSelectedModel(service.model);
                                setSelectedYear(service.year);
                                setSelectedCategory(service.category || 'features-activation'); // Fallback to default category
                                
                                // Load service data, ensuring descriptionEn and descriptionRu are set
                                // IMPORTANT: Always use descriptionEn/descriptionRu if they exist (even if empty string)
                                // Only use description as fallback if descriptionEn/descriptionRu are undefined or null
                                const loadedFormData = {
                                  ...freshService,
                                  descriptionEn: (freshService?.descriptionEn !== undefined && freshService?.descriptionEn !== null) 
                                    ? freshService.descriptionEn 
                                    : (freshService?.description || ''),
                                  descriptionRu: (freshService?.descriptionRu !== undefined && freshService?.descriptionRu !== null) 
                                    ? freshService.descriptionRu 
                                    : (freshService?.description || ''),
                                };
                                
                                setFormData(loadedFormData);
                                setEditingIndex(service.index);
                                setShowAddForm(true);
                                setViewMode("filtered");
                              }}
                              className="px-3 py-2 sm:py-1 text-xs sm:text-xs rounded-lg border-2 border-[var(--border-color)] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors font-medium min-h-[36px] sm:min-h-0 active:scale-95"
                            >
                              {t('edit')}
                            </button>
                            <button
                              onClick={async () => {
                                if (!confirm(`Are you sure you want to delete "${service.title}"?`)) return;
                                
                                try {
                                  // Try to delete with both normalized and original values
                                  const res = await fetch("/api/admin/services", {
                                    method: "DELETE",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({
                                      brand: service.brand,
                                      model: service.model,
                                      year: service.year,
                                      category: service.category,
                                      index: service.index,
                                    }),
                                  });
                                  if (res.ok) {
                                    // Optimistically remove the service from UI
                                    setServices((prevServices: any) => {
                                      const newServices = { ...prevServices };
                                      if (newServices[service.brand]?.[service.model]?.[service.year]?.[service.category]) {
                                        const categoryArray = [...newServices[service.brand][service.model][service.year][service.category]];
                                        categoryArray.splice(service.index, 1);
                                        newServices[service.brand][service.model][service.year][service.category] = categoryArray;
                                      }
                                      return newServices;
                                    });
                                    setRefreshKey(prev => prev + 1);
                                    // Then reload to ensure consistency
                                    await loadServices();
                                  } else {
                                    const errorText = await res.text();
                                    alert(`Failed to delete service: ${errorText || res.statusText}`);
                                  }
                                } catch (error) {
                                  console.error("Error deleting service:", error);
                                  const errorMessage = error instanceof Error ? error.message : "Failed to delete service";
                                  alert(`Failed to delete service: ${errorMessage}`);
                                }
                              }}
                              className="px-3 py-2 sm:py-1 text-xs sm:text-xs rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium min-h-[36px] sm:min-h-0 active:scale-95"
                            >
                              {t('delete')}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden space-y-4">
            {filteredAllServices.length === 0 ? (
              <div className="text-center py-8 text-zinc-500">
                {allServices.length === 0
                  ? t('noServicesFoundAdd')
                  : t('noServicesMatchFilters')}
              </div>
            ) : (
              filteredAllServices.map((service) => (
                <div key={`${service.brand}-${service.model}-${service.year}-${service.category}-${service.index}-${refreshKey}`} className="rounded-2xl border-2 border-[var(--border-color)] p-4 sm:p-6 space-y-3">
                  <div className="flex gap-4">
                    {/* Service Image */}
                    <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden border-2 border-[var(--border-color)] bg-silver/20 dark:bg-zinc-800/30 flex-shrink-0">
                      {service.image && !service.image.includes(".фв") ? (
                        <Image
                          src={service.image}
                          alt={service.title}
                          fill
                          className="object-cover"
                          unoptimized
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                            const parent = (e.target as HTMLImageElement).parentElement;
                            if (parent && !parent.querySelector('.no-image-message')) {
                              const errorMsg = document.createElement("div");
                              errorMsg.className = "no-image-message absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs px-2 text-center";
                              errorMsg.textContent = "No image";
                              parent.appendChild(errorMsg);
                            }
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs px-2 text-center">
                          No image
                        </div>
                      )}
                    </div>
                    {/* Service Info */}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-base sm:text-lg mb-1">{service.title}</div>
                      {(service.descriptionEn || service.descriptionRu || service.description) && (
                        <div className="text-sm sm:text-base text-zinc-500 dark:text-zinc-400 line-clamp-2">
                          {language === 'ru' ? (service.descriptionRu || service.description || '') : (service.descriptionEn || service.description || '')}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                      {service.brand.replace("-", " ")} / {getVehicleTitle(service.brand, service.model)} / {service.year}
                    </span>
                    <span className="text-sm px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800">
                      {categoryLabels[service.category] || service.category}
                    </span>
                    {service.status === "in-stock" && (
                      <span className="text-xs px-2 py-1 rounded bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        IN STOCK
                      </span>
                    )}
                    {service.status === "unavailable" && (
                      <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                        UNAVAILABLE
                      </span>
                    )}
                    {service.status === "coming-soon" && (
                      <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                        COMING SOON
                      </span>
                    )}
                  </div>
                  <div className="text-base sm:text-lg font-semibold">{service.price}</div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={async () => {
                        // Force reload services from server (bypass cache)
                        const freshServices = await loadServices(false, true);
                        
                        // Try multiple ways to find the service (normalized and original keys)
                        const normalizedBrand = service.brand.trim().toLowerCase().replace(/\s+/g, '-');
                        const normalizedModel = service.model.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        
                        // Try all possible key combinations
                        let brandData: any = null;
                        let modelData: any = null;
                        let yearData: Record<string, ServiceOption[]> | undefined = undefined;
                        let categoryArray: ServiceOption[] | undefined = undefined;
                        
                        // Try normalized keys first
                        brandData = freshServices[normalizedBrand] || freshServices[service.brand];
                        if (brandData) {
                          modelData = brandData[normalizedModel] || brandData[service.model];
                          if (modelData) {
                            yearData = modelData[service.year] as Record<string, ServiceOption[]> | undefined;
                            if (yearData) {
                              categoryArray = yearData[service.category];
                            }
                          }
                        }
                        
                        // If not found, try all brand/model combinations
                        if (!categoryArray) {
                          for (const brandKey in freshServices) {
                            const brand = freshServices[brandKey];
                            if (!brand || typeof brand !== 'object') continue;
                            
                            // Check if this brand matches (normalized or original)
                            const brandNormalized = brandKey.trim().toLowerCase().replace(/\s+/g, '-');
                            if (brandNormalized !== normalizedBrand && brandKey !== service.brand) continue;
                            
                            for (const modelKey in brand) {
                              const model = brand[modelKey];
                              if (!model || typeof model !== 'object') continue;
                              
                              // Check if this model matches (normalized or original)
                              const modelNormalized = modelKey.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                              if (modelNormalized !== normalizedModel && modelKey !== service.model) continue;
                              
                              // Check year
                              if (model[service.year] && typeof model[service.year] === 'object') {
                                const year = model[service.year] as Record<string, ServiceOption[]>;
                                
                                // Check category
                                if (year[service.category] && Array.isArray(year[service.category])) {
                                  brandData = brand;
                                  modelData = model;
                                  yearData = year;
                                  categoryArray = year[service.category];
                                  break;
                                }
                              }
                            }
                            if (categoryArray) break;
                          }
                        }
                        
                        // Final validation
                        if (!categoryArray || !Array.isArray(categoryArray)) {
                          alert(t('serviceDataChanged'));
                          return;
                        }
                        
                        if (categoryArray.length === 0) {
                          alert(t('cannotEditCategoryEmpty'));
                          return;
                        }
                        
                        if (service.index >= categoryArray.length) {
                          alert(t('invalidIndexCategory').replace('{count}', categoryArray.length.toString()));
                          return;
                        }
                        
                        // Get the FRESH service data from the server
                        const freshService = categoryArray[service.index];
                        
                        setSelectedBrand(service.brand);
                        setSelectedModel(service.model);
                        setSelectedYear(service.year);
                        setSelectedCategory(service.category);
                        
                        // Load service data, ensuring descriptionEn and descriptionRu are set
                        // IMPORTANT: Always use descriptionEn/descriptionRu if they exist (even if empty string)
                        // Only use description as fallback if descriptionEn/descriptionRu are undefined or null
                        const loadedFormData = {
                          ...freshService,
                          descriptionEn: (freshService?.descriptionEn !== undefined && freshService?.descriptionEn !== null) 
                            ? freshService.descriptionEn 
                            : (freshService?.description || ''),
                          descriptionRu: (freshService?.descriptionRu !== undefined && freshService?.descriptionRu !== null) 
                            ? freshService.descriptionRu 
                            : (freshService?.description || ''),
                        };
                        
                        setFormData(loadedFormData);
                        setEditingIndex(service.index);
                        setShowAddForm(true);
                        setViewMode("filtered");
                      }}
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-[var(--border-color)] hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-sm font-medium min-h-[44px] active:scale-95 shadow-sm"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete "${service.title}"?`)) return;
                        
                        try {
                          const res = await fetch("/api/admin/services", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              brand: service.brand,
                              model: service.model,
                              year: service.year,
                              category: service.category,
                              index: service.index,
                            }),
                          });
                          if (res.ok) {
                            // Optimistically remove the service from UI
                            setServices((prevServices: any) => {
                              const newServices = { ...prevServices };
                              if (newServices[service.brand]?.[service.model]?.[service.year]?.[service.category]) {
                                const categoryArray = [...newServices[service.brand][service.model][service.year][service.category]];
                                categoryArray.splice(service.index, 1);
                                newServices[service.brand][service.model][service.year][service.category] = categoryArray;
                              }
                              return newServices;
                            });
                            setRefreshKey(prev => prev + 1);
                            // Then reload to ensure consistency
                            await loadServices();
                          } else {
                            const errorText = await res.text();
                            alert(`Failed to delete service: ${errorText || res.statusText}`);
                          }
                        } catch (error) {
                          console.error("Error deleting service:", error);
                          const errorMessage = error instanceof Error ? error.message : "Failed to delete service";
                          alert(`Failed to delete service: ${errorMessage}`);
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-lg border-2 border-red-300 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm font-medium min-h-[44px] active:scale-95 shadow-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Services View */}
      {viewMode === "filtered" && (
        <>

      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4">
        <select
          value={selectedBrand}
          onChange={(e) => {
            setSelectedBrand(e.target.value);
            setSelectedModel("");
            setSelectedYear("");
          }}
          className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
        >
          <option value="">{t('selectBrand')}</option>
          {Array.from(new Set(vehicles.map(v => v.brand)))
            .sort((a, b) => {
              // Sort: land-rover first, jaguar second, then alphabetically
              if (a === "land-rover") return -1;
              if (b === "land-rover") return 1;
              if (a === "jaguar") return -1;
              if (b === "jaguar") return 1;
              return a.localeCompare(b);
            })
            .map(brand => {
              const displayName = brand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              return (
                <option key={brand} value={brand}>{displayName}</option>
              );
            })
          }
        </select>

        <select
          key={`model-${selectedBrand}`}
          value={selectedModel}
          onChange={(e) => {
            setSelectedModel(e.target.value);
            setSelectedYear("");
          }}
          className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
          disabled={!selectedBrand || availableVehicles.length === 0}
        >
          <option value="">{t('selectModel')}</option>
          {availableVehicles.map((vehicle) => (
            <option key={vehicle.value} value={vehicle.value}>
              {vehicle.title}
            </option>
          ))}
        </select>

        <select
          key={`year-${selectedBrand}-${selectedModel}`}
          value={selectedYear}
          onChange={(e) => {
            setSelectedYear(e.target.value);
            const newYearData = modelData?.[e.target.value] as Record<string, ServiceOption[]> | undefined;
            const newCategories = newYearData ? Object.keys(newYearData) : [];
            setSelectedCategory(newCategories[0] || "features-activation");
          }}
          className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
          disabled={!selectedModel || availableYears.length === 0}
        >
          <option value="">{t('selectYear')}</option>
          {availableYears.map((year, index) => (
            <option key={index} value={year.value}>
              {year.label}
            </option>
          ))}
        </select>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
        >
          <option value="">{t('selectCategory')}</option>
          <option value="features-activation">{categoryLabels["features-activation"]}</option>
          <option value="retrofits">{categoryLabels["retrofits"]}</option>
          <option value="power-upgrade">{categoryLabels["power-upgrade"]}</option>
          <option value="accessories">{categoryLabels["accessories"]}</option>
        </select>

        {selectedModel && selectedYear && selectedCategory && (
          <button
            onClick={async () => {
              // Reload vehicles to ensure we have the latest list
              await loadVehicles();
              setShowAddForm(true);
              setEditingIndex(null);
              setFormData({
                title: "",
                image: "",
                price: "",
                requirements: "No",
                description: "",
                status: "in-stock",
              });
            }}
            className="px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-medium text-base sm:text-sm w-full sm:w-auto min-h-[44px] sm:min-h-0 shadow-lg active:scale-95 transition-all"
          >
            + {t('add')} {t('title')}
          </button>
        )}
      </div>

      {selectedBrand && availableVehicles.length === 0 && (
        <div className="mb-6 p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-sm text-yellow-800">
          No vehicles found for {selectedBrand.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}. Please add vehicles first in <Link href="/admin/vehicles" className="underline font-medium">Manage Vehicles</Link>.
        </div>
      )}
      
      {!selectedBrand && (
        <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800">
          Please select a brand to add services.
        </div>
      )}

      {showAddForm && (
        <form onSubmit={handleSubmit} className="mb-8 rounded-2xl border-2 border-[var(--border-color)] p-4 sm:p-6 bg-white dark:bg-[var(--space-black)]">
          <h2 className="text-lg sm:text-xl font-semibold mb-4">
            {editingIndex !== null ? t('edit') : t('add')} {t('title')} {t('to')} {selectedBrand} / {selectedModel} / {selectedYear} / {selectedCategory}
          </h2>

          <div className="grid gap-4 sm:gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">{t('title')}</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                placeholder="DYNAMIC MODE"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('selectImage')}</label>
              {loadingImages ? (
                <div className="text-sm text-zinc-500">{t('loadingImages')}</div>
              ) : availableImages.length > 0 ? (
                <div className="space-y-3">
                  <select
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                  >
                    <option value="">-- Select an image (optional) --</option>
                    {availableImages.map((imgPath) => {
                      const fileName = imgPath.split("/").pop() || imgPath;
                      return (
                        <option key={imgPath} value={imgPath}>
                          {fileName}
                        </option>
                      );
                    })}
                  </select>
                  {formData.image && (
                    <div className="mt-2">
                      <div className="text-xs text-zinc-500 mb-2">Preview:</div>
                      <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/10">
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                            const parent = target.parentElement;
                            if (parent) {
                              const errorMsg = document.createElement("div");
                              errorMsg.className = "absolute inset-0 flex items-center justify-center text-red-500 text-xs px-2 text-center";
                              errorMsg.textContent = `Image not found: ${formData.image}`;
                              parent.appendChild(errorMsg);
                            }
                          }}
                        />
                      </div>
                      <div className="mt-1 text-xs text-zinc-400 break-all">{formData.image}</div>
                      {formData.image && !formData.image.startsWith(`/services/${selectedCategory}/`) && (
                        <div className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                          ⚠️ Warning: This image path doesn't match the selected category. Please select an image from the dropdown above.
                        </div>
                      )}
                    </div>
                  )}
                  {!formData.image && editingIndex !== null && (
                    <div className="text-xs text-zinc-500 mt-2">
                      Current service has no image. You can leave this empty or select an image from the dropdown.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm text-zinc-500">
                    No images found in <code className="text-xs bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded">public/services/{selectedCategory}/</code>. 
                    <br />
                    Please upload images to that folder first.
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Or enter image path manually:</label>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                      placeholder="/services/features-activation/image.jpg"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <div className="text-xs text-zinc-500 mb-2">Preview:</div>
                        <div className="relative w-full h-48 rounded-lg overflow-hidden border border-[var(--border-color)] bg-silver/10">
                          <img
                            src={formData.image}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                              const parent = target.parentElement;
                              if (parent && !parent.querySelector(".error-msg")) {
                                const errorMsg = document.createElement("div");
                                errorMsg.className = "error-msg absolute inset-0 flex items-center justify-center text-red-500 text-xs px-2 text-center";
                                errorMsg.textContent = `Image not found: ${formData.image}`;
                                parent.appendChild(errorMsg);
                              }
                            }}
                          />
                        </div>
                        <div className="mt-1 text-xs text-zinc-400 break-all">{formData.image}</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('price')}</label>
              <input
                type="text"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                placeholder="£150"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('requirements')}</label>
              <select
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
                required
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('status')} ({t('optional')})</label>
              <select
                value={formData.status || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({ 
                    ...formData, 
                    status: value === "" ? undefined : value as "in-stock" | "unavailable" | "coming-soon"
                  });
                }}
                className="w-full h-12 sm:h-10 rounded-lg border-2 border-[var(--border-color)] px-4 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium min-h-[44px] sm:min-h-0 focus:border-[var(--accent-gold)] focus:outline-none"
              >
                <option value="">{t('noStatus')}</option>
                <option value="in-stock">{t('inStock')}</option>
                <option value="unavailable">{t('unavailable')}</option>
                <option value="coming-soon">{t('comingSoon')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">{t('description')} (English)</label>
              <textarea
                value={formData.descriptionEn || ""}
                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                className="w-full min-h-24 rounded-lg border-2 border-[var(--border-color)] px-4 py-3 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium focus:border-[var(--accent-gold)] focus:outline-none"
                placeholder="Factory dynamic program activation for enhanced driving experience."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t('description')} (Русский)</label>
              <textarea
                value={formData.descriptionRu || ""}
                onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                className="w-full min-h-24 rounded-lg border-2 border-[var(--border-color)] px-4 py-3 bg-white dark:bg-[var(--space-black)] text-base sm:text-sm font-medium focus:border-[var(--accent-gold)] focus:outline-none"
                placeholder="Активация заводской динамической программы для улучшенного опыта вождения."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 sm:py-2 rounded-full bg-[var(--accent-gold)] text-white font-medium disabled:opacity-50 min-h-[44px] sm:min-h-0 shadow-lg active:scale-95 transition-all"
              >
                {saving ? t('saving') : editingIndex !== null ? t('updateService') : t('addService')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setEditingIndex(null);
                  setFormData({
                    title: "",
                    image: "",
                    price: "",
                    requirements: "No",
                    description: "",
                    status: "in-stock",
                  });
                }}
                className="px-6 py-3 sm:py-2 rounded-lg border-2 border-[var(--border-color)] font-medium min-h-[44px] sm:min-h-0 shadow-sm active:scale-95 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Display existing services for selected vehicle */}
      {yearData && selectedCategory && yearData[selectedCategory] && yearData[selectedCategory].length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            {t('existingServices')} ({yearData[selectedCategory].length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {yearData[selectedCategory].map((service, index) => (
              <div key={index} className="rounded-xl border-2 border-[var(--border-color)] overflow-hidden bg-white dark:bg-[var(--space-black)]">
                <div className="relative h-32 bg-silver/20">
                  {service.image && !service.image.includes(".фв") ? (
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      className="object-cover"
                      unoptimized
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-xs px-2 text-center">
                      {service.title}
                    </div>
                  )}
                  {service.status && (
                    <>
                      {service.status === "in-stock" && (
                        <div className="absolute bottom-2 right-2 bg-[var(--accent-gold)] text-white px-2 py-1 rounded text-xs font-bold">
                          IN STOCK
                        </div>
                      )}
                      {(service.status === "unavailable" || service.status === "coming-soon") && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <div className="text-sm font-bold text-white uppercase">
                            {service.status === "coming-soon" ? "COMING SOON" : "UNAVAILABLE"}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div className="p-4">
                  <div className="font-medium text-sm sm:text-base mb-2">{service.title}</div>
                  <div className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mb-1">
                    {t('requirements')}: {service.requirements}
                  </div>
                  <div className="text-base sm:text-lg font-semibold mb-3">{service.price}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={async () => {
                        // Force reload services from server (bypass cache)
                        const freshServices = await loadServices(false, true);
                        
                        // Try multiple ways to find the service (normalized and original keys)
                        const normalizedBrand = selectedBrand.trim().toLowerCase().replace(/\s+/g, '-');
                        const normalizedModel = selectedModel.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
                        
                        // Try normalized keys first
                        let brandData = freshServices[normalizedBrand] || freshServices[selectedBrand];
                        let modelData = brandData?.[normalizedModel] || brandData?.[selectedModel];
                        let yearData = modelData?.[selectedYear] as Record<string, ServiceOption[]> | undefined;
                        let categoryArray = yearData?.[selectedCategory];
                        
                        // If not found, try original keys
                        if (!categoryArray) {
                          brandData = freshServices[selectedBrand];
                          modelData = brandData?.[selectedModel];
                          yearData = modelData?.[selectedYear] as Record<string, ServiceOption[]> | undefined;
                          categoryArray = yearData?.[selectedCategory];
                        }
                        
                        if (!categoryArray || !Array.isArray(categoryArray) || index >= categoryArray.length) {
                          alert(t('serviceDataChanged'));
                          return;
                        }
                        
                        // Get the FRESH service data from the server
                        const freshService = categoryArray[index];
                        
                        // Load service data, ensuring descriptionEn and descriptionRu are set
                        // IMPORTANT: Always use descriptionEn/descriptionRu if they exist (even if empty string)
                        // Only use description as fallback if descriptionEn/descriptionRu are undefined or null
                        const loadedFormData = {
                          ...freshService,
                          descriptionEn: (freshService?.descriptionEn !== undefined && freshService?.descriptionEn !== null) 
                            ? freshService.descriptionEn 
                            : (freshService?.description || ''),
                          descriptionRu: (freshService?.descriptionRu !== undefined && freshService?.descriptionRu !== null) 
                            ? freshService.descriptionRu 
                            : (freshService?.description || ''),
                        };
                        
                        setFormData(loadedFormData);
                        setEditingIndex(index);
                        setShowAddForm(true);
                      }}
                      className="flex-1 px-4 py-3 sm:py-2 rounded-lg border-2 border-[var(--border-color)] text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors min-h-[44px] sm:min-h-0 active:scale-95 shadow-sm"
                    >
                      {t('edit')}
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm(`Are you sure you want to delete "${service.title}"?`)) return;
                        
                        try {
                          const res = await fetch("/api/admin/services", {
                            method: "DELETE",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                              brand: selectedBrand,
                              model: selectedModel,
                              year: selectedYear,
                              category: selectedCategory,
                              index,
                            }),
                          });
                          if (res.ok) {
                            // Optimistically remove the service from UI
                            setServices((prevServices: any) => {
                              const newServices = { ...prevServices };
                              if (newServices[selectedBrand]?.[selectedModel]?.[selectedYear]?.[selectedCategory]) {
                                const categoryArray = [...newServices[selectedBrand][selectedModel][selectedYear][selectedCategory]];
                                categoryArray.splice(index, 1);
                                newServices[selectedBrand][selectedModel][selectedYear][selectedCategory] = categoryArray;
                              }
                              return newServices;
                            });
                            setRefreshKey(prev => prev + 1);
                            // Then reload to ensure consistency
                            await loadServices();
                          } else {
                            const errorText = await res.text();
                            alert(`Failed to delete service: ${errorText || res.statusText}`);
                          }
                        } catch (error) {
                          console.error("Error deleting service:", error);
                          const errorMessage = error instanceof Error ? error.message : "Failed to delete service";
                          alert(`Failed to delete service: ${errorMessage}`);
                        }
                      }}
                      className="flex-1 px-4 py-3 sm:py-2 rounded-lg border-2 border-red-300 text-red-600 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] sm:min-h-0 active:scale-95 shadow-sm"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
