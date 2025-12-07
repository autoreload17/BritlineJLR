import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "vehicles";
const FALLBACK_PATH = "src/data/vehicles.json";

async function getVehicles() {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    if (data && Array.isArray(data) && data.length > 0) {
      return data;
    }
    // Если файла нет, возвращаем дефолтные данные
    const { vehiclesData } = await import("@/data/vehicles");
    return vehiclesData;
  } catch {
    // Если файла нет, возвращаем дефолтные данные
    const { vehiclesData } = await import("@/data/vehicles");
    return vehiclesData;
  }
}

export async function GET() {
  const vehicles = await getVehicles();
  // Ensure all vehicles have order property and sort by it
  const vehiclesWithOrder = vehicles.map((vehicle: any, index: number) => ({
    ...vehicle,
    order: vehicle.order !== undefined ? vehicle.order : index,
  }));
  // Sort by order
  vehiclesWithOrder.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  return NextResponse.json(vehiclesWithOrder);
}

// Normalize vehicle value (model slug) - lowercase, trim, replace spaces with hyphens
function normalizeValue(value: string): string {
  if (!value) return value;
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

export async function POST(request: Request) {
  try {
    const vehicle = await request.json();
    console.log("[POST /api/admin/vehicles] Adding vehicle:", vehicle.title);
    console.log("[POST /api/admin/vehicles] Environment:", {
      NETLIFY: process.env.NETLIFY,
      AWS_LAMBDA: process.env.AWS_LAMBDA_FUNCTION_NAME
    });
    
    // Normalize vehicle value (model slug)
    const normalizedVehicle = {
      ...vehicle,
      value: normalizeValue(vehicle.value || ''),
      brand: vehicle.brand?.trim().toLowerCase().replace(/\s+/g, '-') || vehicle.brand,
    };
    
    const vehicles = await getVehicles();
    // Assign order based on current array length
    const newVehicle = { ...normalizedVehicle, order: vehicles.length };
    const updated = [...vehicles, newVehicle];
    
    console.log("[POST /api/admin/vehicles] Saving to storage...");
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, updated);
    console.log("[POST /api/admin/vehicles] ✅ Vehicle saved successfully");
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST /api/admin/vehicles] ❌ Error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ 
      error: "Failed to save",
      message: errorMessage
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { index, vehicle } = await request.json();
    const vehicles = await getVehicles();
    // Normalize vehicle value (model slug)
    const normalizedVehicle = {
      ...vehicle,
      value: normalizeValue(vehicle.value || ''),
      brand: vehicle.brand?.trim().toLowerCase().replace(/\s+/g, '-') || vehicle.brand,
    };
    // Preserve the order when updating
    const existingOrder = vehicles[index]?.order !== undefined ? vehicles[index].order : index;
    vehicles[index] = { ...normalizedVehicle, order: existingOrder };
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, vehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { fromIndex, toIndex } = await request.json();
    const vehicles = await getVehicles();
    
    if (fromIndex < 0 || fromIndex >= vehicles.length || toIndex < 0 || toIndex >= vehicles.length) {
      return NextResponse.json({ error: "Invalid indices" }, { status: 400 });
    }
    
    // Move vehicle from one position to another
    const [movedVehicle] = vehicles.splice(fromIndex, 1);
    vehicles.splice(toIndex, 0, movedVehicle);
    
    // Reassign order values based on new positions
    vehicles.forEach((vehicle: any, index: number) => {
      vehicle.order = index;
    });
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, vehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to reorder" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { index } = await request.json();
    const vehicles = await getVehicles();
    vehicles.splice(index, 1);
    
    // Reassign order values after deletion
    vehicles.forEach((vehicle: any, idx: number) => {
      vehicle.order = idx;
    });
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, vehicles);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}

