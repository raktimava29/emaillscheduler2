import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

(async () => {
  await redis.set("test", "ok");
  process.exit(0);
})();
