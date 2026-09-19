import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Basic health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date(),
    services: {
      postgres: "pending",
      redis: "pending",
    },
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Mock E-commerce Backend running on http://localhost:${PORT}`);
});
