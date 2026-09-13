import { Request, Response } from 'express';
import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { db, UserRow } from '../db/db.js';
import { config } from '../config/index.js';
import { AuthenticatedRequest } from '../middleware/auth.js';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

export class AuthController {
  public static async register(req: Request, res: Response): Promise<void> {
    const parse = registerSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const { email, password } = parse.data;

    // Check if user already exists
    const existing = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      res.status(400).json({ error: 'Conflict', message: 'User with this email already exists' });
      return;
    }

    // Hash password with Argon2id
    const password_hash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4
    });

    const userId = `usr-${uuidv4()}`;
    const newUser: UserRow = {
      id: userId,
      email: email.toLowerCase(),
      password_hash,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    db.users.set(userId, newUser);

    // Assign default User role
    const userRole = Array.from(db.roles.values()).find(r => r.name === 'User');
    if (userRole) {
      db.userRoles.push({ user_id: userId, role_id: userRole.id });
    }

    res.status(201).json({
      message: 'Account registered successfully',
      user: { id: newUser.id, email: newUser.email, createdAt: newUser.created_at }
    });
  }

  public static async login(req: Request, res: Response): Promise<void> {
    const parse = loginSchema.safeParse(req.body);
    if (!parse.success) {
      res.status(400).json({ error: 'Validation Error', details: parse.error.format() });
      return;
    }

    const { email, password } = parse.data;
    const user = Array.from(db.users.values()).find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user || !user.is_active) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
      return;
    }

    const validPassword = await argon2.verify(user.password_hash, password);
    if (!validPassword) {
      res.status(401).json({ error: 'Unauthorized', message: 'Invalid email or password' });
      return;
    }

    const userRoles = db.userRoles
      .filter(ur => ur.user_id === user.id)
      .map(ur => db.roles.get(ur.role_id)?.name || '')
      .filter(Boolean);

    const accessToken = jwt.sign(
      { userId: user.id, email: user.email, roles: userRoles },
      config.jwtSecret,
      { expiresIn: config.jwtAccessExpiry }
    );

    const refreshToken = jwt.sign(
      { userId: user.id, sessionToken: uuidv4() },
      config.jwtRefreshSecret,
      { expiresIn: config.jwtRefreshExpiry }
    );

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        roles: userRoles.length > 0 ? userRoles : ['User']
      }
    });
  }

  public static async me(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const user = db.users.get(req.user.id);
    if (!user) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }
    res.json({
      user: {
        id: user.id,
        email: user.email,
        roles: req.user.roles,
        createdAt: user.created_at
      }
    });
  }
}
