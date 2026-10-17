import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

const defaultAchievements = [
    {
        id: "ach-1",
        title: "Top 1% Rank on TryHackMe",
        type: "CTF & Pentesting",
        date: "2024",
        rank: "Top 1%",
        result: "Ranked #1 in University",
        description: "Solved 80+ vulnerable machines and challenges covering Linux privilege escalation, Active Directory exploitation, and web application security."
    },
    {
        id: "ach-2",
        title: "National Cyber Drill 2024",
        type: "Competition",
        date: "Dec 2024",
        rank: "Top 10",
        result: "Finalist",
        description: "Participated in national level cyber incident handling, digital forensics, threat hunting, and defensive security simulation exercises."
    },
    {
        id: "ach-3",
        title: "PSTU Intra University CTF",
        type: "Jeopardy CTF",
        date: "Oct 2024",
        rank: "1st Place",
        result: "Champion",
        description: "Secured 1st position solving web exploitation, reverse engineering, cryptography, and network forensics challenges."
    },
    {
        id: "ach-4",
        title: "Hack The Box University CTF",
        type: "Global CTF",
        date: "2024",
        rank: "Top 5%",
        result: "Qualified",
        description: "Competed globally against collegiate cybersecurity teams solving complex offensive security challenges."
    }
];

export async function GET() {
    try {
        const achievements = await getCollectionData("achievements", defaultAchievements);
        return NextResponse.json(achievements.length > 0 ? achievements : defaultAchievements);
    } catch (e) {
        return NextResponse.json(defaultAchievements);
    }
}

export async function POST(req) {
    const auth = await validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const current = await getCollectionData("achievements", defaultAchievements);

        let updatedList = [];
        if (Array.isArray(body)) {
            updatedList = body;
        } else {
            const newItem = {
                id: body.id || `ach-${Date.now()}`,
                ...body
            };
            updatedList = [newItem, ...current];
        }

        await saveCollectionData("achievements", updatedList);
        return NextResponse.json({ success: true, result: updatedList });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update achievements", details: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    const auth = await validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await req.json();
        const current = await getCollectionData("achievements", defaultAchievements);
        const index = current.findIndex(a => (body.id && a.id === body.id) || (body.title && a.title === body.title));

        if (index >= 0) {
            current[index] = { ...current[index], ...body };
        } else {
            current.push({ ...body, id: body.id || `ach-${Date.now()}` });
        }

        await saveCollectionData("achievements", current);
        return NextResponse.json({ success: true, result: current });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update achievement" }, { status: 500 });
    }
}

export async function DELETE(req) {
    const auth = await validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const title = searchParams.get('title');
        if (!id && !title) {
            return NextResponse.json({ error: "Identifier required" }, { status: 400 });
        }

        const current = await getCollectionData("achievements", defaultAchievements);
        const filtered = current.filter(a => (!id || a.id !== id) && (!title || a.title !== title));
        await saveCollectionData("achievements", filtered);
        return NextResponse.json({ success: true, result: filtered });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete achievement" }, { status: 500 });
    }
}