import { NextResponse } from 'next/server'
import sharp from 'sharp'
import childrenService from '@/services/childrenService'
import { getStorageAdapter, resolveImageUrl } from '@/lib/storage/index.js'

export const dynamic = 'force-dynamic'

const MAX_BYTES = parseInt(process.env.NEXT_PUBLIC_MAX_UPLOAD_SIZE ?? '1048576', 10)
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function POST(request, { params }) {
  const { id } = await params

  const child = await childrenService.getById(id)
  if (!child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  let formData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart body' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || typeof file === 'string') {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  }

  if (!ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Unsupported file type. Upload a JPEG, PNG, WebP, or GIF.' }, { status: 400 })
  }

  if (typeof file.size === 'number' && file.size > MAX_BYTES) {
    return NextResponse.json({ error: `File too large. Maximum size is ${MAX_BYTES / 1024} KB.` }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const inputBuffer = Buffer.from(arrayBuffer)

  if (inputBuffer.byteLength > MAX_BYTES) {
    return NextResponse.json({ error: `File too large. Maximum size is ${MAX_BYTES / 1024} KB.` }, { status: 400 })
  }

  let webpBuffer
  try {
    webpBuffer = await sharp(inputBuffer)
      .resize(512, 512, { fit: 'cover', position: 'attention' })
      .webp({ quality: 70 })
      .toBuffer()
  } catch {
    return NextResponse.json({ error: 'Could not process image.' }, { status: 422 })
  }

  let key
  try {
    const storage = await getStorageAdapter()
    key = await storage.put(`children/child-${id}/profile.webp`, webpBuffer)
  } catch (err) {
    console.error('[child photo upload] storage error:', err)
    return NextResponse.json({ error: 'Failed to store image.' }, { status: 500 })
  }

  try {
    await childrenService.updateProfileImageUrl(id, key)
  } catch (err) {
    console.error('[child photo upload] db error:', err)
    return NextResponse.json({ error: 'Image stored but DB update failed.' }, { status: 500 })
  }

  const profileImageUrl = await resolveImageUrl(key)
  return NextResponse.json({ profileImageUrl })
}

export async function DELETE(request, { params }) {
  const { id } = await params

  const child = await childrenService.getById(id)
  if (!child) {
    return NextResponse.json({ error: 'Child not found' }, { status: 404 })
  }

  if (child.profileImageUrl) {
    const key = `children/child-${id}/profile.webp`
    try {
      const storage = await getStorageAdapter()
      await storage.remove(key)
    } catch (err) {
      console.error('[child photo delete] storage error:', err)
      // Non-fatal: still clear the DB field
    }
  }

  try {
    await childrenService.updateProfileImageUrl(id, null)
  } catch (err) {
    console.error('[child photo delete] db error:', err)
    return NextResponse.json({ error: 'Failed to clear image URL.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
