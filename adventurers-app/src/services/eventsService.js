import sql from 'src/lib/postgres'

async function list(search = null) {
  try {
    const result = search
      ? await sql`
          SELECT ev.*, cy.label AS club_year_label
          FROM adv_db.events AS ev
          JOIN adv_db.club_years AS cy ON ev.club_year_id = cy.id
          WHERE ev.title ILIKE ${'%' + search + '%'}
          ORDER BY ev.event_date DESC
          LIMIT 10`
      : await sql`
          SELECT ev.*, cy.label AS club_year_label
          FROM adv_db.events AS ev
          JOIN adv_db.club_years AS cy ON ev.club_year_id = cy.id
          ORDER BY ev.event_date DESC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function listByClubYear(clubYearLabel, search = null) {
  try {
    const result = search
      ? await sql`
          SELECT ev.*, cy.label as club_year_label
          FROM adv_db.events as ev
          JOIN adv_db.club_years as cy ON ev.club_year_id = cy.id
          WHERE cy.label = ${clubYearLabel}
            AND ev.title ILIKE ${'%' + search + '%'}
          ORDER BY ev.event_date DESC
          LIMIT 10`
      : await sql`
          SELECT ev.*, cy.label as club_year_label
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
    const [resultEvent] = await sql`
      INSERT INTO adv_db.events (title, event_date, award_ceremony, club_year_id)
      VALUES (${event.title}, ${event.event_date}, ${event.award_ceremony}, (SELECT id FROM adv_db.club_years WHERE label = ${event.club_year_label}))
      RETURNING *`

    if (event.awards && event.awards.length > 0) {
      const values = event.awards.map((award) => [resultEvent.id, award.award_id, award.class_id])
      const resultAwards = await sql`
        INSERT INTO adv_db.events_awards (event_id, award_id, class_id)
        VALUES ${sql(values)}
        RETURNING *`

      resultEvent.awards = resultAwards
    } else {
      resultEvent.awards = []
    }

    return resultEvent
  } catch (err) {
    console.error(err)
    throw err
  }
}

async function getById(eventId) {
  try {
    const result = await sql`SELECT ev.id, ev.title, ev.event_date, ev.award_ceremony,
                coalesce(json_agg(DISTINCT jsonb_build_object('id', c.id, 'firstName', c.first_name, 'lastName', c.last_name, 'class', cl.class)) FILTER (WHERE c.id IS NOT NULL), '[]'::json) AS children,
                coalesce(json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name, 'class', cl2.class, 'type', a.type)) FILTER (WHERE a.id IS NOT NULL), '[]'::json) AS awards
                FROM adv_db.events as ev
                JOIN adv_db.club_years as cy ON ev.club_year_id = cy.id
                LEFT JOIN adv_db.events_children as ec ON ev.id = ec.event_id
                LEFT JOIN adv_db.children as c ON ec.child_id = c.id
                LEFT JOIN adv_db.classes_children as cc ON c.id = cc.child_id
                LEFT JOIN adv_db.classes as cl ON cc.class_id = cl.id
                LEFT JOIN adv_db.events_awards as ea ON ev.id = ea.event_id
                LEFT JOIN adv_db.awards as a ON ea.award_id = a.id
                LEFT JOIN adv_db.classes as cl2 ON ea.class_id = cl2.id
                WHERE ev.id = ${eventId}
                GROUP BY ev.id`
    console.log('Event details:', result)
    return result[0]
  } catch (err) {
    console.error(err)
  }

  return null
}

