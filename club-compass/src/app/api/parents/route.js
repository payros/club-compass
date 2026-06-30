import parentsService from '@/services/parentsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const parents = await parentsService.list(search)
  return NextResponse.json(parents)
}
