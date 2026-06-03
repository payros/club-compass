import sql from 'src/lib/postgres'

async function list(search) {
  try {
    const result = search
      ? await sql`
          SELECT * FROM adv_db.children
          WHERE first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'}
          ORDER BY last_name ASC
          LIMIT 10`
      : await sql`SELECT * FROM adv_db.children ORDER BY last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function listByClubYear(clubYearLabel, search) {
  try {
    const result = search
      ? await sql`
          SELECT
            ch.id, ch.date_of_birth, cy.label, ch.first_name, ch.last_name, cl.class,
            ch.sex, ch.allergies, ch.medical_conditions,
            (
              SELECT string_agg(CONCAT(p.first_name, ' ', p.last_name), ', ')
              FROM adv_db.parents_children AS pc
              JOIN adv_db.parents AS p ON pc.parent_id = p.id
              WHERE pc.child_id = ch.id
            ) AS parents,
            (
              SELECT CASE
                WHEN COUNT(e.id) = 0 THEN NULL
                ELSE ROUND(COUNT(ec.event_id) * 100.0 / COUNT(e.id))
              END
              FROM adv_db.events AS e
              LEFT JOIN adv_db.events_children AS ec ON ec.event_id = e.id AND ec.child_id = ch.id
              WHERE e.club_year_id = cy.id
            ) AS attendance,
            (
              SELECT COUNT(ac.id)
              FROM adv_db.awards_children AS ac
              LEFT JOIN adv_db.events AS e ON ac.event_id = e.id
              LEFT JOIN adv_db.events AS cer ON ac.award_ceremony_id = cer.id
              WHERE ac.child_id = ch.id AND (e.club_year_id = cy.id OR cer.club_year_id = cy.id)
            ) AS awards_earned
          FROM adv_db.classes_children as cc
          JOIN adv_db.club_years as cy ON cc.club_year_id = cy.id
          JOIN adv_db.children as ch ON cc.child_id = ch.id
          JOIN adv_db.classes as cl ON cc.class_id = cl.id
          WHERE cy.label = ${clubYearLabel}
            AND (ch.first_name ILIKE ${'%' + search + '%'} OR ch.last_name ILIKE ${'%' + search + '%'})
          LIMIT 10`
      : await sql`
          SELECT
            ch.id, ch.date_of_birth, cy.label, ch.first_name, ch.last_name, cl.class,
            ch.sex, ch.allergies, ch.medical_conditions,
            (
              SELECT string_agg(CONCAT(p.first_name, ' ', p.last_name), ', ')
              FROM adv_db.parents_children AS pc
              JOIN adv_db.parents AS p ON pc.parent_id = p.id
              WHERE pc.child_id = ch.id
            ) AS parents,
            (
              SELECT CASE
                WHEN COUNT(e.id) = 0 THEN NULL
                ELSE ROUND(COUNT(ec.event_id) * 100.0 / COUNT(e.id))
              END
              FROM adv_db.events AS e
              LEFT JOIN adv_db.events_children AS ec ON ec.event_id = e.id AND ec.child_id = ch.id
              WHERE e.club_year_id = cy.id
            ) AS attendance,
            (
              SELECT COUNT(ac.id)
              FROM adv_db.awards_children AS ac
              LEFT JOIN adv_db.events AS e ON ac.event_id = e.id
              LEFT JOIN adv_db.events AS cer ON ac.award_ceremony_id = cer.id
              WHERE ac.child_id = ch.id AND (e.club_year_id = cy.id OR cer.club_year_id = cy.id)
            ) AS awards_earned
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

async function getById(id, clubYearLabel = null) {
  try {
    let result
    if (clubYearLabel) {
      result = await sql`
        SELECT
          ch.*,
          coalesce(json_agg(DISTINCT jsonb_build_object(
            'id', p.id,
            'firstName', p.first_name,
            'lastName', p.last_name,
            'phone', p.phone,
            'email', p.email
          )) FILTER (WHERE p.id IS NOT NULL), '[]'::json) AS parents,
          coalesce(json_agg(DISTINCT jsonb_build_object(
            'id', a.id,
            'name', a.name,
            'type', a.type::text,
            'level', a.level::text,
            'awardedOn', ac.awarded_on,
            'eventId', ac.event_id,
            'awardCeremonyId', ac.award_ceremony_id,
            'event', CASE WHEN e.id IS NOT NULL THEN jsonb_build_object('id', e.id, 'title', e.title, 'eventDate', e.event_date, 'awardCeremony', e.award_ceremony) END,
            'awardCeremony', CASE WHEN cer.id IS NOT NULL THEN jsonb_build_object('id', cer.id, 'title', cer.title, 'eventDate', cer.event_date, 'awardCeremony', cer.award_ceremony) END
          )) FILTER (WHERE a.id IS NOT NULL AND (e.club_year_id = cy.id OR cer.club_year_id = cy.id)), '[]'::json) AS awards,
          (SELECT jsonb_build_object('id', cl2.id, 'class', cl2.class::text)
           FROM adv_db.classes_children AS cc2
           JOIN adv_db.classes AS cl2 ON cc2.class_id = cl2.id
           WHERE cc2.child_id = ch.id AND cc2.club_year_id = cy.id
           LIMIT 1) AS class
        FROM adv_db.children AS ch
        JOIN adv_db.club_years AS cy ON cy.label = ${clubYearLabel}
        LEFT JOIN adv_db.parents_children AS pc ON pc.child_id = ch.id
        LEFT JOIN adv_db.parents AS p ON pc.parent_id = p.id
        LEFT JOIN adv_db.awards_children AS ac ON ac.child_id = ch.id
        LEFT JOIN adv_db.awards AS a ON ac.award_id = a.id
        LEFT JOIN adv_db.events AS e ON ac.event_id = e.id
        LEFT JOIN adv_db.events AS cer ON ac.award_ceremony_id = cer.id
        WHERE ch.id = ${id}
        GROUP BY ch.id, cy.id`
    } else {
      result = await sql`
        SELECT
          ch.*,
          coalesce(json_agg(DISTINCT jsonb_build_object(
            'id', p.id,
            'firstName', p.first_name,
            'lastName', p.last_name,
            'phone', p.phone,
            'email', p.email
          )) FILTER (WHERE p.id IS NOT NULL), '[]'::json) AS parents,
          coalesce(json_agg(DISTINCT jsonb_build_object(
            'id', a.id,
            'name', a.name,
            'type', a.type::text,
            'level', a.level::text,
            'awardedOn', ac.awarded_on,
            'eventId', ac.event_id,
            'awardCeremonyId', ac.award_ceremony_id,
            'event', CASE WHEN e.id IS NOT NULL THEN jsonb_build_object('id', e.id, 'title', e.title, 'eventDate', e.event_date, 'awardCeremony', e.award_ceremony) END,
            'awardCeremony', CASE WHEN cer.id IS NOT NULL THEN jsonb_build_object('id', cer.id, 'title', cer.title, 'eventDate', cer.event_date, 'awardCeremony', cer.award_ceremony) END
          )) FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS awards
        FROM adv_db.children AS ch
        LEFT JOIN adv_db.parents_children AS pc ON pc.child_id = ch.id
        LEFT JOIN adv_db.parents AS p ON pc.parent_id = p.id
        LEFT JOIN adv_db.awards_children AS ac ON ac.child_id = ch.id
        LEFT JOIN adv_db.awards AS a ON ac.award_id = a.id
        LEFT JOIN adv_db.events AS e ON ac.event_id = e.id
        LEFT JOIN adv_db.events AS cer ON ac.award_ceremony_id = cer.id
        WHERE ch.id = ${id}
        GROUP BY ch.id`
    }
    return result[0] ?? null
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
      SELECT
        a.id AS award_id,
        a.name AS award_name,
        ac.awarded_on,
        ac.event_id,
        e.title AS event_title,
        ac.award_ceremony_id,
        cer.title AS award_ceremony_title,
        cer.event_date AS award_ceremony_date
      FROM adv_db.awards_children AS ac
      JOIN adv_db.awards AS a ON ac.award_id = a.id
      LEFT JOIN adv_db.events AS e ON ac.event_id = e.id
      LEFT JOIN adv_db.events AS cer ON ac.award_ceremony_id = cer.id
      WHERE ac.child_id = ${childId}
      ORDER BY ac.created_at DESC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function update(childId, updatedData) {
  try {
    const result = await sql.begin(async (sql) => {
      const childIdInt = parseInt(childId, 10)
      const { awards, ...childData } = updatedData

      const fieldMap = {
        firstName: 'first_name',
        lastName: 'last_name',
        dateOfBirth: 'date_of_birth',
        allergies: 'allergies',
        medicalConditions: 'medical_conditions',
        sex: 'sex',
      }

      const updateFields = []
      const updateValues = []
      let paramIndex = 1

      Object.entries(childData).forEach(([key, value]) => {
        const dbKey = fieldMap[key] ?? key
        updateFields.push(`${dbKey} = $${paramIndex++}`)
        updateValues.push(value)
      })

      let updatedChild = null
      if (updateFields.length > 0) {
        const updateQuery = `UPDATE adv_db.children SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
        updateValues.push(childIdInt)
        const childResult = await sql.unsafe(updateQuery, updateValues)
        updatedChild = childResult[0]
      } else {
        const childResult = await sql`SELECT * FROM adv_db.children WHERE id = ${childIdInt}`
        updatedChild = childResult[0]
      }

      if (awards !== undefined) {
        if (!Array.isArray(awards)) {
          throw new Error('awards must be an array')
        }

        await sql`DELETE FROM adv_db.awards_children WHERE child_id = ${childIdInt}`

        if (awards.length > 0) {
          const values = awards.map((a) => [
            childIdInt,
            parseInt(a.awardId, 10),
            a.eventId ? parseInt(a.eventId, 10) : null,
            a.awardCeremonyId ? parseInt(a.awardCeremonyId, 10) : null,
            a.awardedOn || null,
          ])
          await sql`
            INSERT INTO adv_db.awards_children (child_id, award_id, event_id, award_ceremony_id, awarded_on)
            VALUES ${sql(values)}`
        }
      }

      return updatedChild
    })

    return result
  } catch (err) {
    console.error(err)
    throw err
  }
}

const childrenService = {
  list,
  listByClubYear,
  getById,
  getParentsByChildId,
  getAwardsByChildId,
  update,
}

export default childrenService
