import sql from 'src/lib/postgres'

async function list(clubYearLabel = null, search = null) {
  try {
    if (clubYearLabel) {
      const result = search
        ? await sql`
            SELECT DISTINCT a.id, a.name, a.level::text AS level, a.type::text AS type, a.link, a.patch_image_url
            FROM adv_db.awards AS a
            JOIN adv_db.events_awards AS ea ON ea.award_id = a.id
            JOIN adv_db.events AS ev ON ea.event_id = ev.id
            JOIN adv_db.club_years AS cy ON ev.club_year_id = cy.id
            WHERE cy.label = ${clubYearLabel}
              AND a.name ILIKE ${'%' + search + '%'}
            ORDER BY level ASC, a.name ASC
            LIMIT 10`
        : await sql`
            SELECT DISTINCT a.id, a.name, a.level::text AS level, a.type::text AS type, a.link, a.patch_image_url
            FROM adv_db.awards AS a
            JOIN adv_db.events_awards AS ea ON ea.award_id = a.id
            JOIN adv_db.events AS ev ON ea.event_id = ev.id
            JOIN adv_db.club_years AS cy ON ev.club_year_id = cy.id
            WHERE cy.label = ${clubYearLabel}
            ORDER BY level ASC, a.name ASC`
      return result
    }
    const result = search
      ? await sql`
          SELECT id, name, level::text AS level, type::text AS type, link, patch_image_url
          FROM adv_db.awards
          WHERE name ILIKE ${'%' + search + '%'}
          ORDER BY level ASC, name ASC
          LIMIT 10`
      : await sql`
          SELECT id, name, level::text AS level, type::text AS type, link, patch_image_url
          FROM adv_db.awards
          ORDER BY level ASC, name ASC`
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
          a.id, a.name, a.level::text AS level, a.type::text AS type, a.link, a.patch_image_url,
          coalesce(json_agg(DISTINCT jsonb_build_object(
            'id', c.id,
            'firstName', c.first_name,
            'lastName', c.last_name,
            'class', cl.class::text,
            'earnedOn', ac.awarded_on,
            'eventId', COALESCE(ac.event_id, ac.award_ceremony_id)
          )) FILTER (WHERE c.id IS NOT NULL AND cc.child_id IS NOT NULL), '[]'::json) AS children_awarded
        FROM adv_db.awards AS a
        LEFT JOIN adv_db.awards_children AS ac ON ac.award_id = a.id
        LEFT JOIN adv_db.children AS c ON ac.child_id = c.id
        LEFT JOIN adv_db.classes_children AS cc
          ON c.id = cc.child_id
          AND cc.club_year_id = (SELECT id FROM adv_db.club_years WHERE label = ${clubYearLabel})
        LEFT JOIN adv_db.classes AS cl ON cc.class_id = cl.id
        WHERE a.id = ${id}
        GROUP BY a.id`
    } else {
      result = await sql`
        SELECT
          a.id, a.name, a.level::text AS level, a.type::text AS type, a.link, a.patch_image_url,
          coalesce(json_agg(DISTINCT jsonb_build_object(
            'id', c.id,
            'firstName', c.first_name,
            'lastName', c.last_name,
            'earnedOn', ac.awarded_on,
            'eventId', COALESCE(ac.event_id, ac.award_ceremony_id)
          )) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children_awarded
        FROM adv_db.awards AS a
        LEFT JOIN adv_db.awards_children AS ac ON ac.award_id = a.id
        LEFT JOIN adv_db.children AS c ON ac.child_id = c.id
        WHERE a.id = ${id}
        GROUP BY a.id`
    }
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return null
}

const awardsService = { list, getById }
export default awardsService
