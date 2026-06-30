import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { club_year_label, child_id } = await params
  const child = await childrenService.getById(child_id, club_year_label)
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(child)
}

export async function PATCH(request, { params }) {
  const { club_year_label, child_id } = await params
  const updatedData = await request.json()
  try {
    const child = await childrenService.update(child_id, { ...updatedData, clubYearLabel: club_year_label })
    if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(child)
  } catch (err) {
    return NextResponse.json({ error: err.message ?? 'Update failed' }, { status: 500 })
  }
}
