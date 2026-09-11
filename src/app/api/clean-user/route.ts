import { db } from "@/prisma/db";
import { NextResponse } from "next/server";

export async function GET() {
  await db.orm.public.User.where({ email: "krishjain.w@gmail.com" }).delete();
  return NextResponse.json({ message: "User deleted successfully" });
}