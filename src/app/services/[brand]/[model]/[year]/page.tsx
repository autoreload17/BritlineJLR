import ServicesPageClient from '@/components/ServicesPageClient';
import NoServicesFound from '@/components/NoServicesFound';
import { getStorageData } from '@/lib/storage';

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

async function getServices() {
  const STORAGE_KEY = "services";
  const FALLBACK_PATH = "src/data/services.json";
  
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    // Only return if it's a valid object with data, otherwise return empty object
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      return data;
    }
    return {};
  } catch (error) {
    console.error("Failed to load services:", error);
    // Return empty object if loading fails
    return {};
  }
}

// Normalize URL parameters - decode, trim, lowercase, replace spaces with hyphens
// This must match the normalization used in the API (normalizeBrandModel)
function normalizeUrlParam(param: string): string {
  if (!param) return param;
  try {
    // Decode URL encoding (e.g., %20 -> space)
    const decoded = decodeURIComponent(param);
    // Normalize: trim, lowercase, replace spaces with hyphens, remove special chars
    // This matches normalizeBrandModel in API
    return decoded.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  } catch {
    // If decoding fails, just normalize
    return param.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }
}

export default async function ServiceCatalogPage({ params }: { params: Promise<{ brand: string, model: string, year: string }> }) {
  const rawParams = await params;
  
  // Normalize URL parameters to match stored data format
  const brand = normalizeUrlParam(rawParams.brand);
  const model = normalizeUrlParam(rawParams.model);
  // Decode year from URL (e.g., "2021%2B" -> "2021+") and trim
  let year: string;
  try {
    year = decodeURIComponent(rawParams.year).trim();
  } catch {
    year = rawParams.year.trim();
  }
  
  const servicesData = await getServices();
  
  // Search for services with case-insensitive and flexible matching
  // Collect all matching services from all variants (e.g., DEFENDER-l316 and defender-l316)
  const allMatchingCategoriesData: Record<string, ServiceOption[]> = {};
  
  // Iterate through all brands to find matching one (case-insensitive)
  for (const serviceBrand in servicesData) {
    if (!serviceBrand || typeof servicesData[serviceBrand] !== 'object') continue;
    
    // Normalize service brand for comparison (case-insensitive)
    const normalizedServiceBrand = normalizeUrlParam(serviceBrand);
    if (normalizedServiceBrand !== brand) {
      continue;
    }
    
    const brandData = servicesData[serviceBrand];
    
    // Iterate through all models to find matching one (case-insensitive)
    // This handles cases where the same model is stored with different case (e.g., DEFENDER-l316 and defender-l316)
    for (const serviceModel in brandData) {
      if (!serviceModel || typeof brandData[serviceModel] !== 'object') continue;
      
      // Normalize service model for comparison (case-insensitive)
      const normalizedServiceModel = normalizeUrlParam(serviceModel);
      if (normalizedServiceModel !== model) {
        continue;
      }
      
      const modelData = brandData[serviceModel];
      
      // Check all years for this model (year might be stored differently)
      if (modelData && typeof modelData === 'object') {
        const normalizedRequestedYear = year.trim();
        let yearData = modelData[year];
        
        // If not found, try trimmed year
        if (!yearData && year.trim() !== year) {
          yearData = modelData[normalizedRequestedYear];
        }
        
        // If still not found, iterate through all stored years and try different matching strategies
        if (!yearData) {
          for (const storedYear in modelData) {
            if (!storedYear) continue;
            
            const trimmedStoredYear = storedYear.trim();
            
            // Try exact match with trimmed values first
            if (trimmedStoredYear === normalizedRequestedYear) {
              yearData = modelData[storedYear];
              break;
            }
            
            // Try decoding stored year if it might be URL-encoded
            try {
              const decodedStoredYear = decodeURIComponent(storedYear).trim();
              if (decodedStoredYear === normalizedRequestedYear) {
                yearData = modelData[storedYear];
                break;
              }
            } catch {
              // If decoding fails, continue to next year
            }
          }
        }
        
        // Merge services from all matching model variants (in case of duplicates with different case)
        if (yearData && typeof yearData === 'object') {
          for (const category in yearData) {
            const services = yearData[category];
            if (Array.isArray(services) && services.length > 0) {
              if (!allMatchingCategoriesData[category]) {
                allMatchingCategoriesData[category] = [];
              }
              // Add services that don't already exist (based on title)
              for (const service of services) {
                if (service && service.title) {
                  const exists = allMatchingCategoriesData[category].some(
                    (existing) => existing.title === service.title
                  );
                  if (!exists) {
                    allMatchingCategoriesData[category].push(service);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  
  const allCategoriesData = allMatchingCategoriesData;
  
  // Filter out empty categories (only keep categories with at least one service)
  const categoriesData: Record<string, ServiceOption[]> = {};
  for (const [catKey, services] of Object.entries(allCategoriesData)) {
    if (Array.isArray(services) && services.length > 0) {
      categoriesData[catKey] = services;
    }
  }
  
  if (!categoriesData || Object.keys(categoriesData).length === 0) {
    return <NoServicesFound />;
  }
  return (
    <ServicesPageClient
      brand={brand}
      model={model}
      year={year}
      categoriesData={categoriesData as Record<string, ServiceOption[]>}
    />
  );
}


