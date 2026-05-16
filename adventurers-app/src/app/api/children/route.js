import childrenService from '@/services/childrenService'
import { NextResponse } from 'next/server'

export async function GET() {
  const children = await childrenService.list()
  return NextResponse.json(children)
}
