const { Router } = require('express')
const {
  getPublicacionAll,
  getPublicacionById,
  postNewPublicacion,
  putPublicacionById,
  deletePublicacionById
} = require('../controllers/publicacion.controller')
const { validateInputPublicacion } = require('../middleware/publicacion.validator')
const verificarToken = require('../middleware/auth')
const upload = require('../middleware/upload')

const router = Router()

router.get('/', getPublicacionAll)
router.get('/:id', getPublicacionById)
router.post('/', verificarToken, upload.fields([{ name: 'foto1', maxCount: 1 }, { name: 'foto2', maxCount: 1 }]), validateInputPublicacion, postNewPublicacion)
router.put('/:id', verificarToken, upload.fields([{ name: 'foto1', maxCount: 1 }, { name: 'foto2', maxCount: 1 }]), validateInputPublicacion, putPublicacionById)
router.delete('/:id', verificarToken, deletePublicacionById)

module.exports = router