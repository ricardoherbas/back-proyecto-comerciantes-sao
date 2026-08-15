const pool = require('../config/conexion.js');
const redis = require('../config/redis.js');

function obtenerFechaArgentina(fecha = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(fecha);
}

function obtenerFechaAnterior() {
  const ahora = new Date();
  ahora.setDate(ahora.getDate() - 1);
  return obtenerFechaArgentina(ahora);
}

async function obtenerClaves(patron) {
  const claves = [];
  let cursor = '0';
  do {
    const resultado = await redis.scan(cursor, {
      MATCH: patron,
      COUNT: 100
    });
    cursor = String(resultado.cursor);
    if (resultado.keys.length > 0) {
      claves.push(...resultado.keys);
    }
  } while (cursor !== '0');
  return claves;
}

async function sincronizarFecha(fecha, eliminarDespues = false) {
  const patron = `visitas:diarias:${fecha}:categoria:*`;
  const claves = await obtenerClaves(patron);
  if (claves.length === 0) return 0;
  let sincronizadas = 0;
  for (const clave of claves) {
    try {
      const partes = clave.split(':');
      if (partes.length !== 5) continue;
      const categoriaId = Number(partes[4]);
      if (!Number.isInteger(categoriaId) || categoriaId <= 0) continue;
      const cantidad = Number(await redis.get(clave) || 0);
      if (cantidad <= 0) {
        if (eliminarDespues) await redis.del(clave);
        continue;
      }
      await pool.query(
        `INSERT INTO visitas (fecha, categoria_id, cantidad)
         VALUES ($1, $2, $3)
         ON CONFLICT (fecha, categoria_id)
         DO UPDATE SET cantidad = EXCLUDED.cantidad`,
        [fecha, categoriaId, cantidad]
      );
      sincronizadas++;
      if (eliminarDespues) {
        await redis.del(clave);
      }
    } catch (error) {
      console.error(`Error sincronizando la clave ${clave}:`, error);
    }
  }
  return sincronizadas;
}

async function sincronizarVisitas() {
  try {
    const fechaActual = obtenerFechaArgentina();
    const fechaAnterior = obtenerFechaAnterior();
    const sincronizadasActual = await sincronizarFecha(fechaActual, false);
    const sincronizadasAnterior = await sincronizarFecha(fechaAnterior, true);
    if (sincronizadasActual > 0 || sincronizadasAnterior > 0) {
      console.log(
        `Visitas sincronizadas. Hoy: ${sincronizadasActual}. Día anterior: ${sincronizadasAnterior}.`
      );
    }
  } catch (error) {
    console.error('Error general sincronizando visitas:', error);
  }
}

module.exports = sincronizarVisitas;