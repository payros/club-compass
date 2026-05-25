import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const children = await childrenService.list(search)
  return NextResponse.json(children)
}
