import sql from '@/lib/postgres'

async function listByClubYear(clubYearLabel) {
  try {
    const result = await sql`SELECT cl.*, sf.first_name AS instructor_first_name, sf.last_name AS instructor_last_name
                            FROM adv_db.classes as cl
                            JOIN adv_db.club_years as cy ON cl.club_year_id = cy.id
                            JOIN adv_db.staff as sf ON cl.instructor_id = sf.id
                            WHERE cy.label = ${clubYearLabel}`

    return result
  } catch (err) {
    console.error(err)
  }

  return []
}

async function create(clubYearLabel, classes) {
  const [clubYear] = await sql`SELECT id FROM adv_db.club_years WHERE label = ${clubYearLabel}`
  if (!clubYear) throw new Error(`Club year '${clubYearLabel}' not found`)

  const results = []
  for (const cls of classes) {
    const [record] = await sql`
      INSERT INTO adv_db.classes (class, club_year_id, instructor_id)
      VALUES (${cls.class}, ${clubYear.id}, ${cls.instructor_id})
      ON CONFLICT (class, club_year_id) DO UPDATE SET instructor_id = EXCLUDED.instructor_id
      RETURNING *`
    results.push(record)
  }
  return results
}

const classesService = {
  listByClubYear,
  create,
}

export default classesService
