
const jwt = require('jsonwebtoken')

const verificarToken = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token no proporcionado'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'secret_key'
    )

    req.usuario = decoded

    next()

  } catch (error) {
    return res.status(401).json({
      error: 'Token inválido'
    })
  }
}

module.exports = verificarToken

