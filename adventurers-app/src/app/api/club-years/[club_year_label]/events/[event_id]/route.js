import eventsService from '@/services/eventsService'
import { NextResponse } from 'next/server'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']
  const eventId = pathParams['event_id']
  const events = await eventsService.getById(clubYearLabel, eventId)
  return NextResponse.json(events)
}

export async function PATCH(request, { params }) {
  const updatedEventData = await request.json()
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']
  const eventId = pathParams['event_id']

  if ('award_ceremony' in updatedEventData) {
    updatedEventData.award_ceremony = updatedEventData.award_ceremony === 'on' ? true : false
  }

  const eventRecord = await eventsService.update(clubYearLabel, eventId, updatedEventData)
  return NextResponse.json(eventRecord ?? {})
}
