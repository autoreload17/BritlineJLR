import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

export async function GET() {
  try {
    const imagesDir = join(process.cwd(), "public", "our-works");
    const files = await readdir(imagesDir);
    const imageFiles = files
      .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file))
      .map(file => `/our-works/${file}`)
      .sort();
    
    return NextResponse.json({ images: imageFiles });
  } catch (error) {
    console.error("Error reading images directory:", error);
    // Return empty array if directory doesn't exist
    return NextResponse.json({ images: [] });
  }
}









