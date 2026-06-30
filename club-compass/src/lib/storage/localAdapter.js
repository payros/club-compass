import fs from 'fs/promises'
import path from 'path'

// Writes to /public/uploads/{filename} and serves at /uploads/{filename}
const PATCHES_DIR = path.join(process.cwd(), 'public', 'uploads')

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true })
}

function keyToFilename(key) {
  // "awards/42/patch.webp" → "42.webp"
  return key.split('/').slice(-2, -1)[0] + '.webp'
}

/**
 * @param {string} key  e.g. "awards/42/patch.webp"
 * @param {Buffer} buffer
 * @returns {string} storage key
 */
async function put(key, buffer) {
  const filename = keyToFilename(key)
  await ensureDir(PATCHES_DIR)
  await fs.writeFile(path.join(PATCHES_DIR, filename), buffer)
  return key
}

/**
 * @param {string} key  e.g. "awards/42/patch.webp"
 * @returns {string} public URL path e.g. "/img/patches/42.webp"
 */
function getUrl(key) {
  return `/uploads/${keyToFilename(key)}`
}

/**
 * @param {string} key  e.g. "awards/42/patch.webp"
 */
async function remove(key) {
  const filename = keyToFilename(key)
  try {
    await fs.unlink(path.join(PATCHES_DIR, filename))
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

const localAdapter = { put, getUrl, remove }
export default localAdapter
