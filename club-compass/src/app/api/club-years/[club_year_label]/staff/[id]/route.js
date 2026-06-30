import staffService from '@/services/staffService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { club_year_label: clubYearLabel, id } = await params
  const staff = await staffService.getByIdForClubYear(id, clubYearLabel)
  if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(staff)
}
