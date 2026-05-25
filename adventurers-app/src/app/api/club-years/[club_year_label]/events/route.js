import eventsService from '@/services/eventsService'
import { NextResponse } from 'next/server'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const events = await eventsService.listByClubYear(clubYearLabel, search)
  return NextResponse.json(events)
}

export async function POST(request, { params }) {
  const newEventData = await request.json()
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']

  const eventRecord = await eventsService.create({
    ...newEventData,
    club_year_label: clubYearLabel,
    award_ceremony: newEventData.award_ceremony === 'on' ? true : false,
  })
  return NextResponse.json(eventRecord ?? {})
}
