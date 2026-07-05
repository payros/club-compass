import parentsService from '@/services/parentsService'
import childrenService from '@/services/childrenService'
import staffService from '@/services/staffService'
import { generateRegistrationPdf } from '@/utils/pdfUtils'
import { NextResponse } from 'next/server'
import clubYearsService from '@/services/clubYearsService'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  const { club_year_label } = await params
  const { searchParams } = new URL(request.url)
  const parentId = searchParams.get('parentId')

  if (!parentId) {
    return NextResponse.json({ error: 'parentId is required.' }, { status: 400 })
  }

  const [parent, children, clubYear, clubDirector] = await Promise.all([
    parentsService.getById(Number(parentId)),
    childrenService.getByParentId(Number(parentId), club_year_label),
    clubYearsService.getByLabel(club_year_label),
    staffService.getByRole(club_year_label, 'director'),
  ])

  if (!parent) {
    return NextResponse.json({ error: 'Parent not found.' }, { status: 404 })
  }

  if (!children.length) {
    return NextResponse.json({ error: 'No children enrolled for this parent in this club year.' }, { status: 400 })
  }

  const pdfBytes = await generateRegistrationPdf(parent, children, clubYear, clubDirector)

  const lastName = parent.lastName ?? 'family'
  return new Response(pdfBytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="registration-${lastName}.pdf"`,
    },
  })
}
