import staffService from '@/services/staffService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const staff = await staffService.list(search, clubYearLabel)
  return NextResponse.json(staff)
}

export async function POST(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']

  try {
    const body = await request.json()
    const staffMembers = Array.isArray(body) ? body : [body]

    if (!staffMembers.length) {
      return NextResponse.json({ error: 'No staff members provided.' }, { status: 400 })
    }

    for (const member of staffMembers) {
      if (!member.first_name || !member.last_name) {
        return NextResponse.json(
          { error: 'First name and last name are required for every staff member.' },
          { status: 400 }
        )
      }
    }

    const result = await staffService.enroll(clubYearLabel, staffMembers)
    return NextResponse.json(result)
  } catch (err) {
    console.error('Enroll staff error:', err)
    return NextResponse.json({ error: 'Staff could not be enrolled. Please try again.' }, { status: 500 })
  }
}
