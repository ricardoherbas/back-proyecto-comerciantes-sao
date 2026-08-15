const pool = require('../config/conexion.js')

// Validar campos obligatorios
const validateInputCategoria = (req, res, next) => {
  const { nombre, descripcion } = req.body
  const error = []

  if (!nombre || typeof nombre !== 'string') {
    error.push('El nombre de la categoría es obligatorio y debe ser texto.')
  }

  if (descripcion && typeof descripcion !== 'string') {
    error.push('La descripción debe ser texto.')
  }

  if (error.length > 0) {
    return res.status(400).json({ error })
  }

  next()
}

// Validar que el nombre de la categoría no esté duplicado
const validaNombreUnico = async (req, res, next) => {
  try {
    const { nombre } = req.body
    const { id } = req.params

    if (!nombre) return next()

    if (req.method === 'POST') {
      const result = await pool.query('SELECT id FROM categoria WHERE nombre = $1', [nombre])
      if (result.rows.length > 0) {
        return res.status(400).json({ error: `La categoría ${nombre} ya existe` })
      }
    }

    if (req.method === 'PUT') {
      const result = await pool.query('SELECT id FROM categoria WHERE nombre = $1 AND id <> $2', [nombre, id])
      if (result.rows.length > 0) {
        return res.status(400).json({ error: `La categoría ${nombre} ya está registrada por otra entrada` })
      }
    }

    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al validar nombre de categoría' })
  }
}

module.exports = { validateInputCategoria, validaNombreUnico }
