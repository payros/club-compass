import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

/**
 * Parses R2_ENDPOINT into a base endpoint URL and bucket name.
 * Expected format: https://<account_id>.r2.cloudflarestorage.com/<bucket-name>
 */
function parseEndpoint() {
  const raw = process.env.R2_ENDPOINT
  if (!raw) throw new Error('Missing R2_ENDPOINT env var.')
  const url = new URL(raw)
  const bucket = url.pathname.replace(/^\//, '').replace(/\/$/, '')
  if (!bucket)
    throw new Error(
      'R2_ENDPOINT must include the bucket name as the path segment (e.g. https://<account>.r2.cloudflarestorage.com/<bucket>).'
    )
  const endpoint = `${url.protocol}//${url.host}`
  return { endpoint, bucket }
}

function getClient() {
  const { endpoint } = parseEndpoint()
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY

  if (!accessKeyId || !secretAccessKey) {
    throw new Error('Missing R2 credentials. Set R2_ACCESS_KEY_ID and R2_SECRET_ACCESS_KEY.')
  }

  return new S3Client({
    region: 'auto',
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  })
}

function getBucket() {
  return parseEndpoint().bucket
}

const PRESIGNED_EXPIRY = 3600 // 1 hour

/**
 * @param {string} key  e.g. "awards/42/patch.webp"
 * @param {Buffer} buffer
 * @returns {string} storage key
 */
async function put(key, buffer) {
  const client = getClient()
  await client.send(
    new PutObjectCommand({
      Bucket: getBucket(),
      Key: key,
      Body: buffer,
      ContentType: 'image/webp',
    })
  )
  return key
}

/**
 * Generates a short-lived presigned GET URL for the given key.
 * Signing is local computation — no network call to R2.
 * @param {string} key  e.g. "awards/42/patch.webp"
 * @returns {Promise<string>} presigned URL valid for 1 hour
 */
async function getUrl(key) {
  const client = getClient()
  return getSignedUrl(client, new GetObjectCommand({ Bucket: getBucket(), Key: key }), { expiresIn: PRESIGNED_EXPIRY })
}

/**
 * @param {string} key  e.g. "awards/42/patch.webp"
 */
async function remove(key) {
  const client = getClient()
  await client.send(new DeleteObjectCommand({ Bucket: getBucket(), Key: key }))
}

const s3Adapter = { put, getUrl, remove }
export default s3Adapter
