/**
 * download-patches.mjs
 *
 * Downloads award patch images into adventurers-app/public/img/patches/
 * and generates a SQL migration file.
 *
 * Strategy:
 *   1. Crawl all paginated category pages on adventsource.org (stars, chips, awards)
 *      to build a normalised product-name -> product-URL map.
 *   2. For each award, find the closest matching product URL, fetch the page,
 *      and extract the Azure Blob image URL.
 *   3. Fall back to clubministries.org (plain PascalCase, then Awards_ prefix).
 *
 * Usage:
 *   node scripts/download-patches.mjs
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const PATCHES_DIR = path.join(ROOT, 'adventurers-app', 'public', 'img', 'patches')
const MIGRATION_FILE = path.join(ROOT, 'db', 'migrations', '20260614000000_awards_patch_image_urls.sql')
const ADS_BASE = 'https://www.adventsource.org'
const ADS_CATALOG_ROOT = `${ADS_BASE}/store/adventurer-club/investiture-patches-and-pins`
const CLUBMIN_BASE = 'https://www.clubministries.org/wp-content/uploads'

const CATALOG_SECTIONS = ['stars', 'chips', 'awards']

const LEVEL_PREFIX = {
  little_lambs: 'LittleLambsStars',
  eager_beavers: 'EagerBeaverChips',
  busy_bees: 'BusyBeeAwards',
  sunbeams: 'SunbeamAwards',
  builders: 'BuilderAwards',
  helping_hands: 'HelpingHandAwards',
}

const AWARDS = [
  { name: "ABC's", level: 'little_lambs' },
  { name: 'Bible Friends', level: 'little_lambs' },
  { name: 'Bodies of Water', level: 'little_lambs' },
  { name: 'Colors', level: 'little_lambs' },
  { name: 'Community Helper', level: 'little_lambs' },
  { name: 'Finger Play', level: 'little_lambs' },
  { name: 'Healthy Food', level: 'little_lambs' },
  { name: 'Healthy Me', level: 'little_lambs' },
  { name: 'Insects', level: 'little_lambs' },
  { name: 'Little Boy Jesus', level: 'little_lambs' },
  { name: 'Music', level: 'little_lambs' },
  { name: 'My Friend Jesus', level: 'little_lambs' },
  { name: 'Numbers', level: 'little_lambs' },
  { name: 'Sharing', level: 'little_lambs' },
  { name: 'Special Helper', level: 'little_lambs' },
  { name: 'Stars', level: 'little_lambs' },
  { name: 'Trains And Trucks', level: 'little_lambs' },
  { name: 'Trikes & Bikes', level: 'little_lambs' },
  { name: 'Weather', level: 'little_lambs' },
  { name: 'Wooly Lamb', level: 'little_lambs' },
  { name: 'Zoo Animals', level: 'little_lambs' },
  { name: 'Alphabet Fun', level: 'eager_beavers' },
  { name: 'Animal Homes', level: 'eager_beavers' },
  { name: 'Animals', level: 'eager_beavers' },
  { name: 'Beaver', level: 'eager_beavers' },
  { name: 'Beginning Biking', level: 'eager_beavers' },
  { name: 'Beginning Swimming', level: 'eager_beavers' },
  { name: 'Bible Friends (EB)', level: 'eager_beavers' },
  { name: 'Birds', level: 'eager_beavers' },
  { name: 'Crayons And Markers', level: 'eager_beavers' },
  { name: 'Fire Safety', level: 'eager_beavers' },
  { name: 'Gadgets And Sand', level: 'eager_beavers' },
  { name: "God's World", level: 'eager_beavers' },
  { name: 'Helping at Home', level: 'eager_beavers' },
  { name: "Jesus's Special Supper", level: 'eager_beavers' },
  { name: "Jesus' Star", level: 'eager_beavers' },
  { name: 'Jigsaw Puzzle', level: 'eager_beavers' },
  { name: 'Know Your Body', level: 'eager_beavers' },
  { name: 'Left And Right', level: 'eager_beavers' },
  { name: 'Manners Fun', level: 'eager_beavers' },
  { name: 'My Community Friends', level: 'eager_beavers' },
  { name: 'Pets', level: 'eager_beavers' },
  { name: 'Playing With Friends', level: 'eager_beavers' },
  { name: 'Scavenger Hunt', level: 'eager_beavers' },
  { name: 'Shapes And Sizes', level: 'eager_beavers' },
  { name: 'Sponge Art', level: 'eager_beavers' },
  { name: 'Stamping Fun', level: 'eager_beavers' },
  { name: 'Thankful Heart', level: 'eager_beavers' },
  { name: 'Toys', level: 'eager_beavers' },
  { name: 'Artist', level: 'busy_bees' },
  { name: 'Bible I', level: 'busy_bees' },
  { name: 'Butterfly', level: 'busy_bees' },
  { name: 'Buttons', level: 'busy_bees' },
  { name: 'Fish', level: 'busy_bees' },
  { name: 'Flowers', level: 'busy_bees' },
  { name: 'Friend of Animals', level: 'busy_bees' },
  { name: 'Guide', level: 'busy_bees' },
  { name: 'Health Specialist', level: 'busy_bees' },
  { name: 'Home Helper', level: 'busy_bees' },
  { name: 'Music Maker', level: 'busy_bees' },
  { name: 'Potato', level: 'busy_bees' },
  { name: 'Reading I', level: 'busy_bees' },
  { name: 'Safety Specialist', level: 'busy_bees' },
  { name: 'Sand Art', level: 'busy_bees' },
  { name: 'Spotter', level: 'busy_bees' },
  { name: 'Swimmer I', level: 'busy_bees' },
  { name: 'Acts of Kindness', level: 'sunbeams' },
  { name: 'Baking', level: 'sunbeams' },
  { name: 'Camper', level: 'sunbeams' },
  { name: 'Collector', level: 'sunbeams' },
  { name: 'Cooking Fun', level: 'sunbeams' },
  { name: 'Courtesy', level: 'sunbeams' },
  { name: 'Feathered Friends', level: 'sunbeams' },
  { name: 'Fitness Fun', level: 'sunbeams' },
  { name: 'Friend of Jesus', level: 'sunbeams' },
  { name: 'Friend of Nature', level: 'sunbeams' },
  { name: 'Gardener', level: 'sunbeams' },
  { name: 'Glue Right', level: 'sunbeams' },
  { name: 'Handicraft', level: 'sunbeams' },
  { name: 'Ladybugs', level: 'sunbeams' },
  { name: 'Missionaries', level: 'sunbeams' },
  { name: 'Reading II', level: 'sunbeams' },
  { name: 'Road Safety', level: 'sunbeams' },
  { name: 'Seasons', level: 'sunbeams' },
  { name: 'Seeds', level: 'sunbeams' },
  { name: 'Trees', level: 'sunbeams' },
  { name: 'Whales', level: 'sunbeams' },
  { name: 'Astronomer', level: 'builders' },
  { name: 'Bead Craft', level: 'builders' },
  { name: 'Build & Fly', level: 'builders' },
  { name: 'Building Blocks', level: 'builders' },
  { name: 'Cyclist', level: 'builders' },
  { name: 'Disciples', level: 'builders' },
  { name: 'Early Adventist Pioneer', level: 'builders' },
  { name: 'Family Helper', level: 'builders' },
  { name: 'First Aid Helper', level: 'builders' },
  { name: 'Gymnast', level: 'builders' },
  { name: 'Hand Shadows', level: 'builders' },
  { name: 'Homecraft', level: 'builders' },
  { name: 'Honey', level: 'builders' },
  { name: 'Lizards', level: 'builders' },
  { name: 'Magnet Fun', level: 'builders' },
  { name: 'Magnet Fun II', level: 'builders' },
  { name: 'Media Critic', level: 'builders' },
  { name: 'Olympics', level: 'builders' },
  { name: 'Postcards', level: 'builders' },
  { name: 'Prayer', level: 'builders' },
  { name: 'Reading III', level: 'builders' },
  { name: 'Saving Animals', level: 'builders' },
  { name: 'Sewing Fun', level: 'builders' },
  { name: 'Swimmer II', level: 'builders' },
  { name: 'Temperance', level: 'builders' },
  { name: 'Tin Can Fun', level: 'builders' },
  { name: 'Troubadour', level: 'builders' },
  { name: 'Wise Steward', level: 'builders' },
  { name: 'Basket Maker', level: 'helping_hands' },
  { name: 'Bible II', level: 'helping_hands' },
  { name: 'Bible Royalty', level: 'helping_hands' },
  { name: 'Caring Friend', level: 'helping_hands' },
  { name: 'Carpenter', level: 'helping_hands' },
  { name: 'Technology (formerly Computer Skills)', level: 'helping_hands' },
  { name: 'Country Fun', level: 'helping_hands' },
  { name: 'Environmentalist', level: 'helping_hands' },
  { name: 'Fruits of the Spirit', level: 'helping_hands' },
  { name: 'Geologist', level: 'helping_hands' },
  { name: 'Habitat', level: 'helping_hands' },
  { name: 'Honey Bee', level: 'helping_hands' },
  { name: 'Hygiene', level: 'helping_hands' },
  { name: 'My Church', level: 'helping_hands' },
  { name: 'My Picture Book', level: 'helping_hands' },
  { name: 'Outdoor Explorer', level: 'helping_hands' },
  { name: 'Pearly Gates', level: 'helping_hands' },
  { name: 'Prayer Warrior', level: 'helping_hands' },
  { name: 'Purity', level: 'helping_hands' },
  { name: 'Rainbow Promise', level: 'helping_hands' },
  { name: 'Reading IV', level: 'helping_hands' },
  { name: 'Reporter', level: 'helping_hands' },
  { name: 'Safe Water', level: 'helping_hands' },
  { name: 'Sign Language', level: 'helping_hands' },
  { name: 'Skater', level: 'helping_hands' },
  { name: 'Stamping Fun Art', level: 'helping_hands' },
  { name: 'Steps to Jesus', level: 'helping_hands' },
  { name: 'Tabernacle', level: 'helping_hands' },
  { name: 'Weather (HH)', level: 'helping_hands' },
  { name: 'Bible Storytelling', level: null },
  { name: 'Bread of Life', level: null },
  { name: 'Cooperation', level: null },
  { name: 'Delightful Sabbath', level: null },
  { name: 'Dogs', level: null },
  { name: 'Good Samaritan', level: null },
  { name: 'Listening', level: null },
  { name: 'Parables of Jesus', level: null },
  { name: 'Photo Fun', level: null },
  { name: 'Stay Safe', level: null },
  { name: 'Talent', level: null },
  { name: "Adventurer's Evangelism Patch", level: null },
  { name: "Adventurer's Excellence in Reading Patch", level: null },
]

// ------------------------------------------------------------------
// Normalise a string for fuzzy matching
// ------------------------------------------------------------------
function normalise(str) {
  return str
    .toLowerCase()
    .replace(/['’`]/g, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function toPascalSlug(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '')
}

function toTitleSlug(name) {
  return name
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).replace(/[^a-zA-Z0-9]/g, ''))
    .join('')
}

// ------------------------------------------------------------------
// HTTP helpers
// ------------------------------------------------------------------
async function fetchText(url) {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/124 Safari/537.36',
      },
    })
    if (!res.ok) return null
    return res.text()
  } catch {
    return null
  }
}

async function tryDownload(url, destPath) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } })
    if (!res.ok) return false
    const contentType = res.headers.get('content-type') || ''
    if (!contentType.startsWith('image/')) return false
    const buffer = Buffer.from(await res.arrayBuffer())
    fs.writeFileSync(destPath, buffer)
    return true
  } catch {
    return false
  }
}

// ------------------------------------------------------------------
// Step 1: Crawl adventsource catalog pages -> Map<normalisedName, {name, url}>
// ------------------------------------------------------------------
async function buildAdsCatalog() {
  const catalog = new Map()

  for (const section of CATALOG_SECTIONS) {
    const baseUrl = `${ADS_CATALOG_ROOT}/${section}`
    let page = 1
    while (true) {
      const url = page === 1 ? baseUrl : `${baseUrl}?page=${page}`
      process.stdout.write(`  [crawl] ${section} p${page}...`)
      const html = await fetchText(url)
      if (!html) {
        console.log(' failed')
        break
      }

      // Extract product links from raw HTML: href="/store/adventurer-club/investiture-.../section/slug-ID"
      const re = /href="(\/store\/adventurer-club\/investiture-patches-and-pins\/[^\/]+\/([a-z0-9-]+-\d+))"/g
      let m
      let found = 0
      const seen = new Set()
      while ((m = re.exec(html)) !== null) {
        const relPath = m[1]
        const slugWithId = m[2]
        if (seen.has(slugWithId)) continue
        seen.add(slugWithId)
        // skip bundle/set pages (multi-product sets aren't individual awards)
        if (slugWithId.includes('-set-of-') || slugWithId.includes('-complete-set-')) continue
        // Derive product name: strip trailing -ID, replace hyphens with spaces, title-case
        const nameSlug = slugWithId.replace(/-\d+$/, '')
        const name = nameSlug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
        const fullUrl = `${ADS_BASE}${relPath}`
        const key = normalise(name)
        if (!catalog.has(key)) {
          catalog.set(key, { name, url: fullUrl })
          found++
        }
      }
      console.log(` ${found} new`)

      const hasNext = html.includes(`?page=${page + 1}`) || html.includes(`page=${page + 1}`)
      if (!hasNext || found === 0) break
      page++
    }
  }

  console.log(`\n  Catalog: ${catalog.size} unique products\n`)
  return catalog
}

// ------------------------------------------------------------------
// Step 2: Extract blob image URL from a product page
// ------------------------------------------------------------------
async function getImageFromProductPage(productUrl) {
  const html = await fetchText(productUrl)
  if (!html) return null
  const m = html.match(/https:\/\/adventsource\.blob\.core\.windows\.net\/media\/product-photos\/[^"'\s)]+\.jpg/)
  return m ? m[0] : null
}

// ------------------------------------------------------------------
// Step 3: Match award name to catalog entry
// ------------------------------------------------------------------
function findInCatalog(awardName, catalog) {
  const key = normalise(awardName)
  if (catalog.has(key)) return catalog.get(key)

  const candidates = []
  for (const [catalogKey, entry] of catalog) {
    if (catalogKey.startsWith(key) || key.startsWith(catalogKey)) {
      candidates.push({ entry, diff: Math.abs(catalogKey.length - key.length) })
    }
  }
  if (candidates.length > 0) {
    candidates.sort((a, b) => a.diff - b.diff)
    return candidates[0].entry
  }
  return null
}

// ------------------------------------------------------------------
// Main
// ------------------------------------------------------------------
async function main() {
  fs.mkdirSync(PATCHES_DIR, { recursive: true })

  console.log('=== Phase 1: Building adventsource catalog ===\n')
  const catalog = await buildAdsCatalog()

  console.log('=== Phase 2: Downloading images ===\n')
  const found = []
  const missing = []

  for (const { name, level } of AWARDS) {
    const filename = `${toPascalSlug(name)}.jpg`
    const destPath = path.join(PATCHES_DIR, filename)

    if (fs.existsSync(destPath)) {
      console.log(`  [SKIP]  ${name}`)
      found.push({ name, filename })
      continue
    }

    let downloaded = false
    const triedUrls = []

    // Source 1: adventsource product page
    const entry = findInCatalog(name, catalog)
    if (entry) {
      const imageUrl = await getImageFromProductPage(entry.url)
      if (imageUrl) {
        triedUrls.push(imageUrl)
        if (await tryDownload(imageUrl, destPath)) {
          console.log(`  [OK]    ${name} -> ${filename}  [ads: "${entry.name}"]`)
          found.push({ name, filename })
          downloaded = true
        }
      } else {
        triedUrls.push(`${entry.url} (no image found)`)
      }
    }

    // Source 2: clubministries plain PascalCase
    if (!downloaded) {
      const url = `${CLUBMIN_BASE}/${filename}`
      triedUrls.push(url)
      if (await tryDownload(url, destPath)) {
        console.log(`  [OK]    ${name} -> ${filename}  [clubministries plain]`)
        found.push({ name, filename })
        downloaded = true
      }
    }

    // Source 3: clubministries Awards_ prefix
    if (!downloaded && level && LEVEL_PREFIX[level]) {
      const url = `${CLUBMIN_BASE}/Awards_${LEVEL_PREFIX[level]}-${toTitleSlug(name)}.jpg`
      triedUrls.push(url)
      if (await tryDownload(url, destPath)) {
        console.log(`  [OK]    ${name} -> ${filename}  [clubministries Awards_]`)
        found.push({ name, filename })
        downloaded = true
      }
    }

    if (!downloaded) {
      console.log(`  [MISS]  ${name}`)
      missing.push({ name, triedUrls })
    }
  }

  // Phase 3: migration SQL
  const lines = [
    '-- Migration: populate patch_image_url for awards with downloaded images.',
    '-- Generated by scripts/download-patches.mjs',
    '-- Run: atlas migrate apply',
    '',
  ]
  for (const { name, filename } of found) {
    const safeName = name.replace(/'/g, "''")
    lines.push(`UPDATE adv_db.awards SET patch_image_url = '/img/patches/${filename}' WHERE name = '${safeName}';`)
  }
  fs.writeFileSync(MIGRATION_FILE, lines.join('\n') + '\n')

  console.log('\n' + '='.repeat(60))
  console.log(`Found:   ${found.length}`)
  console.log(`Missing: ${missing.length}`)
  if (missing.length > 0) {
    console.log('\nMissing (manual sourcing needed):')
    for (const { name } of missing) console.log(`  - ${name}`)
  }
  console.log(`\nMigration: ${MIGRATION_FILE}`)
  console.log(`Images:    ${PATCHES_DIR}`)
}

main().catch(console.error)
