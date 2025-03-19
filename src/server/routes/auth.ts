import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { APIError } from '../middleware/errorHandler';
import { logger } from '../index';

const router = Router();

// Validation schemas
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

// In-memory user store (replace with database in production)
const users = new Map<string, {
  id: string;
  email: string;
  password: string;
}>();

// Registration validation middleware
const validateRegistration = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 })
];

// Registration endpoint
router.post('/register', validateRegistration, async (req, res, next) => {
  try {
    // Check validation results
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new APIError(400, 'Invalid input');
    }

    // Validate with Zod
    const { email, password } = userSchema.parse(req.body);

    // Check if user exists
    if (users.has(email)) {
      throw new APIError(409, 'User already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const userId = `user_${Date.now()}`;
    users.set(email, {
      id: userId,
      email,
      password: hashedPassword
    });

    logger.info('User registered:', { email });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Login endpoint
router.post('/login', async (req, res, next) => {
  try {
    // Validate with Zod
    const { email, password } = userSchema.parse(req.body);

    // Get user
    const user = users.get(email);
    if (!user) {
      throw new APIError(401, 'Invalid credentials');
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new APIError(401, 'Invalid credentials');
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-change-me',
      { expiresIn: '24h' }
    );

    logger.info('User logged in:', { email });

    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
});

export const authRouter = router; 