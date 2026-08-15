const pool = require('../config/conexion.js');
function obtenerFechaArgentina() {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
}
const obtenerEstadisticas = async (req,res) => {
  try {
    const categoriaId = req.query.categoria_id !== undefined ? Number(req.query.categoria_id) : null;
    const pagina = typeof req.query.pagina === 'string' ? req.query.pagina.trim().toLowerCase() : null;
    let visitas;
    if (categoriaId !== null) {
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) return res.status(400).json({error:'El categoria_id no es válido'});
      const resultado = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas WHERE categoria_id=$1',[categoriaId]);
      visitas = Number(resultado.rows[0].cantidad);
    } else if (pagina === 'index' || pagina === 'inicio') {
      const resultado = await pool.query("SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas_pagina WHERE pagina='index'");
      visitas = Number(resultado.rows[0].cantidad);
    } else if (pagina === 'total') {
      const resultadoCategorias = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas');
      const resultadoPaginas = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas_pagina');
      visitas = Number(resultadoCategorias.rows[0].cantidad) + Number(resultadoPaginas.rows[0].cantidad);
    } else {
      return res.status(400).json({error:'Debe indicar categoria_id, pagina=index o pagina=total'});
    }
    const resultadoUsuarios = await pool.query('SELECT COUNT(*) AS cantidad FROM usuario');
    const usuarios = Number(resultadoUsuarios.rows[0].cantidad);
    return res.status(200).json({usuarios,visitas});
  } catch (error) {
    console.error('Error al obtener estadísticas:',error);
    return res.status(500).json({error:'No se pudieron obtener las estadísticas'});
  }
};
const registrarVisita = async (req,res) => {
  const cliente = await pool.connect();
  try {
    const categoriaId = req.body.categoria_id !== undefined ? Number(req.body.categoria_id) : null;
    const pagina = typeof req.body.pagina === 'string' ? req.body.pagina.trim().toLowerCase() : null;
    const fecha = obtenerFechaArgentina();
    if (categoriaId !== null) {
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) return res.status(400).json({error:'El categoria_id no es válido'});
      await cliente.query('BEGIN');
      const resultado = await cliente.query(`INSERT INTO visitas (fecha,categoria_id,cantidad) VALUES ($1,$2,1) ON CONFLICT (fecha,categoria_id) DO UPDATE SET cantidad=visitas.cantidad+1 RETURNING cantidad`,[fecha,categoriaId]);
      const visitas = Number(resultado.rows[0].cantidad);
      const resultadoTotalCategorias = await cliente.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas');
      const resultadoTotalPaginas = await cliente.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas_pagina');
      const visitasTotales = Number(resultadoTotalCategorias.rows[0].cantidad) + Number(resultadoTotalPaginas.rows[0].cantidad);
      await cliente.query('COMMIT');
      return res.status(200).json({categoria_id:categoriaId,visitas,visitas_hoy:visitas,visitas_totales:visitasTotales});
    }
    if (pagina === 'index' || pagina === 'inicio') {
      await cliente.query('BEGIN');
      const resultado = await cliente.query(`INSERT INTO visitas_pagina (fecha,pagina,cantidad) VALUES ($1,'index',1) ON CONFLICT (fecha,pagina) DO UPDATE SET cantidad=visitas_pagina.cantidad+1 RETURNING cantidad`,[fecha]);
      const visitas = Number(resultado.rows[0].cantidad);
      const resultadoTotalCategorias = await cliente.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas');
      const resultadoTotalPaginas = await cliente.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas_pagina');
      const visitasTotales = Number(resultadoTotalCategorias.rows[0].cantidad) + Number(resultadoTotalPaginas.rows[0].cantidad);
      await cliente.query('COMMIT');
      return res.status(200).json({pagina:'index',visitas,visitas_totales:visitasTotales});
    }
    return res.status(400).json({error:'Debe indicar categoria_id o pagina=index'});
  } catch (error) {
    await cliente.query('ROLLBACK').catch(() => {});
    console.error('Error al registrar visita:',error);
    return res.status(500).json({error:'No se pudo registrar la visita'});
  } finally {
    cliente.release();
  }
};
module.exports = {obtenerEstadisticas,registrarVisita};