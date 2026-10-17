import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        if (!clientPromise) {
            return NextResponse.json([]);
        }
        const client = await clientPromise;
        const db = client.db("portfolio_db");

        // "journey" কালেকশন থেকে ডাটা রিড করবে
        const journey = await db.collection("journey").find({}).sort({ _id: -1 }).toArray();

        return NextResponse.json(journey.length > 0 ? journey : []);
    } catch (e) {
        return NextResponse.json([]);
    }
}

export async function POST(req) {
    try {
        const client = await clientPromise;
        const db = client.db("portfolio_db");
        const body = await req.json();

        // যদি ডাটা array হয় (একাধিক Journey একসাথে ইনসার্ট করতে চাইলে)
        if (Array.isArray(body)) {
            await db.collection("journey").deleteMany({}); // আগের ডাটা ক্লিয়ার
            const mappedBody = body.map(item => ({ ...item, createdAt: new Date() }));
            const result = await db.collection("journey").insertMany(mappedBody); // নতুন ডাটা ইনসার্ট
            return NextResponse.json({ success: true, result });
        }

        // যদি সিঙ্গেল অবজেক্ট পাঠায়
        const newEntry = { ...body, createdAt: new Date() };
        const result = await db.collection("journey").insertOne(newEntry);

        return NextResponse.json({ success: true, result });
    } catch (e) {
        console.error("POST Journey API Error:", e);
        return NextResponse.json({ error: "Failed to update journey data", details: e.message }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const client = await clientPromise;
        const db = client.db("portfolio_db");
        const body = await req.json();

        if (!body.title) {
            return NextResponse.json({ error: "Title is required to update a journey entry" }, { status: 400 });
        }

        // title এর উপর ভিত্তি করে আপডেট করবে
        const result = await db.collection("journey").updateOne(
            { title: body.title },
            {
                $set: {
                    company: body.company,
                    type: body.type,
                    period: body.period,
                    description: body.description
                }
            }
        );

        return NextResponse.json({ success: true, result });
    } catch (e) {
        console.error("PUT Journey API Error:", e);
        return NextResponse.json({ error: "Failed to update journey data", details: e.message }, { status: 500 });
    }
}

export async function DELETE(req) {
    try {
        const client = await clientPromise;
        const db = client.db("portfolio_db");

        const { searchParams } = new URL(req.url);
        const title = searchParams.get('title');

        if (title) {
            // যদি title দেওয়া থাকে, তাহলে শুধু ওই Journey ডিলিট করবে
            const result = await db.collection("journey").deleteOne({ title });
            return NextResponse.json({ success: true, result });
        } else {
            // যদি title না থাকে, তাহলে সব ডেটা ক্লিয়ার করে ফেলবে
            const result = await db.collection("journey").deleteMany({});
            return NextResponse.json({ success: true, result });
        }
    } catch (e) {
        console.error("DELETE Journey API Error:", e);
        return NextResponse.json({ error: "Failed to delete journey data", details: e.message }, { status: 500 });
    }
}