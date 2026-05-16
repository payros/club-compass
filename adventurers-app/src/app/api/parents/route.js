import parentsService from '@/services/parentsService'
import { NextResponse } from 'next/server'

export async function GET() {
  const parents = await parentsService.list()
  return NextResponse.json(parents)
}
