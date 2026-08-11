import express from "express";
import type { HealthResponse } from "@save-and-spend/contracts";
import { ANALYSIS_TIMEZONE } from "@save-and-spend/domain";

const app = express();
const port = Number(process.env.PORT ?? 3001);

app.get("/health", (_req, res) => {
  const body: HealthResponse = {
    status: "ok",
    service: "save-and-spend-api",
  };
  res.json(body);
});

app.get("/meta/timezone-policy", (_req, res) => {
  res.json({ analysisTimezone: ANALYSIS_TIMEZONE });
});

export function createApp() {
  return app;
}

if (process.env.NODE_ENV !== "test") {
  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}
