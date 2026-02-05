import { Router, Request, Response } from 'express';
import crypto from 'crypto';

const router = Router();

// Admin credentials from environment variables
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'securepassword123';


const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Simple token storage (in production, use Redis or database)
const tokenStore = new Map<string, { username: string; expiresAt: number }>();

// Login endpoint
router.post('/login', (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    // Check credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    // Store token
    tokenStore.set(token, { username, expiresAt });

    res.json({
      success: true,
      token,
      expiresAt,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token endpoint
router.get('/verify', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ authenticated: false });
    }

    const session = tokenStore.get(token);

    if (!session) {
      return res.status(401).json({ authenticated: false });
    }

    if (Date.now() > session.expiresAt) {
      tokenStore.delete(token);
      return res.status(401).json({ authenticated: false });
    }

    res.json({
      authenticated: true,
      username: session.username,
    });
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ authenticated: false });
  }
});

// Logout endpoint
router.post('/logout', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace('Bearer ', '');

    if (token) {
      tokenStore.delete(token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

export default router;
