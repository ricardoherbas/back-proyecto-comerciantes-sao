const pool = require('../config/conexion.js')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const login = async (req, res) => {
  const { email, password } = req.body

  try {
    // Buscar usuario en la base
    const result = await pool.query('SELECT * FROM usuario WHERE email = $1', [email])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'Usuario no encontrado' })
    }

    // Comparar contraseña con bcrypt
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return res.status(401).json({ error: 'Contraseña incorrecta' })
    }

    // Generar token JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '1h' }
    )

    return res.status(200).json({ msg: 'Login exitoso', token })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Error en el login' })
  }
}

module.exports = { login }
