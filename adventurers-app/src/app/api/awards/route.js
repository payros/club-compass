import awardsService from "@/services/awardsService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const awards = await awardsService.list();
  return NextResponse.json(awards);
}
