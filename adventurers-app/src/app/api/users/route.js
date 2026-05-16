import usersService from '@/services/usersService'
import { NextResponse } from 'next/server'

export async function GET() {
  const users = await usersService.list()
  return NextResponse.json(users)
}
