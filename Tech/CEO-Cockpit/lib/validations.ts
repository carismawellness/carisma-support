import { z } from "zod";

export const chatSchema = z.object({
  message: z.string().min(1).max(2000),
});

export const summarySchema = z.object({
  page: z.string().min(1),
  dateFrom: z.string().min(1),
  dateTo: z.string().min(1),
  brandFilter: z.string().nullable().optional(),
  kpiSnapshot: z.record(z.string(), z.unknown()),
});

export const rootCauseSchema = z.object({
  alertId: z.number().int().positive().optional(),
  metric: z.string().min(1),
  value: z.number(),
  target: z.number().optional(),
  department: z.string().min(1),
});

export const annotationSchema = z.object({
  page: z.string().min(1),
  note: z.string().min(1).max(500),
  date: z.string().min(1),
});

export const auditSchema = z.object({
  action: z.string().min(1),
  page: z.string().optional(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export const approveSchema = z.object({
  alert_id: z.number().int().positive(),
  action: z.enum(["approve", "dismiss"]),
});

export const notifySchema = z.object({
  alerts: z.array(
    z.object({
      metric: z.string(),
      value: z.number(),
      target: z.number().optional(),
      department: z.string(),
      severity: z.string(),
      message: z.string(),
    })
  ),
  recipientEmail: z.string().email().optional(),
});

// --- Rate Limiter ---

const rateLimiter = new Map<string, { count: number; resetAt: number }>();
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

export function checkRateLimit(
  userId: string,
  limit: number
): boolean {
  const now = Date.now();
  const key = `${userId}`;
  const entry = rateLimiter.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimiter.set(key, { count: 1, resetAt: now + RATE_WINDOW });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}
