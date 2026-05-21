import eventsService from '@/services/eventsService'
import { NextResponse } from 'next/server'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET(request, { params }) {
  const { event_id } = await params
  const event = await eventsService.getById(event_id)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
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
