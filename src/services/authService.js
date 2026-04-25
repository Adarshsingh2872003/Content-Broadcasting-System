const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const { AppError } = require('../utils/errorHandler');
const { validateRegister, validateLogin } = require('../utils/validators');

class AuthService {
    static async register(name, email, password, role) {
        const { error } = validateRegister({ name, email, password, role });
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        try {
            // Check if email already exists
            const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
            if (userExists.rows.length > 0) {
                throw new AppError('Email already registered', 400);
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const password_hash = await bcrypt.hash(password, salt);

            // Create user
            const result = await pool.query(
                'INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, created_at',
                [name, email, password_hash, role]
            );

            return result.rows[0];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Database error: ' + error.message, 500);
        }
    }

    static async login(email, password) {
        const { error } = validateLogin({ email, password });
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        try {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

            if (result.rows.length === 0) {
                throw new AppError('Invalid email or password', 401);
            }

            const user = result.rows[0];
            const isPasswordValid = await bcrypt.compare(password, user.password_hash);

            if (!isPasswordValid) {
                throw new AppError('Invalid email or password', 401);
            }

            const token = jwt.sign(
                { id: user.id, email: user.email, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRE }
            );

            return {
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Database error: ' + error.message, 500);
        }
    }
}

module.exports = AuthService;
