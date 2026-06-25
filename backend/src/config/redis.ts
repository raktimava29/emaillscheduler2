import IORedis from "ioredis";

const redis = new IORedis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
});

(async () => {
  await redis.set("test", "ok");
  const value = await redis.get("test");
  console.log(value);
  process.exit(0);
})();
