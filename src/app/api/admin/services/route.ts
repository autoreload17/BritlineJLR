import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "services";
const FALLBACK_PATH = "src/data/services.json";

// Helper to check if we're on Netlify
function isNetlifyEnvironment() {
  return !!(
    process.env.NETLIFY === "true" ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

async function getServices() {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    // Only return if it's a valid object with data, otherwise return empty object
    if (data && typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length > 0) {
      return data;
    }
    return {};
  } catch {
    // Return empty object if file doesn't exist or is invalid
    return {};
  }
}

// Function to clean up duplicate entries with empty model/year keys
async function cleanupDuplicates(services: any): Promise<{ cleaned: boolean; saved: boolean }> {
  let cleaned = false;
  let saved = false;
  
  if (!services || typeof services !== 'object') {
    return { cleaned: false, saved: false };
  }
  
  for (const brand in services) {
    if (!services[brand] || typeof services[brand] !== 'object') continue;
    
    // Check for empty model key
    const emptyModelKey = '';
    if (services[brand][emptyModelKey] && typeof services[brand][emptyModelKey] === 'object') {
      const emptyModelData = services[brand][emptyModelKey];
      
      // Iterate through all years in empty model
      for (const year in emptyModelData) {
        if (!emptyModelData[year] || typeof emptyModelData[year] !== 'object') continue;
        
        // Iterate through all categories in empty model/year
        for (const category in emptyModelData[year]) {
          const emptyKeyArray = emptyModelData[year][category];
          if (!Array.isArray(emptyKeyArray)) continue;
          
          // For each service in empty key array, try to find and merge with normal key entry
          for (let i = emptyKeyArray.length - 1; i >= 0; i--) {
            const duplicateService = emptyKeyArray[i];
            if (!duplicateService || !duplicateService.title) continue;
            
            // Try to find matching service in normal structure (iterate through all models)
            for (const model in services[brand]) {
              if (model === emptyModelKey) continue; // Skip empty model key
              if (!services[brand][model] || typeof services[brand][model] !== 'object') continue;
              
              // Check if this model has the same year
              if (services[brand][model][year] && typeof services[brand][model][year] === 'object') {
                if (services[brand][model][year][category] && Array.isArray(services[brand][model][year][category])) {
                  const normalArray = services[brand][model][year][category];
                  
                  // Find service with same title
                  const matchingIndex = normalArray.findIndex((svc: any) => svc?.title === duplicateService.title);
                  if (matchingIndex >= 0) {
                    const normalService = normalArray[matchingIndex];
                    // Merge descriptionEn and descriptionRu from duplicate
                    if (!normalService.descriptionEn && duplicateService.descriptionEn) {
                      normalService.descriptionEn = duplicateService.descriptionEn;
                      cleaned = true;
                    }
                    if (!normalService.descriptionRu && duplicateService.descriptionRu) {
                      normalService.descriptionRu = duplicateService.descriptionRu;
                      cleaned = true;
                    }
                    
                    // Remove duplicate from empty key array
                    emptyKeyArray.splice(i, 1);
                    cleaned = true;
                    break; // Found and merged, move to next duplicate
                  }
                }
              }
            }
          }
          
          // If array is now empty, clean up structure
          if (emptyKeyArray.length === 0) {
            delete emptyModelData[year][category];
            cleaned = true;
          }
        }
        
        // If year has no categories, remove it
        if (Object.keys(emptyModelData[year]).length === 0) {
          delete emptyModelData[year];
          cleaned = true;
        }
      }
      
      // If empty model has no years, remove it
      if (Object.keys(emptyModelData).length === 0) {
        delete services[brand][emptyModelKey];
        cleaned = true;
      }
    }
  }
  
  // If we cleaned anything, save the cleaned data
  if (cleaned) {
    try {
      // Save synchronously to ensure data is persisted before returning
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      saved = true;
    } catch (err) {
      console.error("[GET] Error saving cleaned data:", err);
    }
  }
  
  return { cleaned, saved };
}

export async function GET() {
  let services = await getServices();
  
  // Clean up duplicates before returning
  const { cleaned } = await cleanupDuplicates(services);
  if (cleaned) {
    // Reload services after cleanup to ensure we return the cleaned data
    services = await getServices();
  }
  
  return NextResponse.json(services);
}

// Normalize brand and model - lowercase, trim, replace spaces with hyphens
function normalizeBrandModel(value: string): string {
  if (!value) return value;
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function POST(request: Request) {
  try {
    const rawRequest = await request.json();
    // Normalize brand and model to ensure consistent format
    const brand = normalizeBrandModel(rawRequest.brand || '');
    const model = normalizeBrandModel(rawRequest.model || '');
    const year = rawRequest.year;
    const category = rawRequest.category;
    const service = rawRequest.service;
    
    const services = await getServices();
    
    // Ensure structure exists
    if (!services[brand]) services[brand] = {};
    if (!services[brand][model]) services[brand][model] = {};
    if (!services[brand][model][year]) services[brand][model][year] = {};
    if (!services[brand][model][year][category]) services[brand][model][year][category] = [];
    
    // IMPORTANT: Ensure all fields are preserved when adding service
    const serviceToAdd = {
      title: service.title,
      image: service.image,
      price: service.price,
      requirements: service.requirements,
      description: service.description,
      descriptionEn: service.descriptionEn,
      descriptionRu: service.descriptionRu,
      status: service.status,
    };
    
    services[brand][model][year][category].push(serviceToAdd);
    
    try {
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    } catch (saveError) {
      console.error("[POST /api/admin/services] ❌ Error saving to storage:", saveError);
      const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      const saveErrorStack = saveError instanceof Error ? saveError.stack : undefined;
      console.error("[POST /api/admin/services] Error stack:", saveErrorStack);
      return NextResponse.json({ 
        error: "Failed to save to storage",
        message: saveErrorMessage,
        stack: process.env.NODE_ENV === "development" ? saveErrorStack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[POST /api/admin/services] ❌ Error in handler:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("[POST /api/admin/services] Error message:", errorMessage);
    console.error("[POST /api/admin/services] Error stack:", errorStack);
    return NextResponse.json({ 
      error: "Failed to save",
      message: errorMessage,
      details: process.env.NODE_ENV === "development" ? { errorMessage, errorStack } : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const requestBody = await request.json();
    // Normalize brand and model to ensure consistent format
    const brand = normalizeBrandModel(requestBody.brand || '');
    const model = normalizeBrandModel(requestBody.model || '');
    const year = requestBody.year;
    const category = requestBody.category;
    const index = requestBody.index;
    const service = requestBody.service;
    
    
    // Validate input
    if (typeof index !== 'number' || index < 0 || !Number.isInteger(index)) {
      console.error("Invalid index:", { index, type: typeof index });
      return NextResponse.json({ 
        error: "Invalid index",
        message: `Index must be a non-negative integer, got: ${index} (type: ${typeof index})`
      }, { status: 400 });
    }
    
    const services = await getServices();
    
    // Ensure structure exists
    if (!services[brand]) {
      services[brand] = {};
    }
    if (!services[brand][model]) {
      services[brand][model] = {};
    }
    if (!services[brand][model][year]) {
      services[brand][model][year] = {};
    }
    if (!services[brand][model][year][category]) {
      services[brand][model][year][category] = [];
    }
    
    const categoryArray = services[brand][model][year][category];
    
    // Check if index is valid
    if (categoryArray.length === 0) {
      // If array is empty, add as new service instead of updating
      // IMPORTANT: Ensure all fields are preserved when adding service
      const serviceToAdd = {
        title: service.title,
        image: service.image,
        price: service.price,
        requirements: service.requirements,
        description: service.description,
        descriptionEn: service.descriptionEn,
        descriptionRu: service.descriptionRu,
        status: service.status,
      };
      categoryArray.push(serviceToAdd);
    } else if (index >= categoryArray.length) {
      console.error("Index out of bounds:", {
        index,
        arrayLength: categoryArray.length,
        availableIndexes: Array.from({ length: categoryArray.length }, (_, i) => i)
      });
      return NextResponse.json({ 
        error: "Index out of bounds",
        message: `Index ${index} is out of bounds. Array has ${categoryArray.length} items. Available indexes: 0-${categoryArray.length - 1}`
      }, { status: 400 });
    } else {
      // Update the service
      // IMPORTANT: Replace the entire service object to preserve all fields including descriptionEn and descriptionRu
      // Don't use spread operator as it might lose properties
      categoryArray[index] = {
        title: service.title,
        image: service.image,
        price: service.price,
        requirements: service.requirements,
        description: service.description,
        descriptionEn: service.descriptionEn,
        descriptionRu: service.descriptionRu,
        status: service.status,
      };
      
      // CLEANUP: If there's a duplicate entry with empty model/year keys, merge the descriptionRu/descriptionEn from it
      // and then remove the duplicate
      if (services[brand]) {
        const emptyModelKey = '';
        if (services[brand][emptyModelKey] && services[brand][emptyModelKey][year] && services[brand][emptyModelKey][year][category]) {
          const emptyKeyArray = services[brand][emptyModelKey][year][category];
          // Find service with same title
          const duplicateIndex = emptyKeyArray.findIndex((svc: any) => svc?.title === service.title);
          if (duplicateIndex >= 0) {
            const duplicate = emptyKeyArray[duplicateIndex];
            
            // If the current service doesn't have descriptionEn/descriptionRu but duplicate does, use duplicate's values
            if (!categoryArray[index].descriptionEn && duplicate?.descriptionEn) {
              categoryArray[index].descriptionEn = duplicate.descriptionEn;
            }
            if (!categoryArray[index].descriptionRu && duplicate?.descriptionRu) {
              categoryArray[index].descriptionRu = duplicate.descriptionRu;
            }
            
            // Remove the duplicate entry
            emptyKeyArray.splice(duplicateIndex, 1);
            
            // If the array is now empty, clean up the structure
            if (emptyKeyArray.length === 0) {
              delete services[brand][emptyModelKey][year][category];
              if (Object.keys(services[brand][emptyModelKey][year]).length === 0) {
                delete services[brand][emptyModelKey][year];
                if (Object.keys(services[brand][emptyModelKey]).length === 0) {
                  delete services[brand][emptyModelKey];
                }
              }
            }
          }
        }
      }
    }
    
    try {
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      
      return NextResponse.json({ success: true });
    } catch (saveError) {
      console.error("❌ Error saving to storage:", saveError);
      const saveErrorMessage = saveError instanceof Error ? saveError.message : String(saveError);
      const saveErrorStack = saveError instanceof Error ? saveError.stack : undefined;
      console.error("Save error stack:", saveErrorStack);
      return NextResponse.json({ 
        error: "Failed to save to storage",
        message: saveErrorMessage,
        stack: process.env.NODE_ENV === "development" ? saveErrorStack : undefined
      }, { status: 500 });
    }
  } catch (error) {
    console.error("❌ Error in PUT handler:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", errorMessage);
    console.error("Error stack:", errorStack);
    return NextResponse.json({ 
      error: "Failed to update",
      message: errorMessage,
      details: {
        errorMessage,
        errorStack: process.env.NODE_ENV === "development" ? errorStack : undefined,
        errorType: error?.constructor?.name
      }
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const rawRequest = await request.json();
    // Normalize brand and model to ensure consistent format
    const brand = normalizeBrandModel(rawRequest.brand || '');
    const model = normalizeBrandModel(rawRequest.model || '');
    const year = rawRequest.year;
    const category = rawRequest.category;
    const index = rawRequest.index;
    const services = await getServices();
    
    // Try to find the service with normalized values first
    let foundBrand = brand;
    let foundModel = model;
    
    if (services[brand]?.[model]?.[year]?.[category]?.[index]) {
      services[brand][model][year][category].splice(index, 1);
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    }
    
    // If not found, try to find with original (non-normalized) values
    const originalBrand = rawRequest.brand?.trim().toLowerCase() || '';
    const originalModel = rawRequest.model?.trim().toLowerCase() || '';
    
    if (services[originalBrand]?.[originalModel]?.[year]?.[category]?.[index]) {
      services[originalBrand][originalModel][year][category].splice(index, 1);
      await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
      return NextResponse.json({ success: true });
    }
    
    // If still not found, try to search through all brands and models to find matching service
    let serviceFound = false;
    for (const serviceBrand in services) {
      if (serviceBrand && typeof services[serviceBrand] === 'object') {
        // Check if brand matches (normalized or original)
        const normalizedServiceBrand = normalizeBrandModel(serviceBrand);
        if (normalizedServiceBrand !== brand && serviceBrand.toLowerCase() !== originalBrand) {
          continue;
        }
        
        for (const serviceModel in services[serviceBrand]) {
          if (services[serviceBrand][serviceModel] && typeof services[serviceBrand][serviceModel] === 'object') {
            // Check if model matches (normalized or original)
            const normalizedServiceModel = normalizeBrandModel(serviceModel);
            if (normalizedServiceModel !== model && serviceModel.toLowerCase() !== originalModel) {
              continue;
            }
            
            if (services[serviceBrand][serviceModel][year]?.[category]?.[index]) {
              services[serviceBrand][serviceModel][year][category].splice(index, 1);
              await saveStorageData(STORAGE_KEY, FALLBACK_PATH, services);
              serviceFound = true;
              break;
            }
          }
        }
        if (serviceFound) break;
      }
    }
    
    if (serviceFound) {
      return NextResponse.json({ success: true });
    }
    
    console.error("[DELETE /api/admin/services] Service not found after all attempts:", {
      requested: { brand, model, year, category, index },
      availableBrands: Object.keys(services || {}),
    });
    
    return NextResponse.json({ error: "Service not found" }, { status: 404 });
  } catch (error) {
    console.error("Error deleting service:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: "Failed to delete",
      message: errorMessage
    }, { status: 500 });
  }
}

