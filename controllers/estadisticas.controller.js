const pool = require('../config/conexion.js');

function obtenerFechaArgentina() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(new Date());
}

// Buffer en memoria
let visitasPendientesIndex = 0;
let visitasPendientesCategorias = {};

const registrarVisita = async (req, res) => {
  const categoriaId = req.body.categoria_id !== undefined ? Number(req.body.categoria_id) : null;
  const pagina = typeof req.body.pagina === 'string' ? req.body.pagina.trim().toLowerCase() : null;

  if (categoriaId !== null) {
    if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
      return res.status(400).json({ error: 'El categoria_id no es válido' });
    }
    visitasPendientesCategorias[categoriaId] = (visitasPendientesCategorias[categoriaId] || 0) + 1;
    return res.status(200).json({ categoria_id: categoriaId, visitasPendientes: visitasPendientesCategorias[categoriaId] });
  }

  if (pagina === 'index' || pagina === 'inicio') {
    visitasPendientesIndex++;
    return res.status(200).json({ pagina: 'index', visitasPendientes: visitasPendientesIndex });
  }

  return res.status(400).json({ error: 'Debe indicar categoria_id o pagina=index' });
};

const obtenerEstadisticas = async (req, res) => {
  try {
    const categoriaId = req.query.categoria_id !== undefined ? Number(req.query.categoria_id) : null;
    const pagina = typeof req.query.pagina === 'string' ? req.query.pagina.trim().toLowerCase() : null;
    let visitas = 0;

    if (categoriaId !== null) {
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) {
        return res.status(400).json({ error: 'El categoria_id no es válido' });
      }
      const resultado = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas WHERE categoria_id=$1', [categoriaId]);
      visitas = Number(resultado.rows[0].cantidad) + (visitasPendientesCategorias[categoriaId] || 0);
    } else if (pagina === 'index' || pagina === 'inicio') {
      const resultado = await pool.query("SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas_pagina WHERE pagina='index'");
      visitas = Number(resultado.rows[0].cantidad) + visitasPendientesIndex;
    } else if (pagina === 'total') {
      const resultadoCategorias = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas');
      const resultadoPaginas = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas_pagina');
      visitas = Number(resultadoCategorias.rows[0].cantidad) + Number(resultadoPaginas.rows[0].cantidad);

      // sumamos buffer
      visitas += visitasPendientesIndex;
      visitas += Object.values(visitasPendientesCategorias).reduce((a, b) => a + b, 0);
    } else {
      return res.status(400).json({ error: 'Debe indicar categoria_id, pagina=index o pagina=total' });
    }

    const resultadoUsuarios = await pool.query('SELECT COUNT(*) AS cantidad FROM usuario');
    const usuarios = Number(resultadoUsuarios.rows[0].cantidad);

    return res.status(200).json({ usuarios, visitas });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return res.status(500).json({ error: 'No se pudieron obtener las estadísticas' });
  }
};

// Persistir cada hora
setInterval(async () => {
  const fecha = obtenerFechaArgentina();
  const cliente = await pool.connect();
  try {
    await cliente.query('BEGIN');

    // Guardar visitas index
    if (visitasPendientesIndex > 0) {
      await cliente.query(
        `INSERT INTO visitas_pagina (fecha,pagina,cantidad)
         VALUES ($1,'index',$2)
         ON CONFLICT (fecha,pagina) DO UPDATE SET cantidad=visitas_pagina.cantidad+$2`,
        [fecha, visitasPendientesIndex]
      );
      visitasPendientesIndex = 0;
    }

    // Guardar visitas por categoría
    for (const [catId, cantidad] of Object.entries(visitasPendientesCategorias)) {
      if (cantidad > 0) {
        await cliente.query(
          `INSERT INTO visitas (fecha,categoria_id,cantidad)
           VALUES ($1,$2,$3)
           ON CONFLICT (fecha,categoria_id) DO UPDATE SET cantidad=visitas.cantidad+$3`,
          [fecha, catId, cantidad]
        );
      }
    }
    visitasPendientesCategorias = {};

    await cliente.query('COMMIT');
    console.log('✅ Visitas acumuladas guardadas en BD');
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    console.error('Error al guardar visitas acumuladas:', error);
  } finally {
    cliente.release();
  }
}, 60 * 60 * 1000); // cada hora

module.exports = { obtenerEstadisticas, registrarVisita };
