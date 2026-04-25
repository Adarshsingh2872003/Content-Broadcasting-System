const pool = require('../config/database');
const { AppError } = require('../utils/errorHandler');
const { validateApproval, validateRejection } = require('../utils/validators');

const approveContent = async (req, res, next) => {
    try {
        const { content_id } = req.body;

        const { error } = validateApproval({ content_id });
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        // Get content
        const contentResult = await pool.query('SELECT * FROM contents WHERE id = $1', [content_id]);
        if (contentResult.rows.length === 0) {
            throw new AppError('Content not found', 404);
        }

        const content = contentResult.rows[0];
        if (content.status === 'approved') {
            throw new AppError('Content is already approved', 400);
        }

        // Update content status
        const result = await pool.query(
            `UPDATE contents 
             SET status = 'approved', approved_by = $1, approved_at = NOW()
             WHERE id = $2
             RETURNING id, title, status, approved_at`,
            [req.user.id, content_id]
        );

        res.status(200).json({
            status: 'success',
            message: 'Content approved successfully',
            data: {
                content: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};

const rejectContent = async (req, res, next) => {
    try {
        const { content_id, rejection_reason } = req.body;

        const { error } = validateRejection({ content_id, rejection_reason });
        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        // Get content
        const contentResult = await pool.query('SELECT * FROM contents WHERE id = $1', [content_id]);
        if (contentResult.rows.length === 0) {
            throw new AppError('Content not found', 404);
        }

        const content = contentResult.rows[0];
        if (content.status === 'rejected') {
            throw new AppError('Content is already rejected', 400);
        }

        // Update content status
        const result = await pool.query(
            `UPDATE contents 
             SET status = 'rejected', rejection_reason = $1, approved_by = $2, approved_at = NOW()
             WHERE id = $3
             RETURNING id, title, status, rejection_reason, approved_at`,
            [rejection_reason, req.user.id, content_id]
        );

        res.status(200).json({
            status: 'success',
            message: 'Content rejected successfully',
            data: {
                content: result.rows[0],
            },
        });
    } catch (error) {
        next(error);
    }
};

const getPendingContents = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT c.*, u.name as uploaded_by_name, s.name as subject_name
             FROM contents c
             LEFT JOIN users u ON c.uploaded_by = u.id
             LEFT JOIN subjects s ON c.subject_id = s.id
             WHERE c.status = 'pending'
             ORDER BY c.created_at ASC`
        );

        res.status(200).json({
            status: 'success',
            data: {
                total: result.rows.length,
                pending_contents: result.rows,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getAllContentsForPrincipal = async (req, res, next) => {
    try {
        const { status } = req.query;

        let query = `SELECT c.*, u.name as uploaded_by_name, s.name as subject_name
                     FROM contents c
                     LEFT JOIN users u ON c.uploaded_by = u.id
                     LEFT JOIN subjects s ON c.subject_id = s.id`;

        const params = [];

        if (status) {
            query += ` WHERE c.status = $1`;
            params.push(status);
        }

        query += ` ORDER BY c.created_at DESC`;

        const result = await pool.query(query, params);

        res.status(200).json({
            status: 'success',
            data: {
                total: result.rows.length,
                contents: result.rows,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    approveContent,
    rejectContent,
    getPendingContents,
    getAllContentsForPrincipal,
};
