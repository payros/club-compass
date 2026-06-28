import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const awards = await childrenService.getAwardsByChildId(id)
  return NextResponse.json(awards)
}
