/**
 * Uses R2 if R2_ENDPOINT is set, otherwise falls back to local disk.
 */

let adapter = null

async function getStorageAdapter() {
  if (adapter) return adapter

  if (process.env.R2_ENDPOINT) {
    const mod = await import('./s3Adapter.js')
    adapter = mod.default
    console.log('[storage] Using R2 backend')
  } else {
    const mod = await import('./localAdapter.js')
    adapter = mod.default
    console.log('[storage] Using local backend')
  }

  return adapter
}

/**
 * Returns true if the value is already a fully-resolved URL or absolute path
 * (i.e. a legacy value stored before the storage-key convention).
 */
function isAlreadyUrl(value) {
  return value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')
}

/**
 * Resolves a storage key to a display URL.
 * - If the value is already a URL or absolute path, returns it as-is.
 * - For local backend returns a public path; for R2 returns a presigned URL.
 * - Returns null if value is falsy.
 * @param {string|null} value  storage key OR legacy URL/path
 * @returns {Promise<string|null>}
 */
async function resolveImageUrl(value) {
  if (!value) return null
  if (isAlreadyUrl(value)) return value
  try {
    const storage = await getStorageAdapter()
    return await storage.getUrl(value)
  } catch (err) {
    console.error('[storage] resolveImageUrl error:', err)
    return null
  }
}

export { getStorageAdapter, resolveImageUrl }
