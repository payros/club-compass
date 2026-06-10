import classesService from '@/services/classesService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { club_year_label: clubYearLabel, class_name: className } = await params
  const cls = await classesService.getByName(clubYearLabel, className)
  if (!cls) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(cls)
}
