import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';

export const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50).trim(),
  email: z.string().email('Invalid email address').max(255).trim().toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const gameStartSchema = z.object({
  amount: z.number().positive('Bet must be positive').max(1000000, 'Bet too large'),
  difficulty: z.number().int().min(1, 'Min 1 car').max(4, 'Max 4 cars'),
  autoCashOutAt: z.number().min(1.01, 'Auto cash-out must be > 1.00').optional(),
});

export const chatSchema = z.object({
  message: z.string().min(1).max(200).trim(),
});

export function validate(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issues = result.error.issues || (result.error as any).errors || [];
      const firstMessage = issues.length > 0 ? issues[0].message : 'Validation failed';
      return res.status(400).json({ error: firstMessage });
    }
    req.body = result.data;
    next();
  };
}
