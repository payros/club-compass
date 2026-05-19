import sql from 'src/lib/postgres'

async function list() {
  try {
    const result = await sql`SELECT * FROM adv_db.awards ORDER BY level ASC, name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

async function getById(id) {
  try {
    const result = await sql`SELECT * FROM adv_db.awards WHERE id = ${id}`
    return result[0]
  } catch (err) {
    console.error(err)
  }
  return null
}

const awardsService = { list, getById }
export default awardsService
