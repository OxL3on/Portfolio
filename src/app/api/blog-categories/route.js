import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

export const defaultBlogCategories = [
  "TryHackMe",
  "Hack The Box",
  "CTF Writeups",
  "Security Research",
  "VulnHub",
  "Root me"
];

export async function GET() {
  try {
    const savedCategories = await getCollectionData("blogCategories", defaultBlogCategories);
    const blogs = await getCollectionData("blogs", []);
    
    // Combine saved categories with any categories already present on blogs
    const categorySet = new Set(Array.isArray(savedCategories) ? savedCategories : defaultBlogCategories);
    if (Array.isArray(blogs)) {
      blogs.forEach(b => {
        if (b.category && typeof b.category === 'string' && b.category.trim()) {
          categorySet.add(b.category.trim());
        }
        if (b.platform && typeof b.platform === 'string' && b.platform.trim()) {
          categorySet.add(b.platform.trim());
        }
      });
    }

    const result = Array.from(categorySet);
    return NextResponse.json(result);
  } catch (e) {
    console.error("GET blog-categories error:", e);
    return NextResponse.json(defaultBlogCategories);
  }
}

export async function POST(req) {
  try {
    const session = await validateAdminSession(req);
    if (!session.isValid) {
      return NextResponse.json({ error: session.error || "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await req.json();
    const current = await getCollectionData("blogCategories", defaultBlogCategories);
    const categorySet = new Set(Array.isArray(current) ? current : defaultBlogCategories);

    if (Array.isArray(body)) {
      body.forEach(cat => {
        if (typeof cat === 'string' && cat.trim()) categorySet.add(cat.trim());
      });
    } else if (body.categories && Array.isArray(body.categories)) {
      body.categories.forEach(cat => {
        if (typeof cat === 'string' && cat.trim()) categorySet.add(cat.trim());
      });
    } else {
      const newCategory = (body.name || body.category || '').trim();
      if (!newCategory) {
        return NextResponse.json({ error: "Category name is required" }, { status: 400 });
      }
      categorySet.add(newCategory);
    }

    const updated = Array.from(categorySet);
    await saveCollectionData("blogCategories", updated);
    return NextResponse.json({ success: true, result: updated });
  } catch (e) {
    console.error("POST blog-categories error:", e);
    return NextResponse.json({ error: "Failed to save category", details: e.message }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const session = await validateAdminSession(req);
    if (!session.isValid) {
      return NextResponse.json({ error: session.error || "Unauthorized: Admin session required" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || searchParams.get('name');

    if (!category) {
      return NextResponse.json({ error: "Missing category parameter" }, { status: 400 });
    }

    const current = await getCollectionData("blogCategories", defaultBlogCategories);
    const updated = (Array.isArray(current) ? current : defaultBlogCategories).filter(
      c => c.toLowerCase() !== category.trim().toLowerCase()
    );

    await saveCollectionData("blogCategories", updated);
    return NextResponse.json({ success: true, result: updated });
  } catch (e) {
    console.error("DELETE blog-categories error:", e);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}
