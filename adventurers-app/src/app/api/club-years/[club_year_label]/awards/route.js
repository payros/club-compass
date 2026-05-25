import awardsService from '@/services/awardsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const awards = await awardsService.list(club_year_label, search)
  return NextResponse.json(awards)
}
