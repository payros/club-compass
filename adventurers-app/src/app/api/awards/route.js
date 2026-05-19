import awardsService from '@/services/awardsService';
import { NextResponse } from 'next/server'

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export async function GET(request) {
  const awards = await awardsService.listAwards();
  return NextResponse.json(awards);
}