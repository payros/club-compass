import eventsService from '@/services/eventsService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { event_id } = await params
  const awardsConfig = await eventsService.getEventAwardsForEdit(event_id)
  return NextResponse.json(awardsConfig)
}
