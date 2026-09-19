import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { redis } from "../config/redis.js"; // 👈 Added the explicit .js extension right here

import "dotenv/config";

async function prewarmCache() {
  console.log("🔌 Connecting to primary database...");
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    console.log("🔍 Fetching high-demand flash sale item from Postgres...");

    // 1. Locate our seeded iPhone 17 record by its flash sale status
    const targetProduct = await prisma.product.findFirst({
      where: { isFlashSale: true },
    });

    if (!targetProduct) {
      console.error(
        "❌ Error: No flash sale product found in the database. Please run your seed script first.",
      );
      return;
    }

    console.log(
      `📦 Found Product: ${targetProduct.name} | Initial Stock: ${targetProduct.stock}`,
    );

    // 2. Define the fast-memory caching keys
    const stockKey = `flash_sale:stock:${targetProduct.id}`;

    console.log("⚡ Pre-warming fast-memory Redis container cache layers...");

    // 3. Atomically seed the stock value into Redis memory
    await redis.set(stockKey, targetProduct.stock);

    // Double-check our work by immediately querying Redis
    const currentCachedStock = await redis.get(stockKey);
    console.log(
      `✅ Success! Redis memory pre-warmed. Key [${stockKey}] is set to: ${currentCachedStock}`,
    );
  } catch (error) {
    console.error("❌ Pre-warm operation failed:", error);
  } finally {
    // 4. Gracefully terminate our pool worker sessions
    await prisma.$disconnect();
    await pool.end();
    await redis.quit();
  }
}

prewarmCache();
