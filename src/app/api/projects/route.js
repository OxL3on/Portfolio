import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";

const defaultProjects = [
    {
        id: "proj-1",
        title: 'Automated Vulnerability Scanner',
        type: 'Security Tool',
        date: '2024',
        Date: '2024',
        description: 'A multi-threaded vulnerability scanner designed to detect web application misconfigurations, unpatched CVEs, and OWASP Top 10 vulnerabilities.',
        tags: ['Python', 'Socket', 'BeautifulSoup', 'CVE Detection', 'Security'],
        github: 'https://github.com/OxL3on',
    },
    {
        id: "proj-2",
        title: 'Network Recon & Port Scanner',
        type: 'Network Security',
        date: '2024',
        Date: '2024',
        description: 'High-performance network reconnaissance tool with asynchronous service enumeration, TCP/UDP port scanning, and banner grabbing.',
        tags: ['Python', 'Networking', 'TCP/IP', 'Scapy', 'Nmap Engine'],
        github: 'https://github.com/OxL3on',
    },
    {
        id: "proj-3",
        title: 'JWT Flaw Exploiter & Analyzer',
        type: 'Web Security',
        date: '2023',
        Date: '2023',
        description: 'Automated security testing script for JSON Web Tokens, testing for signature strip bypasses, algorithm confusion, and brute-forcing weak keys.',
        tags: ['Python', 'Cryptography', 'JWT', 'REST API', 'Offensive Sec'],
        github: 'https://github.com/OxL3on',
    },
    {
        id: "proj-4",
        title: 'Subdomain & Attack Surface Enumerator',
        type: 'Bug Bounty Tool',
        date: '2023',
        Date: '2023',
        description: 'Fast asynchronous OSINT reconnaissance script aggregating Certificate Transparency logs and passive DNS records to uncover target attack surfaces.',
        tags: ['Bash', 'Python', 'OSINT', 'Bug Bounty', 'Automation'],
        github: 'https://github.com/OxL3on',
    }
];

export async function GET() {
    try {
        const projects = await getCollectionData("projects", defaultProjects);
        return NextResponse.json(projects.length > 0 ? projects : defaultProjects);
    } catch (e) {
        return NextResponse.json(defaultProjects);
    }
}

export async function POST(req) {
    try {
        const body = await req.json();
        const current = await getCollectionData("projects", defaultProjects);

        let updatedList = [];
        if (Array.isArray(body)) {
            updatedList = body;
        } else {
            const newItem = {
                id: body.id || `proj-${Date.now()}`,
                ...body,
                createdAt: new Date()
            };
            updatedList = [newItem, ...current];
        }

        await saveCollectionData("projects", updatedList);
        return NextResponse.json({ success: true, result: updatedList });
    } catch (e) {
        console.error("POST Projects API Error:", e);
        return NextResponse.json({ error: "Failed to update projects", details: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const body = await req.json();
        const current = await getCollectionData("projects", defaultProjects);
        const index = current.findIndex(p => p.id === body.id || p.title === body.title);

        if (index >= 0) {
            current[index] = { ...current[index], ...body, updatedAt: new Date() };
        } else {
            current.push({ ...body, id: body.id || `proj-${Date.now()}` });
        }

        await saveCollectionData("projects", current);
        return NextResponse.json({ success: true, result: current });
    } catch (e) {
        return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const title = searchParams.get('title');
        const current = await getCollectionData("projects", defaultProjects);

        const filtered = current.filter(p => p.id !== id && p.title !== title);
        await saveCollectionData("projects", filtered);
        return NextResponse.json({ success: true, result: filtered });
    } catch (e) {
        return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
    }
}
