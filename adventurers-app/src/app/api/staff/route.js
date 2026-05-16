import staffService from '@/services/staffService'
import { NextResponse } from 'next/server'

export async function GET() {
  const staff = await staffService.list()
  return NextResponse.json(staff)
}
