import sql from 'src/lib/postgres'

async function listByClubYear(clubYearLabel) {
  try {
    const result = await sql`SELECT *
                            FROM adv_db.events as ev
                            JOIN adv_db.club_years as cy ON ev.club_year_id = cy.id
                            WHERE cy.label = ${clubYearLabel}
                            ORDER BY ev.event_date DESC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getById(id) {
  try {
    const result = await sql`SELECT * FROM adv_db.events WHERE id = ${id}`
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return null
}

async function getAttendeesByEventId(eventId) {
  try {
    const result = await sql`
      SELECT ch.*
      FROM adv_db.events_children AS ec
      JOIN adv_db.children AS ch ON ec.child_id = ch.id
      WHERE ec.event_id = ${eventId}
      ORDER BY ch.last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function create(event) {
  try {
    const result = await sql`
      INSERT INTO adv_db.events (title, event_date, award_ceremony, club_year_id)
      VALUES (${event.title}, ${event.event_date}, ${event.award_ceremony}, (SELECT id FROM adv_db.club_years WHERE label = ${event.club_year_label}))
      RETURNING *`
    return result
  } catch (err) {
    console.error(err)
  }
}

const eventsService = {
  create,
  listByClubYear,
  getById,
  getAttendeesByEventId,
}

export default eventsService
