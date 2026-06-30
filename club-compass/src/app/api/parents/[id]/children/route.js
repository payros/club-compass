import parentsService from '@/services/parentsService'
import { NextResponse } from 'next/server'

export async function GET(request, { params }) {
  const { id } = await params
  const children = await parentsService.getChildrenByParentId(id)
  return NextResponse.json(children)
}
