import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const children = await childrenService.getByParentId(id)
  return NextResponse.json(children)
}
