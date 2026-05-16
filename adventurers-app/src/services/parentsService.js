import sql from 'src/lib/postgres'

async function list() {
  try {
    const result = await sql`SELECT * FROM adv_db.parents ORDER BY last_name ASC`
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

async function getChildrenByParentId(parentId) {
  try {
    const result = await sql`
      SELECT ch.*
      FROM adv_db.parents_children AS pc
      JOIN adv_db.children AS ch ON pc.child_id = ch.id
      WHERE pc.parent_id = ${parentId}
      ORDER BY ch.last_name ASC`
    return result
  } catch (err) {
    console.error(err)
  }
  return []
}

const parentsService = { list, getById, getChildrenByParentId }
export default parentsService
