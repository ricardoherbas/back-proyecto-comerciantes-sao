const pool = require('../config/conexion.js');
const redis = require('../config/redis.js');
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
      const claveTotal = `visitas:categoria:${categoriaId}`;
      let valor = await redis.get(claveTotal);
      if (valor === null) {
        const resultado = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas WHERE categoria_id=$1',[categoriaId]);
        valor = Number(resultado.rows[0].cantidad);
        await redis.set(claveTotal,valor);
      }
      visitas = Number(valor);
    } else if (pagina === 'index' || pagina === 'inicio') {
      const valor = await redis.get('visitas:pagina:index');
      visitas = Number(valor || 0);
    } else if (pagina === 'total') {
      let valor = await redis.get('visitas:total');
      if (valor === null) {
        const visitasIndex = await redis.get('visitas:pagina:index');
        const resultado = await pool.query('SELECT COALESCE(SUM(cantidad),0) AS cantidad FROM visitas');
        valor = Number(resultado.rows[0].cantidad) + Number(visitasIndex || 0);
        await redis.set('visitas:total',valor);
      }
      visitas = Number(valor);
    } else {
      return res.status(400).json({error:'Debe indicar categoria_id, pagina=index o pagina=total'});
    }
    let usuarios = await redis.get('usuarios:total');
    if (usuarios === null) {
      const resultadoUsuarios = await pool.query('SELECT COUNT(*) AS cantidad FROM usuario');
      usuarios = Number(resultadoUsuarios.rows[0].cantidad);
      await redis.set('usuarios:total',usuarios);
    }
    return res.status(200).json({usuarios:Number(usuarios),visitas});
  } catch (error) {
    console.error('Error al obtener estadísticas:',error);
    return res.status(500).json({error:'No se pudieron obtener las estadísticas'});
  }
};
const registrarVisita = async (req,res) => {
  try {
    const categoriaId = req.body.categoria_id !== undefined ? Number(req.body.categoria_id) : null;
    const pagina = typeof req.body.pagina === 'string' ? req.body.pagina.trim().toLowerCase() : null;
    if (categoriaId !== null) {
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) return res.status(400).json({error:'El categoria_id no es válido'});
      const fecha = obtenerFechaArgentina();
      const claveTotal = `visitas:categoria:${categoriaId}`;
      const claveDiaria = `visitas:diarias:${fecha}:categoria:${categoriaId}`;
      const resultado = await redis.multi().incr(claveTotal).incr(claveDiaria).incr('visitas:total').exec();
      return res.status(200).json({
        categoria_id:categoriaId,
        visitas:Number(resultado[0]),
        visitas_hoy:Number(resultado[1]),
        visitas_totales:Number(resultado[2])
      });
    }
    if (pagina === 'index' || pagina === 'inicio') {
      const resultado = await redis.multi().incr('visitas:pagina:index').incr('visitas:total').exec();
      return res.status(200).json({
        pagina:'index',
        visitas:Number(resultado[0]),
        visitas_totales:Number(resultado[1])
      });
    }
    return res.status(400).json({error:'Debe indicar categoria_id o pagina=index'});
  } catch (error) {
    console.error('Error al registrar visita:',error);
    return res.status(500).json({error:'No se pudo registrar la visita'});
  }
};
module.exports = {obtenerEstadisticas,registrarVisita};