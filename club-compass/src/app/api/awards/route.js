import awardsService from '@/services/awardsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const awards = await awardsService.list(null, search)
  return NextResponse.json(awards)
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, level, type, link } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required.' }, { status: 400 })
    }

    const award = await awardsService.create({ name, level, type, link: link || null })
    return NextResponse.json(award, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not create award. Please try again.' }, { status: 500 })
  }
}
