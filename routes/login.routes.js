const { Router } = require('express')
const { login } = require('../controllers/login.controller')

const router = Router()

// POST /api/login
router.post('/', login)

module.exports = router
