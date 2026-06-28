import sql from 'src/lib/postgres'

async function list(search, clubYearLabel) {
  try {
    if (clubYearLabel) {
      const result = await sql`
          SELECT sf.*, cys.staff_role
          FROM adv_db.staff sf
          JOIN adv_db.club_years_staff cys ON cys.staff_id = sf.id
          JOIN adv_db.club_years cy ON cys.club_year_id = cy.id
          WHERE cy.label = ${clubYearLabel}
          ${search ? sql`AND (sf.first_name ILIKE ${'%' + search + '%'} OR sf.last_name ILIKE ${'%' + search + '%'})` : sql``}
          ORDER BY sf.last_name ASC
          ${search ? sql`LIMIT 10` : sql``}`
      return result
    }
    const result = await sql`
        SELECT sf.*,
          (SELECT cys.staff_role
           FROM adv_db.club_years_staff cys
           WHERE cys.staff_id = sf.id
           ORDER BY cys.id DESC LIMIT 1) AS last_role
        FROM adv_db.staff sf
        ${search ? sql`WHERE sf.first_name ILIKE ${'%' + search + '%'} OR sf.last_name ILIKE ${'%' + search + '%'}` : sql``}
        ORDER BY sf.last_name ASC
        ${search ? sql`LIMIT 10` : sql``}`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function enroll(clubYearLabel, familyMembers) {
  const results = await sql.begin(async (sql) => {
    const [clubYear] = await sql`
      SELECT id FROM adv_db.club_years WHERE label = ${clubYearLabel}`

    if (!clubYear) throw new Error(`Club year '${clubYearLabel}' not found`)

    const createdParents = []
    for (const parent of familyMembers.parents) {
      let parentRecord
      if (parent.id) {
        ;[parentRecord] = await sql`
          UPDATE adv_db.parents
          SET first_name = ${parent.first_name},
              last_name  = ${parent.last_name},
              email      = ${parent.email || null},
              phone      = ${parent.phone || null},
              address    = ${parent.address || null}
          WHERE id = ${parent.id}
          RETURNING *`
      } else {
        ;[parentRecord] = await sql`
          INSERT INTO adv_db.parents (first_name, last_name, email, phone, address)
          VALUES (
            ${parent.first_name},
            ${parent.last_name},
            ${parent.email || null},
            ${parent.phone || null},
            ${parent.address || null}
          )
          RETURNING *`
      }

      createdParents.push(parentRecord)
    }

    const createdChildren = []
    for (const child of familyMembers.children) {
      let childRecord
      if (child.id) {
        ;[childRecord] = await sql`
          UPDATE adv_db.children
          SET first_name = ${child.first_name},
              last_name  = ${child.last_name},
              allergies      = ${child.allergies || null}
              medical_conditions      = ${child.medical_conditions || null}
              sex      = ${child.sex || null}
              date_of_birth      = ${child.date_of_birth || null}
          WHERE id = ${child.id}
          RETURNING *`
      } else {
        ;[childRecord] = await sql`
          INSERT INTO adv_db.children (first_name, last_name, allergies, medical_conditions, sex, date_of_birth)
          VALUES (
            ${child.first_name},
            ${child.last_name},
            ${child.allergies || null},
            ${child.medical_conditions || null},
            ${child.sex || null},
            ${child.date_of_birth || null}
          )
          RETURNING *`
      }

      await sql`
        INSERT INTO adv_db.classes_children (club_year_id, class_id, child_id)
        VALUES (${clubYear.id}, ${child.class_id}, ${childRecord.id})
        ON CONFLICT (club_year_id, child_id) DO NOTHING`

      createdChildren.push(childRecord)
    }

    // Insert parent-child relationships for all combinations in a single query
    const parentChildValues = []
    for (const parent of createdParents) {
      for (const child of createdChildren) {
        parentChildValues.push([parent.id, child.id])
      }
    }

    if (parentChildValues.length > 0) {
      await sql`
        INSERT INTO adv_db.parents_children (parent_id, child_id)
        VALUES ${sql(parentChildValues)}
        ON CONFLICT DO NOTHING`
    }

    return {
      parents: createdParents,
      children: createdChildren,
    }
  })
  return results
}

const staffService = { list, enroll }
export default staffService
