import sql from 'src/lib/postgres'

async function list(search) {
  try {
    const result = await sql`
        SELECT c.id, c.first_name, c.last_name, 'child' as "type" FROM adv_db.children as c
        ${search ? sql`WHERE c.first_name ILIKE ${'%' + search + '%'} OR c.last_name ILIKE ${'%' + search + '%'}` : sql``}
        UNION
        SELECT p.id, p.first_name, p.last_name, 'parent' as "type" FROM adv_db.parents as p
        ${search ? sql`WHERE p.first_name ILIKE ${'%' + search + '%'} OR p.last_name ILIKE ${'%' + search + '%'}` : sql``}
        ORDER BY last_name ASC, type DESC
        LIMIT 10`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getByMember(id, type) {
  // For parent:
  // 1: Find all children from parents_children table
  // 2: Find all parents from parents_children table for those children (other caregivers)
  // For child:
  // 1: Find all parents from parents_children table
  // 2: Find all children from parents_children table for those parents (sibilings)
  try {
    const result = await sql`
      SELECT * FROM (
      ) AS combined
      WHERE "type" = ${type}
    `
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return { parents: [], children: [] }
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

const familiesService = { list, enroll, getByMember }
export default familiesService
