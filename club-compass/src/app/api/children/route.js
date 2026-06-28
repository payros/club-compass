import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const children = await childrenService.list(search)
  return NextResponse.json(children)
}

export async function POST(request) {
  try {
    const data = await request.json()
    const child = await childrenService.create(data)
    return NextResponse.json(child, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: err.message ?? 'Could not create child' }, { status: 500 })
  }
}
