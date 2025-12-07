import { NextResponse } from "next/server";
import { getStorageData, saveStorageData } from "@/lib/storage";

const STORAGE_KEY = "car-projects";
const FALLBACK_PATH = "src/data/car-projects.json";

type CarProject = {
  id: string;
  images: string[]; // Array of image paths
  order: number;
  createdAt: string;
};

async function getCarProjects(): Promise<CarProject[]> {
  try {
    const data = await getStorageData(STORAGE_KEY, FALLBACK_PATH);
    if (Array.isArray(data) && data.length > 0) {
      // Migrate old format (image -> images) for backward compatibility
      const migrated = data.map((project: any) => {
        if (project.image && !project.images) {
          return { ...project, images: [project.image] };
        }
        if (!project.images) {
          return { ...project, images: [] };
        }
        return project;
      });
      return migrated.sort((a: CarProject, b: CarProject) => a.order - b.order);
    }
    return [];
  } catch {
    return [];
  }
}

export async function GET() {
  try {
    const projects = await getCarProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("Error loading car projects:", error);
    return NextResponse.json({ error: "Failed to load car projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const project: Omit<CarProject, "id" | "createdAt" | "order"> = await request.json();
    
    const projects = await getCarProjects();
    
    // Generate ID and set order
    const newId = `car-project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const maxOrder = projects.length > 0 ? Math.max(...projects.map(p => p.order)) : -1;
    
    const newProject: CarProject = {
      ...project,
      id: newId,
      order: maxOrder + 1,
      createdAt: new Date().toISOString(),
    };
    
    projects.push(newProject);
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, projects);
    return NextResponse.json({ success: true, project: newProject });
  } catch (error) {
    console.error("Error creating car project:", error);
    return NextResponse.json({ error: "Failed to create car project" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { id, ...updates } = await request.json();
    
    const projects = await getCarProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Car project not found" }, { status: 404 });
    }
    
    projects[index] = { ...projects[index], ...updates };
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, projects);
    return NextResponse.json({ success: true, project: projects[index] });
  } catch (error) {
    console.error("Error updating car project:", error);
    return NextResponse.json({ error: "Failed to update car project" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { id } = await request.json();
    
    const projects = await getCarProjects();
    const filteredProjects = projects.filter(p => p.id !== id);
    
    // Reassign order values after deletion
    filteredProjects.forEach((project, idx) => {
      project.order = idx;
    });
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, filteredProjects);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting car project:", error);
    return NextResponse.json({ error: "Failed to delete car project" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, direction } = await request.json();
    
    const projects = await getCarProjects();
    const index = projects.findIndex(p => p.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: "Car project not found" }, { status: 404 });
    }
    
    if (direction === "up" && index > 0) {
      [projects[index], projects[index - 1]] = [projects[index - 1], projects[index]];
      projects[index].order = index;
      projects[index - 1].order = index - 1;
    } else if (direction === "down" && index < projects.length - 1) {
      [projects[index], projects[index + 1]] = [projects[index + 1], projects[index]];
      projects[index].order = index;
      projects[index + 1].order = index + 1;
    }
    
    await saveStorageData(STORAGE_KEY, FALLBACK_PATH, projects);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error reordering car projects:", error);
    return NextResponse.json({ error: "Failed to reorder car projects" }, { status: 500 });
  }
}

