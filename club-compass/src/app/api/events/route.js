import eventsService from '@/services/eventsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const isAwardCeremonyParam = searchParams.get('is_award_ceremony')
  const isAwardCeremony = isAwardCeremonyParam === 'true' ? true : isAwardCeremonyParam === 'false' ? false : null
  const events = await eventsService.list(search, isAwardCeremony)
  return NextResponse.json(events)
}
