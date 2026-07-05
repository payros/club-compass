import clubYearsService from '@/services/clubYearsService'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const clubYear = await clubYearsService.getByLabel(club_year_label)
  if (!clubYear) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json(clubYear)
}

export async function PATCH(request, { params }) {
  const { club_year_label } = await params
  const data = await request.json()
  try {
    const updated = await clubYearsService.update(club_year_label, data)
    if (!updated) {
      return NextResponse.json({ error: 'Club year not found.' }, { status: 404 })
    }
    return NextResponse.json(updated)
  } catch (err) {
    if (err.code === '23505' && err.constraint_name === 'club_years_label_key') {
      return NextResponse.json(
        { error: 'A club year with this label already exists.', field: 'label' },
        { status: 409 }
      )
    }
    console.error(err)
    return NextResponse.json({ error: 'Failed to update club year.' }, { status: 500 })
  }
}
