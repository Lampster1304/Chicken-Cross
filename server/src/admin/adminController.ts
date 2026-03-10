import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { loginUser } from '../auth/authService';
import { authMiddleware } from '../middleware/authMiddleware';
import { adminMiddleware } from '../middleware/adminMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validate, loginSchema } from '../middleware/validate';
import { getAllSettings, updateSetting, getBetLimits, getSiteStats } from './settingsService';
import { getActiveStats } from '../game/gameEngine';

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
  minBet: z.number().positive('El monto mínimo debe ser positivo').optional(),
  maxBet: z.number().positive('El monto máximo debe ser positivo').optional(),
  difficulty: z.number().min(1).max(4).optional(),
  mult1: z.number().positive().optional(),
  mult2: z.number().positive().optional(),
  mult3: z.number().positive().optional(),
  mult4: z.number().positive().optional(),
}).refine(data => Object.values(data).some(v => v !== undefined), {
  message: 'Al menos una configuración debe proporcionarse',
});

// PUT /api/admin/settings
adminRouter.put('/settings', authMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const parsed = updateSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message || 'Validación fallida';
      return res.status(400).json({ error: msg });
    }

    const { minBet, maxBet, difficulty, mult1, mult2, mult3, mult4 } = parsed.data;

    // Get current limits to validate cross-constraints
    const current = await getBetLimits();
    const effectiveMin = minBet ?? current.minBet;
    const effectiveMax = maxBet ?? current.maxBet;

    if (effectiveMin > effectiveMax) {
      return res.status(400).json({ error: 'El monto mínimo no puede superar al máximo' });
    }

    if (minBet !== undefined) {
      await updateSetting('min_bet', minBet.toFixed(2));
    }
    if (maxBet !== undefined) {
      await updateSetting('max_bet', maxBet.toFixed(2));
    }
    if (difficulty !== undefined) {
      await updateSetting('difficulty', difficulty.toString());
    }
    if (mult1 !== undefined) await updateSetting('mult_1', mult1.toFixed(2));
    if (mult2 !== undefined) await updateSetting('mult_2', mult2.toFixed(2));
    if (mult3 !== undefined) await updateSetting('mult_3', mult3.toFixed(2));
    if (mult4 !== undefined) await updateSetting('mult_4', mult4.toFixed(2));

    const settings = await getAllSettings();
    res.json({ settings });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al actualizar la configuración' });
  }
});

// GET /api/admin/stats
adminRouter.get('/stats', authMiddleware, adminMiddleware, async (_req: Request, res: Response) => {
  try {
    const dbStats = await getSiteStats();
    const liveStats = getActiveStats();
    res.json({ ...dbStats, ...liveStats });
  } catch (error: any) {
    res.status(500).json({ error: 'Error al obtener las estadísticas' });
  }
});
