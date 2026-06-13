import sql from '@/lib/postgres'

async function listByClubYear(clubYearLabel) {
  try {
    const result = await sql`
      SELECT cl.*,
             sf.first_name AS instructor_first_name,
             sf.last_name AS instructor_last_name,
             COUNT(DISTINCT cc.child_id) AS enrolled_count,
             COUNT(DISTINCT ea.award_id) AS awards_count
      FROM adv_db.classes AS cl
      JOIN adv_db.club_years AS cy ON cl.club_year_id = cy.id
      JOIN adv_db.staff AS sf ON cl.instructor_id = sf.id
      LEFT JOIN adv_db.classes_children AS cc ON cc.class_id = cl.id AND cc.club_year_id = cy.id
      LEFT JOIN adv_db.events_awards AS ea ON ea.class_id = cl.id
      LEFT JOIN adv_db.events AS e ON ea.event_id = e.id AND e.club_year_id = cy.id
      WHERE cy.label = ${clubYearLabel}
      GROUP BY cl.id, sf.first_name, sf.last_name`

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

async function getByName(clubYearLabel, className) {
  try {
    const [cls] = await sql`
      SELECT cl.*, sf.first_name AS instructor_first_name, sf.last_name AS instructor_last_name
      FROM adv_db.classes AS cl
      JOIN adv_db.club_years AS cy ON cl.club_year_id = cy.id
      JOIN adv_db.staff AS sf ON cl.instructor_id = sf.id
      WHERE cy.label = ${clubYearLabel}
        AND cl.class = ${className}::adv_db.adventurer_class`

    if (!cls) return null

    const children = await sql`
      SELECT ch.*
      FROM adv_db.children AS ch
      JOIN adv_db.classes_children AS cc ON cc.child_id = ch.id
      JOIN adv_db.club_years AS cy ON cc.club_year_id = cy.id
      WHERE cc.class_id = ${cls.id}
        AND cy.label = ${clubYearLabel}
      ORDER BY ch.last_name, ch.first_name`

    const awards = await sql`
      SELECT DISTINCT a.*
      FROM adv_db.awards AS a
      JOIN adv_db.events_awards AS ea ON ea.award_id = a.id
      JOIN adv_db.events AS e ON ea.event_id = e.id
      JOIN adv_db.club_years AS cy ON e.club_year_id = cy.id
      WHERE cy.label = ${clubYearLabel}
        AND ea.class_id = ${cls.id}
      ORDER BY a.name`

    const events = await sql`
      SELECT DISTINCT e.id, e.title AS name, e.event_date
      FROM adv_db.events AS e
      JOIN adv_db.events_awards AS ea ON ea.event_id = e.id
      JOIN adv_db.club_years AS cy ON e.club_year_id = cy.id
      WHERE cy.label = ${clubYearLabel}
        AND ea.class_id = ${cls.id}
      ORDER BY e.event_date`

    return { ...cls, children, awards, events }
  } catch (err) {
    console.error(err)
  }

  return null
}

const classesService = {
  listByClubYear,
  getByName,
  create,
}

export default classesService
