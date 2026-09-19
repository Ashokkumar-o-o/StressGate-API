import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { redis } from "../config/redis.js";
import "dotenv/config";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function startOrderWorker() {
  console.log(
    "🤖 Background Order Worker initialized. Listening for successful reservations...",
  );

  while (true) {
    try {
      // 1. BLPOP blocks connection for up to 5 seconds waiting for an item to drop into the queue
      const result = await redis.blpop("flash_sale_orders_queue", 5);

      if (!result) continue; // If queue is empty, restart the loop search

      // result[0] is the queue name, result[1] is our stringified payload
      const { userId, productId } = JSON.parse(result[1]);
      console.log(`\n⚙️ Processing order queue item for User: [${userId}]`);

      // 2. SIMULATE PAYMENT EDGE CASE (30% Chance of Failure)
      const isPaymentSuccessful = Math.random() > 0.3;

      if (!isPaymentSuccessful) {
        console.error(
          `❌ Payment FAILED for User [${userId}]. Initiating stock rollback...`,
        );

        // ATOMIC ROLLBACK: Add the 1 stock back to the Redis counter instantly
        const stockKey = `flash_sale:stock:${productId}`;
        const restockedCount = await redis.incr(stockKey);

        console.log(
          `🔄 Inventory Restocked! Current Redis stock pool capacity: ${restockedCount}`,
        );
        continue; // Skip database insertion entirely
      }

      // 3. HAPPY PATH: Payment Succeeded -> Commit order permanently to PostgreSQL
      console.log(
        `💳 Payment Approved for User [${userId}]. Committing to Postgres database...`,
      );

      const newOrder = await prisma.order.create({
        data: {
          productId: productId,
          userId: userId,
        },
      });

      console.log(
        `✅ Order Successfully Saved to Postgres! Order ID: ${newOrder.id}`,
      );
    } catch (error) {
      console.error("❌ Worker processing error encountered:", error);
    }
  }
}

startOrderWorker().catch((err) => {
  console.error("❌ Critical worker breakdown:", err);
});
