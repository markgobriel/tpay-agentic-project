import express, { type Express, type NextFunction, type Request, type Response } from "express";
import type { HealthResponse, TimezonePolicyResponse } from "@save-and-spend/contracts";
import { ANALYSIS_TIMEZONE } from "@save-and-spend/domain";
import {
  createFinanceService,
  HttpError,
  type FinanceService,
  type FinanceServiceOptions,
} from "./finance-service.js";

export interface CreateAppOptions extends FinanceServiceOptions {
  financeService?: FinanceService;
}

export function createApp(options: CreateAppOptions): Express {
  const app = express();
  const finance = options.financeService ?? createFinanceService(options);

  app.use(express.json({ limit: "32kb" }));

  app.get("/health", (_req, res) => {
    const body: HealthResponse = {
      status: "ok",
      service: "save-and-spend-api",
    };
    res.json(body);
  });

  app.get("/meta/timezone-policy", (_req, res) => {
    const body: TimezonePolicyResponse = {
      analysisTimezone: ANALYSIS_TIMEZONE,
    };
    res.json(body);
  });

  app.get("/account", async (_req, res, next) => {
    try {
      res.json(await finance.getAccount());
    } catch (error) {
      next(error);
    }
  });

  app.get("/transactions", async (_req, res, next) => {
    try {
      res.json(await finance.getTransactions());
    } catch (error) {
      next(error);
    }
  });

  app.get("/analytics", async (req, res, next) => {
    try {
      const month = typeof req.query.month === "string" ? req.query.month : "";
      if (!month) {
        throw new HttpError(
          400,
          "missing_month",
          "Query parameter month is required (UTC YYYY-MM).",
        );
      }
      res.json(await finance.getMonthlyAnalytics(month));
    } catch (error) {
      next(error);
    }
  });

  app.get("/savings-goal", async (_req, res, next) => {
    try {
      res.json(await finance.getSavingsGoal());
    } catch (error) {
      next(error);
    }
  });

  app.get("/recommendations", async (_req, res, next) => {
    try {
      res.json(await finance.getRecommendations());
    } catch (error) {
      next(error);
    }
  });

  app.put("/savings-goal", async (req, res, next) => {
    try {
      res.json(await finance.upsertSavingsGoal(req.body));
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (error instanceof HttpError) {
      res.status(error.status).json(error.toResponse());
      return;
    }
    if (res.headersSent) {
      next(error);
      return;
    }
    console.error(error);
    res.status(500).json({
      error: { code: "internal_error", message: "Unexpected server error." },
    });
  });

  return app;
}
