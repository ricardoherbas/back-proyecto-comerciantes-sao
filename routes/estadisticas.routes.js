const { Router } = require('express');
const {
  obtenerEstadisticas,
  registrarVisita
} = require('../controllers/estadisticas.controller');

const router = Router();

router.get('/', obtenerEstadisticas);
router.post('/visita', registrarVisita);

module.exports = router;