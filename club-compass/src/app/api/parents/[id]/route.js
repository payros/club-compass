import parentsService from '@/services/parentsService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const parent = await parentsService.getById(id)
  if (!parent) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(parent)
}
