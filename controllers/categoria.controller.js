const pool = require('../config/conexion.js')

// Obtener todas las categorías
const getCategoriaAll = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM categoria')
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudieron obtener las categorías' })
  }
}

// Obtener categoría por ID
const getCategoriaById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('SELECT * FROM categoria WHERE id = $1', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No existe la categoría con id ${id}` })
    }
    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `No se pudo obtener la categoría con id ${id}` })
  }
}

// Crear nueva categoría
const postNewCategoria = async (req, res) => {
  const { nombre, descripcion } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO categoria (nombre, descripcion) VALUES ($1, $2) RETURNING *',
      [nombre, descripcion]
    )
    return res.status(201).json({
      msg: 'Categoría creada correctamente',
      categoria: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudo crear la categoría' })
  }
}

// Modificar categoría por ID
const putCategoriaById = async (req, res) => {
  const { id } = req.params
  const { nombre, descripcion } = req.body
  try {
    const result = await pool.query(
      'UPDATE categoria SET nombre = $1, descripcion = $2 WHERE id = $3 RETURNING *',
      [nombre, descripcion, id]
    )
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No se encontró la categoría con id ${id}` })
    }
    return res.status(200).json({
      msg: 'Categoría modificada correctamente',
      categoria: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `No se pudo modificar la categoría con id ${id}` })
  }
}

// Eliminar categoría por ID
const deleteCategoriaById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query('DELETE FROM categoria WHERE id = $1 RETURNING *', [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No se encontró la categoría con id ${id}` })
    }
    return res.status(200).json({
      msg: 'Categoría eliminada correctamente',
      categoria: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudo eliminar la categoría' })
  }
}

module.exports = {
  getCategoriaAll,
  getCategoriaById,
  postNewCategoria,
  putCategoriaById,
  deleteCategoriaById
}
