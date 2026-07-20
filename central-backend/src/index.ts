import express from 'express';
import authRoutes from './routes/auth.routes.js';

const app = express();

app.use(express.json());

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running.",
  });
});

app.use("/api/auth", authRoutes);

const port = 3000;

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});