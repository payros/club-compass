import awardsService from '@/services/awardsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const awards = await awardsService.list(club_year_label)
  return NextResponse.json(awards)
}
