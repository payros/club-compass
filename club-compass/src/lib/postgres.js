import postgres from 'postgres'

const globalForPostgres = globalThis

if (!globalForPostgres.sql) {
  globalForPostgres.sql = postgres(process.env.DATABASE_URL, {
    // Transform the column names only from camel case
    transform: postgres.camel,
    ssl: true || process.env.NODE_ENV === 'production',
    max: 10,
  })
  console.log('Postgres connected to ' + process.env.DATABASE_URL)
}

const sql = globalForPostgres.sql
export default sql
