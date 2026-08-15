const { Router } = require('express')
const {
  getUsuarioAll,
  getUsuarioById,
  postNewUsuario,
  putUsuarioById,
  deleteUsuarioById
} = require('../controllers/usuario.controller')
const { validateInputUsuario, validaEmailUnico } = require('../middleware/usuario.validator')
const router = Router()

router.get('/', getUsuarioAll)
router.get('/:id', getUsuarioById)
router.post('/', validateInputUsuario, validaEmailUnico, postNewUsuario)
router.put('/:id', validateInputUsuario, validaEmailUnico, putUsuarioById)
router.delete('/:id', deleteUsuarioById)

module.exports = router
