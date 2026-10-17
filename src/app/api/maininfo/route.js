import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";

const defaultMainInfo = {
    name: "MD Leon Islam",
    siteTitle: "LEON",
    tagline: "CYBERSECURITY & OFFENSIVE SECURITY ENTHUSIAST",
    greeting: "Hi, I'm MD Leon Islam.",
    image: "/profile.jpg",
    coverImage: "/china-mountains.jpg",
    logoImage: "/logo.png",
    description: "I'm Md Leon Islam, a Computer Science and Engineering student at Patuakhali Science and Technology University (PSTU) (currently in my 5th semester), passionate about cybersecurity, penetration testing, and offensive security. My interests include web application security, network security, vulnerability assessment, and bug bounty hunting.",
    bio: "CSE student at PSTU and Offensive Security enthusiast",
    gmail: "leonislamofficial123@gmail.com",
    role: "Cybersecurity Student",
    location: "Patuakhali / Barishal, Bangladesh",
    status: "Available for Opportunities",
    github: "OxL3on",
    roles: [
      "Penetration Tester",
      "CTF Player",
      "Network Security",
      "Bug Bounty Hunter",
      "Offensive Security Enthusiast"
    ]
};

export async function GET() {
    try {
        const info = await getCollectionData("mainInfo", defaultMainInfo);
        return NextResponse.json(info || defaultMainInfo);
    } catch (e) {
        return NextResponse.json(defaultMainInfo);
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const current = await getCollectionData("mainInfo", defaultMainInfo);
        const updated = {
            ...current,
            ...body,
            updatedAt: new Date()
        };
        await saveCollectionData("mainInfo", updated);
        return NextResponse.json({ success: true, result: updated });
    } catch (e) {
        console.error("POST MainInfo Error:", e);
        return NextResponse.json({ error: "Failed to update main info", details: e.message }, { status: 500 });
    }
}