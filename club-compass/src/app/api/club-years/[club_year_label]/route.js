import clubYearsService from '@/services/clubYearsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const clubYear = await clubYearsService.getByLabel(club_year_label)
  if (!clubYear) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(clubYear)
}
