const { createClient } = require("redis");
const redis = createClient({
  url: process.env.REDIS_URL || `redis://${process.env.REDIS_HOST || "redis"}:${process.env.REDIS_PORT || 6379}`
});
redis.on("error", error => {
  console.error("Error de Redis:", error);
});
(async () => {
  try {
    await redis.connect();
    console.log("Redis conectado correctamente");
  } catch (error) {
    console.error("No se pudo conectar a Redis:", error);
  }
})();
module.exports = redis;