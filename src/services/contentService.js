const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const { AppError } = require('../utils/errorHandler');
const { validateContentUpload } = require('../utils/validators');

class UploadService {
    static validateFileType(filename) {
        const allowedFormats = (process.env.ALLOWED_FORMATS || 'jpg,jpeg,png,gif').split(',');
        const fileExt = path.extname(filename).toLowerCase().substring(1);
        return allowedFormats.includes(fileExt);
    }

    static validateFileSize(fileSize) {
        const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760');
        return fileSize <= maxSize;
    }

    static getFileInfo(file) {
        return {
            filename: file.filename,
            path: file.path,
            mimetype: file.mimetype,
            size: file.size,
            originalName: file.originalname,
        };
    }
}

class ContentService {
    static async uploadContent(title, description, subject_id, file, uploaded_by, start_time, end_time, rotation_duration) {
        const { error } = validateContentUpload({
            title,
            description,
            subject_id,
            start_time,
            end_time,
            rotation_duration,
        });

        if (error) {
            throw new AppError(error.details[0].message, 400);
        }

        if (!file) {
            throw new AppError('File is required', 400);
        }

        // Validate file type
        if (!UploadService.validateFileType(file.originalname)) {
            fs.unlinkSync(file.path);
            throw new AppError('Invalid file format. Allowed: jpg, jpeg, png, gif', 400);
        }

        // Validate file size
        if (!UploadService.validateFileSize(file.size)) {
            fs.unlinkSync(file.path);
            throw new AppError(`File size exceeds limit of ${process.env.MAX_FILE_SIZE} bytes`, 400);
        }

        // Verify subject exists
        const subjectCheck = await pool.query('SELECT id FROM subjects WHERE id = $1', [subject_id]);
        if (subjectCheck.rows.length === 0) {
            fs.unlinkSync(file.path);
            throw new AppError('Subject does not exist', 400);
        }

        try {
            const fileInfo = UploadService.getFileInfo(file);
            const file_path = fileInfo.path.replace(/\\/g, '/');
            const file_type = path.extname(fileInfo.originalName).toLowerCase().substring(1);

            const result = await pool.query(
                `INSERT INTO contents (title, description, subject_id, file_path, file_type, file_size, uploaded_by, status, start_time, end_time) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
                 RETURNING id, title, subject_id, status, created_at`,
                [title, description || null, subject_id, file_path, file_type, file.size, uploaded_by, 'pending', start_time, end_time]
            );

            const content = result.rows[0];

            // If rotation_duration provided, create schedule entry
            if (rotation_duration) {
                const slotResult = await pool.query(
                    'SELECT id FROM content_slots WHERE subject_id = $1 LIMIT 1',
                    [subject_id]
                );

                if (slotResult.rows.length > 0) {
                    const slotId = slotResult.rows[0].id;

                    // Get next rotation order
                    const orderResult = await pool.query(
                        'SELECT MAX(rotation_order) as max_order FROM content_schedule WHERE slot_id = $1',
                        [slotId]
                    );

                    const nextOrder = (orderResult.rows[0].max_order || 0) + 1;

                    await pool.query(
                        'INSERT INTO content_schedule (content_id, slot_id, rotation_order, duration) VALUES ($1, $2, $3, $4)',
                        [content.id, slotId, nextOrder, rotation_duration]
                    );
                }
            }

            return content;
        } catch (error) {
            fs.unlinkSync(file.path);
            if (error instanceof AppError) throw error;
            throw new AppError('Error uploading content: ' + error.message, 500);
        }
    }

    static async getContentById(contentId) {
        try {
            const result = await pool.query(
                `SELECT c.*, u.name as uploaded_by_name, s.name as subject_name, u2.name as approved_by_name
                 FROM contents c
                 LEFT JOIN users u ON c.uploaded_by = u.id
                 LEFT JOIN subjects s ON c.subject_id = s.id
                 LEFT JOIN users u2 ON c.approved_by = u2.id
                 WHERE c.id = $1`,
                [contentId]
            );

            if (result.rows.length === 0) {
                throw new AppError('Content not found', 404);
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Database error: ' + error.message, 500);
        }
    }

    static async getTeacherContents(uploadedBy) {
        try {
            const result = await pool.query(
                `SELECT c.*, s.name as subject_name
                 FROM contents c
                 LEFT JOIN subjects s ON c.subject_id = s.id
                 WHERE c.uploaded_by = $1
                 ORDER BY c.created_at DESC`,
                [uploadedBy]
            );

            return result.rows;
        } catch (error) {
            throw new AppError('Database error: ' + error.message, 500);
        }
    }

    static async getAllContents(filters = {}) {
        try {
            let query = `SELECT c.*, u.name as uploaded_by_name, s.name as subject_name
                         FROM contents c
                         LEFT JOIN users u ON c.uploaded_by = u.id
                         LEFT JOIN subjects s ON c.subject_id = s.id
                         WHERE 1=1`;
            const params = [];

            if (filters.status) {
                query += ` AND c.status = $${params.length + 1}`;
                params.push(filters.status);
            }

            if (filters.subject_id) {
                query += ` AND c.subject_id = $${params.length + 1}`;
                params.push(filters.subject_id);
            }

            query += ` ORDER BY c.created_at DESC`;

            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            throw new AppError('Database error: ' + error.message, 500);
        }
    }

    static async deleteContent(contentId, userId, userRole) {
        try {
            const content = await this.getContentById(contentId);

            // Only teacher who uploaded or principal can delete
            if (userRole !== 'principal' && content.uploaded_by !== userId) {
                throw new AppError('Unauthorized to delete this content', 403);
            }

            // Delete file
            if (content.file_path && fs.existsSync(content.file_path)) {
                fs.unlinkSync(content.file_path);
            }

            // Delete from database
            await pool.query('DELETE FROM contents WHERE id = $1', [contentId]);

            return { message: 'Content deleted successfully' };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Database error: ' + error.message, 500);
        }
    }
}

module.exports = { ContentService, UploadService };
