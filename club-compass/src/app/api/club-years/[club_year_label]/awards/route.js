import awardsService from '@/services/awardsService'
import { resolveImageUrl } from '@/lib/storage/index.js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const awards = await awardsService.list(club_year_label, search)
  const resolved = await Promise.all(
    awards.map(async (a) => ({
      ...a,
      patchImageUrl: await resolveImageUrl(a.patchImageUrl),
    }))
  )
  return NextResponse.json(resolved)
}
