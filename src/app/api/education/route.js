import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

const defaultEducation = [
    {
        id: "edu-1",
        degree: "Bachelor of Science in Computer Science and Engineering",
        institution: "Patuakhali Science and Technology University (PSTU)",
        period: "2023 - Present",
        major: "Computer Science & Engineering (5th Semester)"
    },
    {
        id: "edu-2",
        degree: "Higher Secondary Certificate (HSC)",
        institution: "Government Syed Hatem Ali College, Barishal",
        period: "2021 - 2023",
        major: "Science"
    }
];

export async function GET() {
    try {
        const education = await getCollectionData("education", defaultEducation);
        return NextResponse.json(education.length > 0 ? education : defaultEducation);
    } catch (e) {
        return NextResponse.json(defaultEducation);
    }
}

export async function POST(req) {
    const auth = validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const current = await getCollectionData("education", defaultEducation);

        let updatedList = [];
        if (Array.isArray(body)) {
            updatedList = body;
        } else {
            const newItem = {
                id: body.id || `edu-${Date.now()}`,
                ...body
            };
            updatedList = [newItem, ...current];
        }

        await saveCollectionData("education", updatedList);
        return NextResponse.json({ success: true, result: updatedList });
    } catch (e) {
        console.error("POST Education API Error:", e);
        return NextResponse.json({ error: "Failed to update education", details: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    const auth = validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const current = await getCollectionData("education", defaultEducation);
        const index = current.findIndex(e => (body.id && e.id === body.id) || (body.degree && e.degree === body.degree));
        
        if (index >= 0) {
            current[index] = { ...current[index], ...body };
        } else {
            current.push(body);
        }

        await saveCollectionData("education", current);
        return NextResponse.json({ success: true, result: current });
    } catch (e) {
        return NextResponse.json({ error: "Failed to edit education" }, { status: 500 });
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
        const degree = searchParams.get('degree');
        if (!id && !degree) {
            return NextResponse.json({ error: "Identifier required" }, { status: 400 });
        }

        const current = await getCollectionData("education", defaultEducation);
        const filtered = current.filter(e => (!id || e.id !== id) && (!degree || e.degree !== degree));
        await saveCollectionData("education", filtered);
        return NextResponse.json({ success: true, result: filtered });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete education" }, { status: 500 });
    }
}