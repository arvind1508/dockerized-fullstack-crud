const { createClient } = require("redis");

const redisUrl = `redis://${process.env.REDIS_HOST || "redis"}:${process.env.REDIS_PORT || 6379}`;

console.log("Connecting to Redis at:", redisUrl);

const redisClient = createClient({
  url: redisUrl,
});

redisClient.on("error", (err) => {
  console.error("Redis error:", err);
});

module.exports = redisClient;