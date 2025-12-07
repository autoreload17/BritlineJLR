import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "works";
const FALLBACK_PATH = "src/data/works.json";

// Helper to check if we're on Netlify
function isNetlifyEnvironment() {
  return !!(
    process.env.NETLIFY === "true" ||
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME
  );
}

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

async function getWorks(): Promise<Work[]> {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    if (Array.isArray(data) && data.length > 0) {
      // Migrate old format (image -> images) for backward compatibility
      const migrated = data.map((work: any) => {
        if (work.image && !work.images) {
          return { ...work, images: [work.image] };
        }
        if (!work.images) {
          return { ...work, images: [] };
        }
        return work;
      });
      return migrated.sort((a: Work, b: Work) => a.order - b.order);
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const works = await getWorks();
    return NextResponse.json(works);
  } catch (error) {
    console.error("Error loading works:", error);
    return NextResponse.json({ error: "Failed to load works" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const work: Omit<Work, "id" | "createdAt" | "order"> = await request.json();
    
    const works = await getWorks();
    
    // Generate ID and set order
    const newId = `work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxOrder = works.length > 0 ? Math.max(...works.map(w => w.order)) : -1;
    
    const newWork: Work = {
      ...work,
      id: newId,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };
    
    works.push(newWork);
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, works);
    return NextResponse.json({ success: true, work: newWork });
  } catch (error) {
    console.error("Error creating work:", error);
    return NextResponse.json({ error: "Failed to create work" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    const works = await getWorks();
    const index = works.findIndex(w => w.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }
    
    works[index] = { ...works[index], ...updates };
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, works);
    return NextResponse.json({ success: true, work: works[index] });
  } catch (error) {
    console.error("Error updating work:", error);
    return NextResponse.json({ error: "Failed to update work" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    const works = await getWorks();
    const filteredWorks = works.filter(w => w.id !== id);
    
    // Reassign order values after deletion
    filteredWorks.forEach((work, idx) => {
      work.order = idx;
    });
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, filteredWorks);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting work:", error);
    return NextResponse.json({ error: "Failed to delete work" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, direction } = await request.json();
    
    const works = await getWorks();
    const index = works.findIndex(w => w.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Work not found" }, { status: 404 });
    }
    
    if (direction === "up" && index > 0) {
      [works[index], works[index - 1]] = [works[index - 1], works[index]];
      works[index].order = index;
      works[index - 1].order = index - 1;
    } else if (direction === "down" && index < works.length - 1) {
      [works[index], works[index + 1]] = [works[index + 1], works[index]];
      works[index].order = index;
      works[index + 1].order = index + 1;
    }
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, works);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering works:", error);
    return NextResponse.json({ error: "Failed to reorder works" }, { status: 500 });
  }
}

