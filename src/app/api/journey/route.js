import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

export async function GET() {
    try {
        const journey = await getCollectionData("journey", []);
        return NextResponse.json(journey || []);
    } catch (e) {
        return NextResponse.json([]);
    }
}

export async function POST(req) {
    const auth = validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const current = await getCollectionData("journey", []);

        let updatedList = [];
        if (Array.isArray(body)) {
            updatedList = body.map(item => ({
                id: item.id || `journey-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                ...item,
                createdAt: new Date().toISOString()
            }));
        } else {
            const newEntry = {
                id: body.id || `journey-${Date.now()}`,
                ...body,
                createdAt: new Date().toISOString()
            };
            updatedList = [newEntry, ...(Array.isArray(current) ? current : [])];
        }

        await saveCollectionData("journey", updatedList);
        return NextResponse.json({ success: true, result: updatedList });
    } catch (e) {
        console.error("POST Journey API Error:", e);
        return NextResponse.json({ error: "Failed to update journey data", details: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    const auth = validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        if (!body.title || typeof body.title !== "string") {
            return NextResponse.json({ error: "Valid string title is required" }, { status: 400 });
        }

        const current = await getCollectionData("journey", []);
        const list = Array.isArray(current) ? [...current] : [];
        const index = list.findIndex(j => (body.id && j.id === body.id) || (j.title && j.title.toLowerCase() === body.title.toLowerCase()));

        if (index >= 0) {
            list[index] = { ...list[index], ...body };
        } else {
            list.push({ ...body, id: body.id || `journey-${Date.now()}` });
        }

        await saveCollectionData("journey", list);
        return NextResponse.json({ success: true, result: list });
    } catch (e) {
        console.error("PUT Journey API Error:", e);
        return NextResponse.json({ error: "Failed to update journey data", details: e.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    const auth = validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const title = searchParams.get('title');

        if (!id && !title) {
            return NextResponse.json({ error: "Specific id or title required for deletion" }, { status: 400 });
        }

        const current = await getCollectionData("journey", []);
        const list = Array.isArray(current) ? current : [];
        const filtered = list.filter(j => (!id || j.id !== id) && (!title || j.title !== title));

        await saveCollectionData("journey", filtered);
        return NextResponse.json({ success: true, result: filtered });
    } catch (e) {
        console.error("DELETE Journey API Error:", e);
        return NextResponse.json({ error: "Failed to delete journey data", details: e.message }, { status: 500 });
    }
}