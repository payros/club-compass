import familiesService from '@/services/familiesService'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search') || undefined
  const id = searchParams.get('id') || undefined
  const type = searchParams.get('type') || undefined
  // If id and type are present, get all family members using getMember()
  // /families?id=123&type=parent
  if (id && type) {
    const familyMember = await familiesService.getByMember(id, type)
    return NextResponse.json(familyMember)
  }
  const families = await familiesService.list(search)
  return NextResponse.json(families)
}
