const pool = require('../config/conexion.js')

// Validar campos obligatorios
const validateInputPublicacion = (req, res, next) => {
  const {
    categoria_id,
    celular,
    facebook,
    instagram,
    localidad,
    tiktok,
    descripcion,
    url_foto1,
    url_foto2
  } = req.body

  const error = []

  // El usuario_id se obtiene desde el token JWT
  if (!req.usuario || !req.usuario.id) {
    error.push('Usuario no autenticado.')
  }

  // FormData envía categoria_id como string, por eso se convierte a número
  if (!categoria_id || isNaN(Number(categoria_id))) {
    error.push('El categoria_id es obligatorio y debe ser numérico.')
  }

  if (celular && typeof celular !== 'string') {
    error.push('El celular debe ser texto.')
  }

  if (facebook && typeof facebook !== 'string') {
    error.push('El Facebook debe ser texto.')
  }

  if (instagram && typeof instagram !== 'string') {
    error.push('El Instagram debe ser texto.')
  }

  if (localidad && typeof localidad !== 'string') {
    error.push('Localidad debe ser texto.')
  }

  if (tiktok && typeof tiktok !== 'string') {
    error.push('El TikTok debe ser texto.')
  }

  if (descripcion && typeof descripcion !== 'string') {
    error.push('La descripción debe ser texto.')
  }

  if (url_foto1 && typeof url_foto1 !== 'string') {
    error.push('La URL de la foto 1 debe ser texto.')
  }

  if (url_foto2 && typeof url_foto2 !== 'string') {
    error.push('La URL de la foto 2 debe ser texto.')
  }

  if (error.length > 0) {
    return res.status(400).json({ error })
  }

  next()
}

module.exports = { validateInputPublicacion }