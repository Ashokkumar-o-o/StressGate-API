import { Redis } from "ioredis"; // 👈 Switched to explicit named import destructuring
import "dotenv/config";

// 1. Read the Redis connection URL from environment variables, fallback to local default
const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

// 2. Initialize the centralized Redis instance with strict parameter type mapping
export const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times: number): number | null {
    // 👈 Explicitly typed argument and return bounds
    if (times > 3) return null; // Stop retrying after 3 failed attempts to protect resources
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on("connect", () => {
  console.log("⚡ Redis Client: Connected successfully to Docker instance");
});

redis.on("error", (err: Error) => {
  // 👈 Explicitly typed error entity type bounds
  console.error("❌ Redis Client Error:", err);
});
