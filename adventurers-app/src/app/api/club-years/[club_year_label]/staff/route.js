import staffService from '@/services/staffService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']
  const staff = await staffService.listByClubYear(clubYearLabel)
  return NextResponse.json(staff)
}
