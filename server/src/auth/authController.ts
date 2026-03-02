import { Router, Request, Response } from 'express';
import { registerUser, loginUser, refreshAccessToken, getUserById } from './authService';
import { authMiddleware } from '../middleware/authMiddleware';
import { authLimiter } from '../middleware/rateLimiter';
import { validate, registerSchema, loginSchema, refreshSchema } from '../middleware/validate';

export const authRouter = Router();

// POST /api/auth/register
authRouter.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;
    const result = await registerUser(username, email, password);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login
authRouter.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// POST /api/auth/refresh
authRouter.post('/refresh', validate(refreshSchema), async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);
    res.json(result);
  } catch (error: any) {
    res.status(401).json({ error: error.message });
  }
});

// GET /api/auth/me
authRouter.get('/me', authMiddleware, async (req: Request, res: Response) => {
  try {
    const user = await getUserById((req as any).userId);
    res.json({ user });
  } catch (error: any) {
    res.status(404).json({ error: error.message });
  }
});
