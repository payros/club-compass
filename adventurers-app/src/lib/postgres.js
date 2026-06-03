import postgres from 'postgres'

const sql = postgres(process.env.DATABASE_URL, {
  // Transform the column names only from camel case
  transform: postgres.camel,
  ssl: process.env.NODE_ENV === 'production',
})
console.log('Postgres connected to ' + process.env.DATABASE_URL)
export default sql
