import usersService from "@/services/usersService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const users = await usersService.list();
  return NextResponse.json(users);
}
