import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";
import { validateAdminSession, sanitizeUrl } from "@/lib/auth";

const defaultContacts = [
    { name: "github", username: "OxL3on", link: "https://github.com/OxL3on" },
    { name: "linkedin", username: "MD Leon Islam", link: "https://www.linkedin.com/in/mdleonislam/" },
    { name: "discord", username: "luffy_111000", link: "https://discord.com/users/luffy_111000" },
    { name: "twitter", username: "OxL3on", link: "https://twitter.com/OxL3on" },
    { name: "tryhackme", username: "OxL3on", link: "https://tryhackme.com/p/OxL3on" },
    { name: "hackthebox", username: "OxL3on", link: "https://app.hackthebox.com/profile/OxL3on" },
    { name: "medium", username: "@OxL3on", link: "https://medium.com/@OxL3on" }
];

export async function GET() {
    try {
        const contacts = await getCollectionData("contact", defaultContacts);
        return NextResponse.json(contacts && contacts.length > 0 ? contacts : defaultContacts);
    } catch (error) {
        return NextResponse.json(defaultContacts);
    }
}

export async function POST(req) {
    const auth = await validateAdminSession(req);
    if (!auth.authenticated) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const current = await getCollectionData("contact", defaultContacts);

        let updated = [];
        if (Array.isArray(data)) {
            updated = data.map(item => ({
                ...item,
                link: item.link ? sanitizeUrl(item.link) : ""
            }));
        } else {
            const cleanData = {
                ...data,
                link: data.link ? sanitizeUrl(data.link) : ""
            };
            const index = current.findIndex(c => c.name && cleanData.name && c.name.toLowerCase() === cleanData.name.toLowerCase());
            if (index >= 0) {
                current[index] = { ...current[index], ...cleanData };
                updated = current;
            } else {
                updated = [...current, cleanData];
            }
        }

        await saveCollectionData("contact", updated);
        return NextResponse.json({ success: true, result: updated });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update contact(s)" }, { status: 500 });
    }
}
