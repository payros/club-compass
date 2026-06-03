import sql from 'src/lib/postgres'

async function list() {
  console.error('[clubYearsService] list() called')
  try {
    const result = await sql`SELECT * FROM adv_db.club_years ORDER BY start_date DESC`
    console.error(`[clubYearsService] list() returned ${result.length} record(s)`)
    return result
  } catch (err) {
    console.error('[clubYearsService] list() error:', err)
  }

  return []
}

async function getByLabel(label) {
  console.error(`[clubYearsService] getByLabel() called with label: ${label}`)
  try {
    const result = await sql`
      SELECT * FROM adv_db.club_years WHERE label = ${label} LIMIT 1`
    console.error(`[clubYearsService] getByLabel() result: ${result[0] ? 'found' : 'not found'}`)
    return result[0] ?? null
  } catch (err) {
    console.error('[clubYearsService] getByLabel() error:', err)
  }
  return null
}

async function create(clubYear) {
  console.error(`[clubYearsService] create() called with label: ${clubYear.label}`)
  const result = await sql`
    INSERT INTO adv_db.club_years (club_name, start_date, end_date, label)
    VALUES (${clubYear.clubName}, ${clubYear.startDate}, ${clubYear.endDate}, ${clubYear.label})
    RETURNING *`
  console.error(`[clubYearsService] create() inserted id: ${result[0]?.id}`)
  return result
}

const clubYearsService = {
  list,
  getByLabel,
  create,
}

export default clubYearsService
