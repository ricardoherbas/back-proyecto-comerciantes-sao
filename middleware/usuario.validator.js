const pool = require('../config/conexion.js')

// Validar tipos y campos obligatorios
const validateInputUsuario = (req, res, next) => {
  const { nombre, apellido, sexo, email, password } = req.body
  const error = []

  if (!nombre || typeof nombre !== 'string') {
    error.push('El nombre es obligatorio y debe ser texto.')
  }

  if (!apellido || typeof apellido !== 'string') {
    error.push('El apellido es obligatorio y debe ser texto.')
  }

  if (!email || typeof email !== 'string') {
    error.push('El email es obligatorio y debe ser texto.')
  }

  if (!password || typeof password !== 'string') {
    error.push('La contraseña es obligatoria y debe ser texto.')
  }

  if (sexo && typeof sexo !== 'string') {
    error.push('El campo sexo debe ser texto.')
  }

  if (error.length > 0) {
    return res.status(400).json({ error })
  }

  next()
}

// Validar que el email no esté duplicado
const validaEmailUnico = async (req, res, next) => {
  try {
    const { email } = req.body
    const { id } = req.params

    if (!email) return next()

    if (req.method === 'POST') {
      const result = await pool.query('SELECT id FROM usuario WHERE email = $1', [email])
      if (result.rows.length > 0) {
        return res.status(400).json({ error: `El email ${email} ya está registrado` })
      }
    }

    if (req.method === 'PUT') {
      const result = await pool.query('SELECT id FROM usuario WHERE email = $1 AND id <> $2', [email, id])
      if (result.rows.length > 0) {
        return res.status(400).json({ error: `El email ${email} ya está registrado por otro usuario` })
      }
    }

    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error al validar email de usuario' })
  }
}

module.exports = { validateInputUsuario, validaEmailUnico }
