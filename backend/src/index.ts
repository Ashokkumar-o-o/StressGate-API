import express, { Request, Response } from "express";
import { redis } from "./config/redis.js";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post(
  "/api/v1/checkout",
  async (req: Request, res: Response): Promise<void> => {
    const productId = "8c2a8502-e4eb-431f-9aed-684c6467ae30";
    const stockKey = `flash_sale:stock:${productId}`;
    const userId =
      req.body.userId || `user_${Math.random().toString(36).substring(2, 9)}`;

    try {
      // 1. ATOMIC INVETORY DECREMENT
      const currentStock = await redis.decr(stockKey);

      if (currentStock < 0) {
        res.status(410).json({ success: false, message: "Sold Out!" });
        return;
      }

      // 2. ENQUEUE RESERVATION: Push the successful claim into the Redis FIFO Queue
      const orderPayload = JSON.stringify({ userId, productId });
      await redis.rpush("flash_sale_orders_queue", orderPayload);

      console.log(
        `🎟️ Reservation Secured & Enqueued: User [${userId}] claimed unit #${100 - currentStock}`,
      );

      res.status(200).json({
        success: true,
        message:
          "Reservation secured! Processing your payment in the background.",
        unitNumber: 100 - currentStock,
      });
    } catch (error) {
      console.error("❌ Checkout Endpoint Error:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal server error." });
    }
  },
);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" });
});

app.listen(PORT, () => {
  console.log(`🚀 Concurrency Server running at http://localhost:${PORT}`);
});
