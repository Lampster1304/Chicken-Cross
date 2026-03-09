import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { loginUser } from '../auth/authService';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validate, loginSchema } from '../middleware/validate';
import { getAllSettings, updateSetting, getBetLimits } from './settingsService';

export const adminRouter = Router();

// POST /api/admin/login
adminRouter.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    if (result.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// GET /api/admin/settings
adminRouter.get('/settings', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  try {
    const settings = await getAllSettings();
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener la configuración' });
  }
});

const updateSettingsSchema = z.object({
  minBet: z.number().positive('Min bet must be positive').optional(),
  maxBet: z.number().positive('Max bet must be positive').optional(),
}).refine(data => data.minBet !== undefined || data.maxBet !== undefined, {
  message: 'At least one setting must be provided',
});

// PUT /api/admin/settings
adminRouter.put('/settings', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Validation failed';
      return res.status(400).json({ error: msg });
    }

    const { minBet, maxBet } = parsed.data;

    // Get current limits to validate cross-constraints
    const current = await getBetLimits();
    const effectiveMin = minBet ?? current.minBet;
    const effectiveMax = maxBet ?? current.maxBet;

    if (effectiveMin > effectiveMax) {
      return res.status(400).json({ error: 'Min bet cannot exceed max bet' });
    }

    if (minBet !== undefined) {
      await updateSetting('min_bet', minBet.toFixed(2));
    }
    if (maxBet !== undefined) {
      await updateSetting('max_bet', maxBet.toFixed(2));
    }

    const settings = await getAllSettings();
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});
