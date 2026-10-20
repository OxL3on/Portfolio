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
    const result = Array.isArray(savedCategories) && savedCategories.length > 0
      ? savedCategories
      : defaultBlogCategories;
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
    const cleanCurrent = (Array.isArray(current) && current.length > 0 ? current : defaultBlogCategories)
      .map(c => (typeof c === 'string' ? c.trim() : c?.name ? c.name.trim() : ''))
      .filter(Boolean);

    const categorySet = new Set(cleanCurrent);

    if (Array.isArray(body)) {
      body.forEach(cat => {
        const val = typeof cat === 'string' ? cat.trim() : cat?.name ? cat.name.trim() : '';
        if (val) categorySet.add(val);
      });
    } else if (body.categories && Array.isArray(body.categories)) {
      body.categories.forEach(cat => {
        const val = typeof cat === 'string' ? cat.trim() : cat?.name ? cat.name.trim() : '';
        if (val) categorySet.add(val);
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
    let category = searchParams.get('category') || searchParams.get('name');
    if (!category) {
      try {
        const body = await req.json();
        category = body.category || body.name;
      } catch (e) {}
    }

    if (!category) {
      return NextResponse.json({ error: "Missing category parameter" }, { status: 400 });
    }

    const target = category.trim().toLowerCase();
    const current = await getCollectionData("blogCategories", defaultBlogCategories);
    const cleanCurrent = (Array.isArray(current) && current.length > 0 ? current : defaultBlogCategories)
      .map(c => (typeof c === 'string' ? c.trim() : c?.name ? c.name.trim() : ''))
      .filter(Boolean);

    const updated = cleanCurrent.filter(c => c.toLowerCase() !== target);

    await saveCollectionData("blogCategories", updated);

    // Also harmonize any blogs that had this category so they don't break
    try {
      const blogs = await getCollectionData("blogs", []);
      if (Array.isArray(blogs) && blogs.length > 0) {
        let blogsChanged = false;
        blogs.forEach(b => {
          if (b.platform && b.platform.trim().toLowerCase() === target) {
            b.platform = b.category || 'Security Research';
            blogsChanged = true;
          }
          if (b.category && b.category.trim().toLowerCase() === target) {
            b.category = 'Security Research';
            blogsChanged = true;
          }
        });
        if (blogsChanged) {
          await saveCollectionData("blogs", blogs);
        }
      }
    } catch (err) {
      console.warn("Harmonizing blogs after category delete warning:", err);
    }

    return NextResponse.json({ success: true, result: updated });
  } catch (e) {
    console.error("DELETE blog-categories error:", e);
    return NextResponse.json({ error: "Failed to delete category" }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const session = await validateAdminSession(req);
    if (!session.isValid) {
      return NextResponse.json({ error: session.error || "Unauthorized: Admin session required" }, { status: 401 });
    }

    const body = await req.json();
    const oldName = (body.oldName || body.oldCategory || body.from || '').trim();
    const newName = (body.newName || body.newCategory || body.to || body.name || '').trim();

    if (!oldName || !newName) {
      return NextResponse.json({ error: "Both old and new category names are required" }, { status: 400 });
    }

    const current = await getCollectionData("blogCategories", defaultBlogCategories);
    const cleanCurrent = (Array.isArray(current) && current.length > 0 ? current : defaultBlogCategories)
      .map(c => (typeof c === 'string' ? c.trim() : c?.name ? c.name.trim() : ''))
      .filter(Boolean);

    const oldTarget = oldName.toLowerCase();
    const existingIndex = cleanCurrent.findIndex(c => c.toLowerCase() === oldTarget);

    if (existingIndex === -1) {
      return NextResponse.json({ error: `Category "${oldName}" not found` }, { status: 404 });
    }

    // Check if newName collisions with another existing category
    const collisionIndex = cleanCurrent.findIndex((c, idx) => idx !== existingIndex && c.toLowerCase() === newName.toLowerCase());
    let updated;
    if (collisionIndex !== -1) {
      // Merge into the already existing category
      updated = cleanCurrent.filter((_, idx) => idx !== existingIndex);
    } else {
      updated = [...cleanCurrent];
      updated[existingIndex] = newName;
    }

    await saveCollectionData("blogCategories", updated);

    // Cascade rename to all existing writeups in blogs collection
    try {
      const blogs = await getCollectionData("blogs", []);
      if (Array.isArray(blogs) && blogs.length > 0) {
        let blogsChanged = false;
        blogs.forEach(b => {
          if (b.platform && b.platform.trim().toLowerCase() === oldTarget) {
            b.platform = newName;
            blogsChanged = true;
          }
          if (b.category && b.category.trim().toLowerCase() === oldTarget) {
            b.category = newName;
            blogsChanged = true;
          }
        });
        if (blogsChanged) {
          await saveCollectionData("blogs", blogs);
        }
      }
    } catch (err) {
      console.warn("Harmonizing blogs after category rename warning:", err);
    }

    return NextResponse.json({ success: true, result: updated });
  } catch (e) {
    console.error("PUT blog-categories error:", e);
    return NextResponse.json({ error: "Failed to update category", details: e.message }, { status: 500 });
  }
}

export const PATCH = PUT;

