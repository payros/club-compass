import awardsService from '@/services/awardsService'
import { resolveImageUrl } from '@/lib/storage/index.js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { id } = await params
  const award = await awardsService.getById(id)
  if (!award) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({
    ...award,
    patchImageUrl: await resolveImageUrl(award.patchImageUrl),
  })
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, level, type, link } = body

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required.' }, { status: 400 })
    }

    const award = await awardsService.update(id, { name, level, type, link: link || null })
    if (!award) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json(award)
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Could not update award. Please try again.' }, { status: 500 })
  }
}
