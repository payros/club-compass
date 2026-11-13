import awardsService from '@/services/awardsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const toBeAwardedAtParam = searchParams.get('toBeAwardedAt')
  const toBeAwardedAt = toBeAwardedAtParam ? parseInt(toBeAwardedAtParam, 10) : undefined
  if (toBeAwardedAtParam && Number.isNaN(toBeAwardedAt)) {
    return NextResponse.json({ error: 'toBeAwardedAt must be an event id' }, { status: 400 })
  }
  const awards = await awardsService.list(club_year_label, search, toBeAwardedAt)
  return NextResponse.json(awards)
}
