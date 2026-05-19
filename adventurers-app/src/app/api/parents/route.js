import parentsService from "@/services/parentsService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const parents = await parentsService.list();
  return NextResponse.json(parents);
}
