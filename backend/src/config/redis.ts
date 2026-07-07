import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

(async () => {
  try {
    await redis.set("test", "ok");
    console.log("Redis is working!");
  } finally {
    await redis.quit();
  }
})();