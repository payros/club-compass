import awardsService from '@/services/awardsService'
import { NextResponse } from 'next/server'

export async function GET() {
  const awards = await awardsService.list()
  return NextResponse.json(awards)
}
