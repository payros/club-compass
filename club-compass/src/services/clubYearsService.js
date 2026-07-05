import sql from 'src/lib/postgres'

async function list() {
  try {
    const result = await sql`
      SELECT
        cy.*,
        COUNT(DISTINCT cc.child_id)::int AS enrolled_adventurers
      FROM adv_db.club_years cy
      LEFT JOIN adv_db.classes_children cc ON cc.club_year_id = cy.id
      GROUP BY cy.id
      ORDER BY cy.start_date DESC`
    return result
  } catch (err) {
    console.error('[clubYearsService] list() error:', err)
  }

  return []
}

async function getByLabel(label) {
  try {
    const result = await sql`
      SELECT
        cy.*,
        COUNT(DISTINCT cc.child_id)::int AS enrolled_adventurers
      FROM adv_db.club_years cy
      LEFT JOIN adv_db.classes_children cc ON cc.club_year_id = cy.id
      WHERE cy.label = ${label}
      GROUP BY cy.id
      LIMIT 1`
    return result[0] ?? null
  } catch (err) {
    console.error('[clubYearsService] getByLabel() error:', err)
  }
  return null
}

async function create(clubYear) {
  const result = await sql`
    INSERT INTO adv_db.club_years (club_name, church_name, start_date, end_date, label)
    VALUES (${clubYear.clubName}, ${clubYear.churchName || null}, ${clubYear.startDate}, ${clubYear.endDate}, ${clubYear.label})
    RETURNING *`
  return result
}

async function update(currentLabel, data) {
  const result = await sql`
    UPDATE adv_db.club_years
    SET
      club_name   = ${data.clubName ?? null},
      church_name = ${data.churchName ?? null},
      start_date  = ${data.startDate ?? null},
      end_date    = ${data.endDate ?? null},
      label       = ${data.label}
    WHERE label = ${currentLabel}
    RETURNING *`
  return result[0] ?? null
}

const clubYearsService = {
  list,
  getByLabel,
  create,
  update,
}

export default clubYearsService
