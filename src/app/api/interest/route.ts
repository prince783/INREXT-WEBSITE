import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "inrext"; // Make sure this matches your Compass DB name

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(uri);
  await client.connect();
  cachedClient = client;
  return client;
}

export async function POST(req: NextRequest) {
  try {
    const { name, phone, email, propertyName } = await req.json();
    if (!name || !phone || !email) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    const client = await connectToDatabase();
    const db = client.db(dbName);
    const collection = db.collection("interests");
    const result = await collection.insertOne({
      name,
      phone,
      email,
      propertyName: propertyName || null,
      createdAt: new Date(),
    });
    if (!result.acknowledged) {
      return NextResponse.json({ error: "Insert failed" }, { status: 500 });
    }
    return NextResponse.json({ success: true, insertedId: result.insertedId });
  } catch (err: any) {
    console.error("MongoDB Insert Error:", err);
    return NextResponse.json({ error: err?.message || "Server error" }, { status: 500 });
  }
}
