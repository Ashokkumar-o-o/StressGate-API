// @ts-nocheck
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import "dotenv/config";

async function main() {
  console.log("🔌 Establishing unified database pool connection...");

  // 1. Initialize the official PostgreSQL connection Pool
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  // 2. Wrap it directly inside Prisma's driver adapter
  const adapter = new PrismaPg(pool);

  // 3. Instantiate your Client
  const prisma = new PrismaClient({ adapter });

  console.log("🔄 Cleaning up database records...");
  await prisma.order.deleteMany({});
  await prisma.product.deleteMany({});

  console.log("🌱 Seeding flash sale product...");
  const flashSaleProduct = await prisma.product.create({
    data: {
      name: "iPhone 17 Pro (Flash Sale)",
      price: 599.99, // 40% discount simulated
      stock: 100, // Total available high-demand stock
      isFlashSale: true,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`📦 Created Product ID: ${flashSaleProduct.id}`);

  // Gracefully clean up all connections in the pool
  await prisma.$disconnect();
  await pool.end();
}

main().catch((e) => {
  console.error("❌ Error seeding database:", e);
  throw e;
});
