import eventsService from '@/services/eventsService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { event_id } = await params
  const event = await eventsService.getById(event_id)
  if (!event) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(event)
}
