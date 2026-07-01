import familiesService from '@/services/familiesService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id') || undefined
  const type = searchParams.get('type') || undefined

  if (id && type) {
    const familyMember = await familiesService.getByMember(id, type, club_year_label)
    return NextResponse.json(familyMember)
  }

  const search = searchParams.get('search') || undefined
  const families = await familiesService.list(search)
  return NextResponse.json(families)
}

export async function POST(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']

  try {
    const familyMembers = await request.json()

    if (typeof familyMembers !== 'object' || !familyMembers.parents?.length || !familyMembers.children?.length) {
      return NextResponse.json({ error: 'No family members provided.' }, { status: 400 })
    }

    const result = await familiesService.enroll(clubYearLabel, familyMembers)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Enroll family error:', err)
    return NextResponse.json({ error: 'Family could not be enrolled. Please try again.' }, { status: 500 })
  }
}
