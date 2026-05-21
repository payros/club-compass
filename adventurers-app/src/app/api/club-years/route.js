import clubYearService from "@/services/clubYearService";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET() {
  const clubYearList = await clubYearService.list();
  return NextResponse.json(clubYearList);
}

export async function POST(request) {
  const newClubYearData = await request.json();
  try {
    const clubYearRecord = await clubYearService.create(newClubYearData);
    return NextResponse.json(clubYearRecord ?? {});
  } catch (err) {
    if (
      err.code === "23505" &&
      err.constraint_name === "club_years_label_key"
    ) {
      return NextResponse.json(
        {
          error: "A club year with this label already exists.",
          field: "label",
        },
        { status: 409 },
      );
    }
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create club year." },
      { status: 500 },
    );
  }
}
