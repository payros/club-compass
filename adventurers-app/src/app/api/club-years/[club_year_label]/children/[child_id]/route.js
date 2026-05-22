import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { club_year_label, child_id } = await params
  const child = await childrenService.getById(child_id, club_year_label)
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(child)
}
