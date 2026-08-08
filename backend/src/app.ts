import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config/env.js";
import { UPLOAD_ROOT } from "./middlewares/upload.middleware.js";
import { notFoundHandler, errorHandler } from "./middlewares/error.middleware.js";
import apiRoutes from "./routes/index.js";

export const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.allowedOrigins,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use("/uploads", express.static(UPLOAD_ROOT));

app.get("/health", (_req, res) => {
  res.json({ success: true, message: "CA Firm Management System API is running" });
});

app.use("/api", apiRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
