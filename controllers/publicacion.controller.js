const pool = require('../config/conexion.js')
const { supabase } = require('../config/supabase.js')

// Obtener publicaciones
const getPublicacionAll = async (req, res) => {
  try {
    const { categoria_id } = req.query
    let query = `
      SELECT p.id,p.usuario_id,p.categoria_id,p.celular,p.facebook,p.instagram,p.localidad,p.tiktok,p.descripcion,p.url_foto1,p.url_foto2,p.fecha,
             u.email AS usuario_email,u.nombre AS usuario_nombre,u.apellido AS usuario_apellido,c.nombre AS categoria_nombre
      FROM publicacion p
      JOIN usuario u ON p.usuario_id = u.id
      JOIN categoria c ON p.categoria_id = c.id
    `
    const valores = []
    if (categoria_id) {
      query += ` WHERE p.categoria_id = $1`
      valores.push(categoria_id)
    }
    query += ` ORDER BY p.fecha DESC`
    const result = await pool.query(query, valores)
    return res.status(200).json(result.rows)
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'No se pudieron obtener las publicaciones' })
  }
}

// Obtener publicación por ID
const getPublicacionById = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(`
      SELECT p.id,p.usuario_id,p.categoria_id,p.celular,p.facebook,p.instagram,p.localidad,p.tiktok,p.descripcion,p.url_foto1,p.url_foto2,p.fecha,
             u.email AS usuario_email,u.nombre AS usuario_nombre,u.apellido AS usuario_apellido,c.nombre AS categoria_nombre
      FROM publicacion p
      JOIN usuario u ON p.usuario_id = u.id
      JOIN categoria c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id])
    if (result.rows.length === 0) {
      return res.status(404).json({ msg: `No existe la publicación con id ${id}` })
    }
    return res.status(200).json(result.rows[0])
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: `No se pudo obtener la publicación con id ${id}` })
  }
}

// Obtener nombre del archivo desde la URL de Supabase
function obtenerNombreArchivo(url) {
  if (!url) return null
  try {
    const partes = url.split('/storage/v1/object/public/fotos/')
    if (partes.length < 2) return null
    return decodeURIComponent(partes[1].split('?')[0])
  } catch (error) {
    console.error('Error obteniendo nombre de archivo:', error)
    return null
  }
}

// Subir imagen a Supabase
async function subirFotoSupabase(file) {
  if (!file) return null
  const extension = file.originalname.split('.').pop().toLowerCase()
  const nombreArchivo = `${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage
    .from('fotos')
    .upload(nombreArchivo, file.buffer, {
      contentType: file.mimetype,
      upsert: false
    })
  if (error) throw error
  const { data } = supabase.storage
    .from('fotos')
    .getPublicUrl(nombreArchivo)
  return data.publicUrl
}

// Eliminar imagen de Supabase
async function eliminarFotoSupabase(url) {
  const nombreArchivo = obtenerNombreArchivo(url)
  if (!nombreArchivo) return
  const { error } = await supabase.storage
    .from('fotos')
    .remove([nombreArchivo])
  if (error) {
    console.error('Error eliminando foto de Supabase:', error)
  }
}

// Crear nueva publicación
const postNewPublicacion = async (req, res) => {
  const {
    categoria_id,
    celular,
    facebook,
    instagram,
    localidad,
    tiktok,
    descripcion
  } = req.body

  const usuario_id = req.usuario.id
  let url_foto1 = null
  let url_foto2 = null

  try {
    if (req.files?.foto1?.[0]) {
      url_foto1 = await subirFotoSupabase(req.files.foto1[0])
    }
    if (req.files?.foto2?.[0]) {
      url_foto2 = await subirFotoSupabase(req.files.foto2[0])
    }

    const result = await pool.query(
      `INSERT INTO publicacion
      (usuario_id,categoria_id,celular,facebook,instagram,localidad,tiktok,descripcion,url_foto1,url_foto2)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
      RETURNING *`,
      [
        usuario_id,
        categoria_id,
        celular,
        facebook,
        instagram,
        localidad,
        tiktok,
        descripcion,
        url_foto1,
        url_foto2
      ]
    )

    return res.status(201).json({
      msg: 'Publicación creada correctamente',
      publicacion: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    if (url_foto1) await eliminarFotoSupabase(url_foto1)
    if (url_foto2) await eliminarFotoSupabase(url_foto2)
    return res.status(500).json({
      error: 'No se pudo crear la publicación'
    })
  }
}

// Modificar publicación por ID
const putPublicacionById = async (req, res) => {
  const { id } = req.params
  const {
    categoria_id,
    celular,
    facebook,
    instagram,
    localidad,
    tiktok,
    descripcion
  } = req.body

  try {
    const anterior = await pool.query(
      'SELECT * FROM publicacion WHERE id = $1',
      [id]
    )

    if (anterior.rows.length === 0) {
      return res.status(404).json({
        msg: `No se encontró la publicación con id ${id}`
      })
    }

    const publicacionAnterior = anterior.rows[0]
    let url_foto1 = publicacionAnterior.url_foto1
    let url_foto2 = publicacionAnterior.url_foto2

    if (req.files?.foto1?.[0]) {
      const nuevaFoto1 = await subirFotoSupabase(req.files.foto1[0])
      if (url_foto1) await eliminarFotoSupabase(url_foto1)
      url_foto1 = nuevaFoto1
    }

    if (req.files?.foto2?.[0]) {
      const nuevaFoto2 = await subirFotoSupabase(req.files.foto2[0])
      if (url_foto2) await eliminarFotoSupabase(url_foto2)
      url_foto2 = nuevaFoto2
    }

    const result = await pool.query(
      `UPDATE publicacion
       SET categoria_id=$1,
           celular=$2,
           facebook=$3,
           instagram=$4,
           localidad=$5,
           tiktok=$6,
           descripcion=$7,
           url_foto1=$8,
           url_foto2=$9
       WHERE id=$10
       RETURNING *`,
      [
        categoria_id,
        celular,
        facebook,
        instagram,
        localidad,
        tiktok,
        descripcion,
        url_foto1,
        url_foto2,
        id
      ]
    )

    return res.status(200).json({
      msg: 'Publicación modificada correctamente',
      publicacion: result.rows[0]
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: `No se pudo modificar la publicación con id ${id}`
    })
  }
}

// Eliminar publicación por ID
const deletePublicacionById = async (req, res) => {
  const { id } = req.params
  const usuario_id = req.usuario.id

  try {
    const result = await pool.query(
      `SELECT * FROM publicacion
       WHERE id = $1 AND usuario_id = $2`,
      [id, usuario_id]
    )

    if (result.rows.length === 0) {
      return res.status(404).json({
        msg: 'No se encontró la publicación o no tienes permiso para eliminarla'
      })
    }

    const publicacion = result.rows[0]

    if (publicacion.url_foto1) {
      await eliminarFotoSupabase(publicacion.url_foto1)
    }

    if (publicacion.url_foto2) {
      await eliminarFotoSupabase(publicacion.url_foto2)
    }

    await pool.query(
      'DELETE FROM publicacion WHERE id = $1 AND usuario_id = $2',
      [id, usuario_id]
    )

    return res.status(200).json({
      msg: 'Publicación y fotos eliminadas correctamente'
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      error: 'No se pudo eliminar la publicación'
    })
  }
}

module.exports = {
  getPublicacionAll,
  getPublicacionById,
  postNewPublicacion,
  putPublicacionById,
  deletePublicacionById
}