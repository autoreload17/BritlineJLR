import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category") || "features-activation";

  try {
    const imagesDir = join(process.cwd(), "public", "services", category);
    const files = await readdir(imagesDir);
    
    // Filter only image files
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );

    // Return full paths relative to public folder
    const imagePaths = imageFiles.map(file => `/services/${category}/${file}`);
    
    return NextResponse.json({ images: imagePaths });
  } catch (error) {
    // If directory doesn't exist, return empty array
    return NextResponse.json({ images: [] });
  }
}












