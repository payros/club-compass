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

/* This function return an object with all the linked family members for a given member */
async function getByMember(id, type) {
  try {
    const memberId = Number.parseInt(id, 10)
    if (Number.isNaN(memberId)) {
      return { parents: [], children: [] }
    }

    const normalizedType = String(type || '').toLowerCase()

    if (normalizedType === 'parent') {
      const [childrenResult, parentsResult] = await Promise.all([
        sql`
          SELECT ch.id, ch.first_name, ch.last_name, ch.allergies, ch.medical_conditions, ch.sex, ch.date_of_birth
          FROM adv_db.parents_children AS pc
          JOIN adv_db.children AS ch ON ch.id = pc.child_id
          WHERE pc.parent_id = ${memberId}
          ORDER BY ch.last_name ASC, ch.first_name ASC
        `,
        sql`
          SELECT DISTINCT p.id, p.first_name, p.last_name, p.email, p.phone, p.address
          FROM adv_db.parents_children AS pc1
          JOIN adv_db.parents_children AS pc2 ON pc2.child_id = pc1.child_id
          JOIN adv_db.parents AS p ON p.id = pc2.parent_id
          WHERE pc1.parent_id = ${memberId}
          ORDER BY p.last_name ASC, p.first_name ASC
        `,
      ])

      return { parents: parentsResult, children: childrenResult }
    }

    if (normalizedType === 'child') {
      const [parentsResult, childrenResult] = await Promise.all([
        sql`
          SELECT p.id, p.first_name, p.last_name, p.email, p.phone, p.address
          FROM adv_db.parents_children AS pc
          JOIN adv_db.parents AS p ON p.id = pc.parent_id
          WHERE pc.child_id = ${memberId}
          ORDER BY p.last_name ASC, p.first_name ASC
        `,
        sql`
          SELECT DISTINCT ch.id, ch.first_name, ch.last_name, ch.allergies, ch.medical_conditions, ch.sex, ch.date_of_birth
          FROM adv_db.parents_children AS pc
          JOIN adv_db.parents_children AS pc2 ON pc2.parent_id = pc.parent_id
          JOIN adv_db.children AS ch ON ch.id = pc2.child_id
          WHERE pc.child_id = ${memberId}
          ORDER BY ch.last_name ASC, ch.first_name ASC
        `,
      ])

      return { parents: parentsResult, children: childrenResult }
    }
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
      const parentId = parent.id != null && parent.id !== '' ? Number(parent.id) : null
      let parentRecord
      if (parentId) {
        ;[parentRecord] = await sql`
          INSERT INTO adv_db.parents (id, first_name, last_name, email, phone, address)
          OVERRIDING SYSTEM VALUE
          VALUES (
            ${parentId},
            ${parent.firstName},
            ${parent.lastName},
            ${parent.email || null},
            ${parent.phone || null},
            ${parent.address || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            email = EXCLUDED.email,
            phone = EXCLUDED.phone,
            address = EXCLUDED.address
          RETURNING *`
      } else {
        ;[parentRecord] = await sql`
          INSERT INTO adv_db.parents (first_name, last_name, email, phone, address)
          VALUES (
            ${parent.firstName},
            ${parent.lastName},
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
      const childId = child.id != null && child.id !== '' ? Number(child.id) : null
      let childRecord
      if (childId) {
        ;[childRecord] = await sql`
          INSERT INTO adv_db.children (id, first_name, last_name, allergies, medical_conditions, sex, date_of_birth)
          OVERRIDING SYSTEM VALUE
          VALUES (
            ${childId},
            ${child.firstName},
            ${child.lastName},
            ${child.allergies || null},
            ${child.medicalConditions || null},
            ${child.sex || null},
            ${child.dateOfBirth || null}
          )
          ON CONFLICT (id) DO UPDATE SET
            first_name = EXCLUDED.first_name,
            last_name = EXCLUDED.last_name,
            allergies = EXCLUDED.allergies,
            medical_conditions = EXCLUDED.medical_conditions,
            sex = EXCLUDED.sex,
            date_of_birth = EXCLUDED.date_of_birth
          RETURNING *`
      } else {
        ;[childRecord] = await sql`
          INSERT INTO adv_db.children (first_name, last_name, allergies, medical_conditions, sex, date_of_birth)
          VALUES (
            ${child.firstName},
            ${child.lastName},
            ${child.allergies || null},
            ${child.medicalConditions || null},
            ${child.sex || null},
            ${child.dateOfBirth || null}
          )
          RETURNING *`
      }

      await sql`
        INSERT INTO adv_db.classes_children (club_year_id, class_id, child_id)
        VALUES (${clubYear.id}, ${child.classId}, ${childRecord.id})
        ON CONFLICT (club_year_id, child_id) DO UPDATE SET
          class_id = EXCLUDED.class_id`

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
