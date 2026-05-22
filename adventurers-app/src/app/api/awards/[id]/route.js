import awardsService from '@/services/awardsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { id } = await params
  const award = await awardsService.getById(id)
  if (!award) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(award)
}
