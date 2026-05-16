import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const parents = await childrenService.getParentsByChildId(id)
  return NextResponse.json(parents)
}
