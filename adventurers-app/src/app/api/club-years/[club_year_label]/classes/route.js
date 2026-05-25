import classService from '@/services/classService'
import { NextResponse } from 'next/server'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET(request, { params }) {
  const { club_year_label: clubYearLabel } = await params
  const class_ = await classService.listByClubYear(clubYearLabel)
  return NextResponse.json(class_)
}

export async function POST(request, { params }) {
  const { club_year_label: clubYearLabel } = await params
  try {
    const body = await request.json()
    const classes = Array.isArray(body) ? body : [body]

    if (!classes.length) {
      return NextResponse.json({ error: 'No classes provided.' }, { status: 400 })
    }

    for (const cls of classes) {
      if (!cls.class || !cls.instructor_id) {
        return NextResponse.json({ error: 'Class name and instructor are required for every class.' }, { status: 400 })
      }
    }

    const result = await classService.create(clubYearLabel, classes)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Create classes error:', err)
    return NextResponse.json({ error: 'Could not add classes. Please try again.' }, { status: 500 })
  }
}
