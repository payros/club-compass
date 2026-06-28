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

async function getByIdForClubYear(id, clubYearLabel) {
  try {
    const [result] = await sql`
      SELECT sf.*, cys.staff_role, cl.class AS instructor_class
      FROM adv_db.staff sf
      JOIN adv_db.club_years_staff cys ON cys.staff_id = sf.id
      JOIN adv_db.club_years cy ON cys.club_year_id = cy.id
      LEFT JOIN adv_db.classes cl ON cl.instructor_id = sf.id AND cl.club_year_id = cy.id
      WHERE cy.label = ${clubYearLabel} AND sf.id = ${id}`
    return result ?? null
  } catch (err) {
    console.error(err)
  }
  return null
}

async function enroll(clubYearLabel, staffMembers) {
  const results = await sql.begin(async (sql) => {
    const [clubYear] = await sql`
      SELECT id FROM adv_db.club_years WHERE label = ${clubYearLabel}`

    if (!clubYear) throw new Error(`Club year '${clubYearLabel}' not found`)

    const created = []
    for (const member of staffMembers) {
      let staffRecord
      if (member.id) {
        ;[staffRecord] = await sql`
          UPDATE adv_db.staff
          SET first_name = ${member.first_name},
              last_name  = ${member.last_name},
              email      = ${member.email || null},
              phone      = ${member.phone || null},
              background_check_expiration = ${member.background_check_expiration || null}
          WHERE id = ${member.id}
          RETURNING *`
      } else {
        ;[staffRecord] = await sql`
          INSERT INTO adv_db.staff (first_name, last_name, email, phone, background_check_expiration)
          VALUES (
            ${member.first_name},
            ${member.last_name},
            ${member.email || null},
            ${member.phone || null},
            ${member.background_check_expiration || null}
          )
          RETURNING *`
      }

      await sql`
        INSERT INTO adv_db.club_years_staff (club_year_id, staff_id, staff_role)
        VALUES (${clubYear.id}, ${staffRecord.id}, ${member.staff_role || null})
        ON CONFLICT (club_year_id, staff_id) DO UPDATE
          SET staff_role = EXCLUDED.staff_role`

      created.push(staffRecord)
    }
    return created
  })
  return results
}

const staffService = { list, listByClubYear, getById, getByIdForClubYear, enroll }
export default staffService
