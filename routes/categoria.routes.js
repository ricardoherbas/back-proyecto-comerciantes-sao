const { Router } = require('express')
const {
  getCategoriaAll,
  getCategoriaById,
  postNewCategoria,
  putCategoriaById,
  deleteCategoriaById
} = require('../controllers/categoria.controller')
const { validateInputCategoria, validaNombreUnico } = require('../middleware/categoria.validator')
const router = Router()

router.get('/', getCategoriaAll)
router.get('/:id', getCategoriaById)
router.post('/', validateInputCategoria, validaNombreUnico, postNewCategoria)
router.put('/:id', validateInputCategoria, validaNombreUnico, putCategoriaById)
router.delete('/:id', deleteCategoriaById)

module.exports = router
