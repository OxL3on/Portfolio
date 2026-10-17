import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";
import { validateAdminSession } from "@/lib/auth";

const defaultSkills = [
    {
        id: "skill-1",
        title: "Offensive Security & Pentesting",
        skills: ["Burp Suite", "Nmap", "Metasploit", "Wireshark", "SQLmap", "OWASP ZAP", "Hydra", "John the Ripper"]
    },
    {
        id: "skill-2",
        title: "Web Application & API Security",
        skills: ["OWASP Top 10", "Vulnerability Assessment", "API Pentesting", "ffuf", "Sublist3r", "JWT Exploitation", "XSS & SQLi"]
    },
    {
        id: "skill-3",
        title: "Networking & Security Systems",
        skills: ["Kali Linux", "TCP/IP & Subnetting", "Packet Analysis", "Firewalls", "IDS / IPS", "Network Forensics", "Linux Hardening"]
    },
    {
        id: "skill-4",
        title: "Programming & Tooling",
        skills: ["Python", "C / C++", "Bash Scripting", "JavaScript", "SQL", "Git / GitHub", "Docker", "Regular Expressions"]
    }
];

export async function GET() {
    try {
        const skills = await getCollectionData("skills", defaultSkills);
        return NextResponse.json(skills.length > 0 ? skills : defaultSkills);
    } catch (e) {
        return NextResponse.json(defaultSkills);
    }
}

export async function POST(req) {
    try {
        const session = validateAdminSession(req);
        if (!session.isValid) {
            return NextResponse.json({ error: session.error || "Unauthorized: Admin session required" }, { status: 401 });
        }

        const body = await req.json();
        const current = await getCollectionData("skills", defaultSkills);

        let updatedList = [];
        if (Array.isArray(body)) {
            updatedList = body;
        } else {
            const newItem = {
                id: body.id || `skill-${Date.now()}`,
                ...body
            };
            updatedList = [...current, newItem];
        }

        await saveCollectionData("skills", updatedList);
        return NextResponse.json({ success: true, result: updatedList });
    } catch (e) {
        console.error("POST Skills API Error:", e);
        return NextResponse.json({ error: "Failed to update skills", details: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const session = validateAdminSession(req);
        if (!session.isValid) {
            return NextResponse.json({ error: session.error || "Unauthorized: Admin session required" }, { status: 401 });
        }

        const body = await req.json();
        const current = await getCollectionData("skills", defaultSkills);
        const index = current.findIndex(s => s.id === body.id || s.title === body.title);

        if (index >= 0) {
            current[index] = { ...current[index], ...body };
        } else {
            current.push(body);
        }

        await saveCollectionData("skills", current);
        return NextResponse.json({ success: true, result: current });
    } catch (e) {
        return NextResponse.json({ error: "Failed to edit skills" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const session = validateAdminSession(req);
        if (!session.isValid) {
            return NextResponse.json({ error: session.error || "Unauthorized: Admin session required" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const title = searchParams.get('title');

        if (!id && !title) {
            return NextResponse.json({ error: "Missing required query parameter: id or title" }, { status: 400 });
        }

        const current = await getCollectionData("skills", defaultSkills);
        const filtered = current.filter(s => s.id !== id && s.title !== title);
        await saveCollectionData("skills", filtered);
        return NextResponse.json({ success: true, result: filtered });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete skill category" }, { status: 500 });
    }
}
