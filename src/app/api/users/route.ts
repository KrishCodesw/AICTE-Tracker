import { NextResponse } from "next/server";
import { listUsers } from "@/prisma/users";

export async function GET() {
  try {
    const users = await listUsers(10);
    return NextResponse.json(users ?? []);
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}