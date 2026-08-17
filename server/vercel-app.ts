import express from "express";
import { createDbClient } from "@save-and-spend/db";
import { createApp } from "../apps/api/src/app.js";

const calculationDate = process.env.CALCULATION_DATE ?? "2026-07-15T12:00:00.000Z";
const instant = new Date(calculationDate);

if (Number.isNaN(instant.getTime())) {
  throw new Error("CALCULATION_DATE must be a valid ISO-8601 instant.");
}

const db = createDbClient();
const app = express();

// Each thin file under api/ maps a Vercel Function route to this one Express app.
// Mounting at /api preserves the API's existing framework-neutral root routes.
app.use(
  "/api",
  createApp({
    db,
    now: () => new Date(instant),
  }),
);

export default app;
