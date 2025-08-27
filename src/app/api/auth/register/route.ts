import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "inrext";

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
    const { email, username, password, phoneNumber } = await req.json();

    if (!email || !username || !password || !phoneNumber) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    const client = await connectToDatabase();
    const db = client.db(dbName);

    // check if user already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create new user object (matching your DB schema)
    const newUser = {
      uid: randomUUID(),
      username,
      email,
      phoneNumber,
      password: hashedPassword,
      role: "associate",
      permissions: {},
      assignedProjects: [],
      isActive: true,
      teamHead: null,
      associates: [],
      hierarchyLevel: 1,
      hierarchyPath: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);

    return NextResponse.json(
      {
        message: "User registered successfully",
        data: {
          uid: newUser.uid,
          username: newUser.username,
          email: newUser.email,
          phoneNumber: newUser.phoneNumber,
          role: newUser.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error registering user:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
