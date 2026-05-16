import sql from 'src/lib/postgres'

async function list() {
  try {
    const result = await sql`SELECT * FROM adv_db.staff ORDER BY last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function listByClubYear(clubYearLabel) {
  try {
    const result = await sql`
      SELECT sf.*, cys.staff_role
      FROM adv_db.club_years_staff AS cys
      JOIN adv_db.club_years AS cy ON cys.club_year_id = cy.id
      JOIN adv_db.staff AS sf ON cys.staff_id = sf.id
      WHERE cy.label = ${clubYearLabel}
      ORDER BY sf.last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getById(id) {
  try {
    const result = await sql`SELECT * FROM adv_db.staff WHERE id = ${id}`
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return null
}

const staffService = { list, listByClubYear, getById }
export default staffService
