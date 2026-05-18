import staffService from "@/services/staffService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const staff = await staffService.list();
  return NextResponse.json(staff);
}
