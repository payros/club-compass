import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET(request, { params }) {
  const pathParams = await params
  const clubYearLabel = pathParams['club_year_label']
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const children = await childrenService.listByClubYear(clubYearLabel, search)
  return NextResponse.json(children)
}
