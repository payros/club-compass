import sql from 'src/lib/postgres'

async function listAwards() {
  try {
    const result = await sql`SELECT * FROM adv_db.awards ORDER BY level`
    return result
  } catch (err) {
    console.error(err)
  }

  return []
}

const awardsService = {
  listAwards,
}  

export default awardsService