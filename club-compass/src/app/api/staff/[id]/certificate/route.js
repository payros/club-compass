import { NextResponse } from 'next/server'
import staffService from '@/services/staffService'
import { getStorageAdapter, resolveImageUrl } from '@/lib/storage/index.js'

export const dynamic = 'force-dynamic'

const MAX_BYTES = parseInt(process.env.NEXT_PUBLIC_MAX_CERTIFICATE_UPLOAD_SIZE ?? '5242880', 10)
const PDF_MAGIC = '%PDF-'

export async function POST(request, { params }) {
  const { id } = await params

  const staffMember = await staffService.getById(id)
  if (!staffMember) {
    return NextResponse.json({ error: 'Staff member not found' }, { status: 404 })
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 })
  }

  const expirationRaw = formData.get('expiration')
  const expiration = typeof expirationRaw === 'string' && expirationRaw ? new Date(expirationRaw) : null
  if (!expiration || Number.isNaN(expiration.getTime())) {
    return NextResponse.json({ error: 'A certificate expiration date is required.' }, { status: 400 })
  }
  if (expiration <= new Date()) {
    return NextResponse.json({ error: 'The certificate expiration date must be in the future.' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string' || file.size === 0) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Unsupported file type. Upload a PDF.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.byteLength > MAX_BYTES) {
    return NextResponse.json(
      { error: `File too large. Maximum size is ${Math.round(MAX_BYTES / (1024 * 1024))} MB.` },
      { status: 400 }
    )
  }
  if (buffer.subarray(0, PDF_MAGIC.length).toString('latin1') !== PDF_MAGIC) {
    return NextResponse.json({ error: 'The file is not a valid PDF.' }, { status: 400 })
  }

  let key
  try {
    const storage = await getStorageAdapter()
    key = await storage.put(`staff/staff-${id}/certificate.pdf`, buffer, 'application/pdf')
  } catch (err) {
    console.error('[staff certificate upload] storage error:', err)
    return NextResponse.json({ error: 'Failed to store certificate.' }, { status: 500 })
  }

  try {
    await staffService.updateCertificate(id, key, expiration.toISOString())
  } catch (err) {
    console.error('[staff certificate upload] db error:', err)
    return NextResponse.json({ error: 'Certificate stored but DB update failed.' }, { status: 500 })
  }

  const certificateUrl = await resolveImageUrl(key)
  return NextResponse.json({ certificateUrl })
}
