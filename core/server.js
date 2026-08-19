const express = require('express')
const cors = require('cors')
require('dotenv').config()

class Server {
  constructor() {
    this.app = express()
    this.port = process.env.PORT || 3000
    this.middleware()
    this.rutas()
    this.errorHandler()
  }

  middleware() {
    // Configuración de CORS con tu dominio
    const corsOptions = {
      origin: ["https://qui3ro.com"], // dominio del front
      methods: ["GET", "POST", "PUT", "DELETE"],
      allowedHeaders: ["Content-Type", "Authorization"]
    }

    this.app.use(cors(corsOptions))
    this.app.use(express.json())
    this.app.use(express.static('public'))
  }

  rutas() {
    this.app.use('/api/usuario', require('../routes/usuario.routes'))
    this.app.use('/api/categoria', require('../routes/categoria.routes'))
    this.app.use('/api/publicacion', require('../routes/publicacion.routes'))
    this.app.use('/api/login', require('../routes/login.routes'))
    this.app.use('/api/estadisticas', require('../routes/estadisticas.routes'))
  }

  errorHandler() {
    this.app.use((req, res, next) => {
      return res.status(404).json({ msg: 'Error. Página no encontrada' })
    })
    this.app.use((err, req, res, next) => {
      console.error(err.stack)
      return res.status(500).json({ msg: 'Internal Server Error' })
    })
  }

  listen() {
    this.app.listen(this.port, () => {
      console.log(`La API está escuchando en el puerto: ${this.port}`)
    })
  }
}

module.exports = Server
