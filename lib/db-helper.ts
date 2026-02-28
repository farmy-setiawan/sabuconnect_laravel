import pool from './db'

// Simple query helper
export async function query(sql: string, params?: unknown[]) {
  const [rows] = await pool.query(sql, params)
  return rows
}

// Get single row
export async function queryOne(sql: string, params?: unknown[]) {
  const rows = await query(sql, params)
  return Array.isArray(rows) ? rows[0] : rows
}

// Insert and return last insert id
export async function insert(table: string, data: Record<string, unknown>) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const placeholders = keys.map(() => '?').join(', ')
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`
  const result = await pool.query(sql, values)
  return result
}

// Update
export async function update(table: string, id: string, data: Record<string, unknown>) {
  const keys = Object.keys(data)
  const values = Object.values(data)
  const setClause = keys.map(k => `${k} = ?`).join(', ')
  const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`
  await pool.query(sql, [...values, id])
}

// Delete
export async function remove(table: string, id: string) {
  await pool.query(`DELETE FROM ${table} WHERE id = ?`, [id])
}

export default pool
