import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import { config } from "./config";
import { notFound, errorHandler } from "./middleware/error";

import agencyRoutes from "./routes/agencies";
import complaintRoutes from "./routes/complaints";
import destinationRoutes from "./routes/destinations";
import smsRoutes from "./routes/sms";
import authRoutes from "./routes/auth";
import adminRoutes from "./routes/admin";
import agencyPortalRoutes from "./routes/agencyPortal";
import statsRoutes from "./routes/stats";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.frontendUrl === "*" ? true : config.frontendUrl.split(","),
    credentials: true,
  })
);
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
if (config.nodeEnv !== "test") app.use(morgan("dev"));

// Rate limit public search/sms endpoints to deter scraping/abuse.
const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

app.get("/health", (_req, res) => res.json({ status: "ok", service: "probashi-shield-api" }));

const API = "/api/v1";
app.use(`${API}/agencies`, publicLimiter, agencyRoutes);
app.use(`${API}/complaints`, publicLimiter, complaintRoutes);
app.use(`${API}/destinations`, destinationRoutes);
app.use(`${API}/sms`, publicLimiter, smsRoutes);
app.use(`${API}/stats`, statsRoutes);
app.use(`${API}/auth`, authRoutes);
app.use(`${API}/admin`, adminRoutes);
app.use(`${API}/agency-portal`, agencyPortalRoutes);

app.use(notFound);
app.use(errorHandler);

if (require.main === module) {
  app.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Probashi Shield API running on http://localhost:${config.port}`);
  });
}

export default app;
