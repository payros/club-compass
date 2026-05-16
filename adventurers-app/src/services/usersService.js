import sql from 'src/lib/postgres'

async function list() {
  try {
    const result = await sql`SELECT id, email, first_name, last_name, created_at FROM adv_db.users ORDER BY last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

const usersService = { list }
export default usersService
