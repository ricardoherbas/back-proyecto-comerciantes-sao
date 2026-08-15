const pool = require('../config/conexion.js')
const bcrypt = require('bcrypt')

// Obtener todos los usuarios
const getUsuarioAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM usuario')
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudieron obtener los usuarios' })
  }
}

// Obtener usuario por ID
const getUsuarioById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM usuario WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No existe el usuario con id ${id}` })
    }
    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `No se pudo obtener el usuario con id ${id}` })
  }
}

// Crear nuevo usuario con bcrypt
const postNewUsuario = async (req, res) => {
  console.log("Body recibido:", req.body)
  const { nombre, apellido, sexo, email, password } = req.body
  try {
    // Generar hash seguro de la contraseña
    const salt = await bcrypt.genSalt(10)
    const password_hash = await bcrypt.hash(password, salt)

    const result = await pool.query(
      'INSERT INTO usuario (nombre, apellido, sexo, email, password_hash) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [nombre, apellido, sexo, email, password_hash]
    )

    return res.status(201).json({
      msg: 'Usuario creado correctamente',
      usuario: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudo crear el usuario' })
  }
}

// Modificar usuario por ID (sin tocar contraseña)
const putUsuarioById = async (req, res) => {
  const { id } = req.params
  const { nombre, apellido, sexo, email } = req.body
  try {
    const result = await pool.query(
      'UPDATE usuario SET nombre = $1, apellido = $2, sexo = $3, email = $4 WHERE id = $5 RETURNING *',
      [nombre, apellido, sexo, email, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No se encontró el usuario con id ${id}` })
    }
    return res.status(200).json({
      msg: 'Usuario modificado correctamente',
      usuario: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `No se pudo modificar el usuario con id ${id}` })
  }
}

// Eliminar usuario por ID
const deleteUsuarioById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM usuario WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No se encontró el usuario con id ${id}` })
    }
    return res.status(200).json({
      msg: 'Usuario eliminado correctamente',
      usuario: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudo eliminar el usuario' })
  }
}

module.exports = {
  getUsuarioAll,
  getUsuarioById,
  postNewUsuario,
  putUsuarioById,
  deleteUsuarioById
}
