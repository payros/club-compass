import staffService from '@/services/staffService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const staff = await staffService.getById(id)
  if (!staff) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(staff)
}
