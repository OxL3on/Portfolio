import { NextResponse } from "next/server";
import { getCollectionData, saveCollectionData } from "@/lib/db";

export const defaultCertifications = [
  {
    id: "cert-1",
    title: "eLearnSecurity Junior Penetration Tester (eJPT)",
    issuer: "INE Security",
    issueDate: "2024",
    credentialId: "INE-EJPT-849201",
    verifyUrl: "https://ine.com"
  },
  {
    id: "cert-2",
    title: "CompTIA Security+",
    issuer: "CompTIA",
    issueDate: "2024",
    credentialId: "COMP001029482",
    verifyUrl: "https://www.comptia.org"
  },
  {
    id: "cert-3",
    title: "Certified Ethical Hacker (CEH Practical)",
    issuer: "EC-Council",
    issueDate: "2024",
    credentialId: "ECC-CEHP-19283",
    verifyUrl: "https://www.eccouncil.org"
  },
  {
    id: "cert-4",
    title: "TryHackMe Pre-Security & Offensive Pentesting",
    issuer: "TryHackMe",
    issueDate: "2023",
    credentialId: "THM-CERT-294819",
    verifyUrl: "https://tryhackme.com"
  }
];

export async function GET() {
  try {
    const certs = await getCollectionData("certifications", defaultCertifications);
    return NextResponse.json(certs.length > 0 ? certs : defaultCertifications);
  } catch (e) {
    return NextResponse.json(defaultCertifications);
  }
}

export async function POST(req) {
  try {
    const body = await req.json();
    const current = await getCollectionData("certifications", defaultCertifications);

    let updatedList = [];
    if (Array.isArray(body)) {
      updatedList = body;
    } else {
      const newItem = {
        id: body.id || `cert-${Date.now()}`,
        ...body
      };
      updatedList = [newItem, ...current];
    }

    await saveCollectionData("certifications", updatedList);
    return NextResponse.json({ success: true, result: updatedList });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update certifications", details: e.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json();
    const current = await getCollectionData("certifications", defaultCertifications);
    const index = current.findIndex(c => c.id === body.id || c.title === body.title);

    if (index >= 0) {
      current[index] = { ...current[index], ...body };
    } else {
      current.push({ ...body, id: body.id || `cert-${Date.now()}` });
    }

    await saveCollectionData("certifications", current);
    return NextResponse.json({ success: true, result: current });
  } catch (e) {
    return NextResponse.json({ error: "Failed to update certification" }, { status: 500 });
  }
}

export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const title = searchParams.get('title');
    const current = await getCollectionData("certifications", defaultCertifications);

    const filtered = current.filter(c => c.id !== id && c.title !== title);
    await saveCollectionData("certifications", filtered);
    return NextResponse.json({ success: true, result: filtered });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete certification" }, { status: 500 });
  }
}