async function update(clubYearLabel, eventId, updatedEventData) {
  try {
    const result = await sql.begin(async (sql) => {
      // Convert eventId to integer
      const eventIdInt = parseInt(eventId, 10)

      // Extract children array if present
      const { children, ...eventData } = updatedEventData

      // Build update query dynamically based on provided fields
      const updateFields = []
      const updateValues = []
      let paramIndex = 1

      Object.entries(eventData)
        // Exclude award_ceremony since updating it will make award linking/unlinking more complex.
        .filter(([key, value]) => key !== 'award_ceremony')
        .forEach(([key, value]) => {
          updateFields.push(`${key} = $${paramIndex++}`)
          updateValues.push(value)
        })

      // Update event if there are fields to update
      let updatedEvent = null
      if (updateFields.length > 0) {
        const updateQuery = `UPDATE adv_db.events SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`
        updateValues.push(eventIdInt)
        const eventResult = await sql.unsafe(updateQuery, updateValues)
        updatedEvent = eventResult[0]
      } else {
        // If no fields to update, fetch the current event
        const eventResult = await sql`SELECT * FROM adv_db.events WHERE id = ${eventIdInt}`
        updatedEvent = eventResult[0]
      }

      // Handle children linking if provided
      if (children) {
        // Type check children field
        if (!Array.isArray(children)) {
          throw new Error('Children field must be an array of child IDs')
        }

        // Convert children IDs to integers
        const childrenIds = children.map((id) => parseInt(id, 10))

        // Fetch currently linked children
        const currentChildren = await sql`
          SELECT child_id FROM adv_db.events_children WHERE event_id = ${eventIdInt}`

        const currentChildIds = currentChildren.map((row) => row.childId)

        // Find children to delete (in current but not in new)
        const childrenToDelete = currentChildIds.filter((id) => !childrenIds.includes(id))
        // Find children to insert (in new but not in current)
        const childrenToInsert = childrenIds.filter((id) => !currentChildIds.includes(id))

        // Delete children that are no longer in the list
        if (childrenToDelete.length > 0) {
          await sql`
            DELETE FROM adv_db.events_children
            WHERE event_id = ${eventIdInt} AND child_id = ANY(${sql.array(childrenToDelete)}::integer[])`

          // Handle award side effects for removed children
          if (updatedEvent.awardCeremony) {
            // Award ceremony: clear awarded_on and award_ceremony_id for any grants made via this ceremony
            await sql`
              UPDATE adv_db.awards_children
              SET awarded_on = NULL, award_ceremony_id = NULL
              WHERE award_ceremony_id = ${eventIdInt} AND child_id = ANY(${sql.array(childrenToDelete)}::integer[])`
          } else {
            // Regular event: delete the award links entirely
            await sql`
              DELETE FROM adv_db.awards_children
              WHERE event_id = ${eventIdInt} AND child_id = ANY(${sql.array(childrenToDelete)}::integer[])`
          }
        }

        // Insert new children links
        if (childrenToInsert.length > 0) {
          const childrenValues = childrenToInsert.map((childId) => [eventIdInt, childId])
          await sql`
            INSERT INTO adv_db.events_children (event_id, child_id)
            VALUES ${sql(childrenValues)}`

          // Get all awards for this event
          const eventAwards = await sql`
            SELECT DISTINCT ea.award_id, ea.class_id FROM adv_db.events_awards ea
            WHERE ea.event_id = ${eventIdInt}`

          // Get all classes for the newly inserted children in a single query
          const childrenToInsertWithClasses = await sql`
            SELECT c.*, cc.class_id 
            FROM adv_db.children c
            JOIN adv_db.classes_children cc ON c.id = cc.child_id
            JOIN adv_db.club_years cy ON cc.club_year_id = cy.id
            WHERE c.id = ANY(${sql.array(childrenToInsert)}::integer[]) AND cy.label = ${clubYearLabel}`

          // Collect all awards to insert or update
          const awardsToLink = []
          console.log('Children to insert with classes:', childrenToInsertWithClasses)
          // For each newly added child, link to relevant awards
          for (const { id: childId, classId } of childrenToInsertWithClasses) {
            // Filter awards by child's class
            const awardsByChildClass = eventAwards.filter((award) => award.classId === classId)
            console.log(`Awards for child ${childId} with class ${classId}:`, awardsByChildClass)
            awardsByChildClass.forEach((award) => {
              if (childId && award.awardId) {
                awardsToLink.push([childId, award.awardId, eventIdInt])
              }
            })
          }
          console.log('Awards to link for newly added children:', awardsToLink)
          // Handle inserts or updates based on award_ceremony flag
          if (awardsToLink.length > 0) {
            if (updatedEvent.awardCeremony) {
              const awardUpdateFields = []
              const awardUpdateValues = []
              let paramIndex = 1

              awardsToLink.forEach(([childId, awardId]) => {
                awardUpdateFields.push(`(child_id = $${paramIndex++} AND award_id = $${paramIndex++})`)
                awardUpdateValues.push(childId, awardId)
              })

              const updateQuery = `UPDATE adv_db.awards_children
                SET awarded_on = '${new Date(updatedEvent.eventDate).toISOString()}', award_ceremony_id = ${eventIdInt}
                WHERE (${awardUpdateFields.join(' OR ')}) AND awarded_on IS NULL`
              console.log('Award update query:', updateQuery)
              await sql.unsafe(updateQuery, awardUpdateValues)
            } else {
              // Only insert new awards for newly added children
              if (awardsToLink.length > 0) {
                await sql`
                  INSERT INTO adv_db.awards_children (child_id, award_id, event_id)
                  VALUES ${sql(awardsToLink)}`
              }
            }
          }
        }
      }

      return updatedEvent
    })

    return result
  } catch (err) {
    console.error(err)
    throw err
  }
}

const eventsService = {
  list,
  create,
  listByClubYear,
  getById,
  update,
  getAttendeesByEventId,
}

export default eventsService
