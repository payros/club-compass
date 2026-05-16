import sql from 'src/lib/postgres'

async function list() {
  try {
    const result = await sql`SELECT * FROM adv_db.children ORDER BY last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function listByClubYear(clubYearLabel) {
  try {
    const result = await sql`SELECT ch.id, ch.date_of_birth, cy.label, ch.first_name, ch.last_name,cl.class
                            FROM adv_db.classes_children as cc
                            JOIN adv_db.club_years as cy ON cc.club_year_id = cy.id
                            JOIN adv_db.children as ch ON cc.child_id = ch.id
                            JOIN adv_db.classes as cl ON cc.class_id = cl.id
                            WHERE cy.label = ${clubYearLabel}`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getById(id) {
  try {
    const result = await sql`SELECT * FROM adv_db.children WHERE id = ${id}`
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return null
}

async function getParentsByChildId(childId) {
  try {
    const result = await sql`
      SELECT p.*
      FROM adv_db.parents_children AS pc
      JOIN adv_db.parents AS p ON pc.parent_id = p.id
      WHERE pc.child_id = ${childId}`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getAwardsByChildId(childId) {
  try {
    const result = await sql`
      SELECT a.*, ac.awarded_on
      FROM adv_db.awards_children AS ac
      JOIN adv_db.awards AS a ON ac.award_id = a.id
      WHERE ac.child_id = ${childId}
      ORDER BY ac.awarded_on DESC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

const childrenService = {
  list,
  listByClubYear,
  getById,
  getParentsByChildId,
  getAwardsByChildId,
}

export default childrenService
