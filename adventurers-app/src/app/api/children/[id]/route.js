import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const child = await childrenService.getById(id)
  if (!child) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(child)
}
