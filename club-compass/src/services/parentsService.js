import sql from 'src/lib/postgres'

async function list(search) {
  try {
    const result = search
      ? await sql`
          SELECT * FROM adv_db.parents
          WHERE first_name ILIKE ${'%' + search + '%'} OR last_name ILIKE ${'%' + search + '%'}
          ORDER BY last_name ASC
          LIMIT 10`
      : await sql`SELECT * FROM adv_db.parents ORDER BY last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getById(id) {
  try {
    const result = await sql`SELECT * FROM adv_db.parents WHERE id = ${id}`
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return null
}

const parentsService = { list, getById }
export default parentsService
