import childrenService from "@/services/childrenService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const children = await childrenService.list();
  return NextResponse.json(children);
}
