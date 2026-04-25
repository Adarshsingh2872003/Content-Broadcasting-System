const pool = require('../config/database');
const { AppError } = require('../utils/errorHandler');

class ScheduleService {
    /**
     * Get currently active content for a specific teacher and subject
     * Implements rotation logic based on time duration and current timestamp
     */
    static async getActiveContent(teacherId, subjectId = null) {
        try {
            // Get all approved content for this teacher that's within time window
            let query = `
                SELECT c.*, s.name as subject_name, 
                       COALESCE(cs.duration, 5) as duration,
                       COALESCE(cs.rotation_order, 0) as rotation_order
                FROM contents c
                LEFT JOIN subjects s ON c.subject_id = s.id
                LEFT JOIN content_schedule cs ON c.id = cs.content_id
                WHERE c.uploaded_by = $1 
                AND c.status = 'approved'
                AND c.start_time <= NOW()
                AND c.end_time >= NOW()
            `;

            const params = [teacherId];

            if (subjectId) {
                query += ` AND c.subject_id = $${params.length + 1}`;
                params.push(subjectId);
            }

            query += ` ORDER BY c.subject_id, cs.rotation_order ASC`;

            const result = await pool.query(query, params);

            if (result.rows.length === 0) {
                return null; // No content available
            }

            // Group content by subject for independent rotation
            const contentBySubject = {};
            result.rows.forEach(row => {
                const subj = row.subject_id || 'default';
                if (!contentBySubject[subj]) {
                    contentBySubject[subj] = [];
                }
                contentBySubject[subj].push(row);
            });

            // Calculate active content using rotation logic
            const now = new Date();
            const activeContent = this.calculateActiveContent(contentBySubject, now);

            return activeContent;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError('Database error: ' + error.message, 500);
        }
    }

    /**
     * Core rotation algorithm
     * Determines which content should be displayed based on:
     * 1. Content's start_time and end_time
     * 2. Rotation duration (how long each content is shown)
     * 3. Current timestamp
     */
    static calculateActiveContent(contentBySubject, now) {
        const result = [];

        for (const subjectId in contentBySubject) {
            const contents = contentBySubject[subjectId];

            if (contents.length === 0) continue;

            // Calculate total cycle time for this subject
            const totalCycleDuration = contents.reduce((sum, c) => sum + (c.duration || 5), 0) * 60 * 1000; // Convert to milliseconds

            // Find the earliest start_time for this subject's content
            const earliestStart = new Date(Math.min(...contents.map(c => new Date(c.start_time).getTime())));

            // Time elapsed since cycle start
            const timeElapsed = now - earliestStart;
            const positionInCycle = timeElapsed % totalCycleDuration;

            // Find which content should be active
            let accumulatedTime = 0;
            let activeContent = contents[0]; // Default to first if calculation fails

            for (const content of contents) {
                const contentDuration = (content.duration || 5) * 60 * 1000; // Convert to milliseconds
                if (positionInCycle < accumulatedTime + contentDuration) {
                    activeContent = content;
                    break;
                }
                accumulatedTime += contentDuration;
            }

            result.push(activeContent);
        }

        // Return first active content (or any if multiple subjects)
        return result.length > 0 ? result[0] : null;
    }

    /**
     * Get content schedule for a specific subject
     */
    static async getSubjectSchedule(subjectId) {
        try {
            const result = await pool.query(
                `SELECT cs.*, c.title, c.status, c.duration as content_duration
                 FROM content_schedule cs
                 JOIN contents c ON cs.content_id = c.id
                 WHERE cs.slot_id IN (SELECT id FROM content_slots WHERE subject_id = $1)
                 ORDER BY cs.rotation_order ASC`,
                [subjectId]
            );

            return result.rows;
        } catch (error) {
            throw new AppError('Database error: ' + error.message, 500);
        }
    }

    /**
     * Get all approved and scheduled content for a teacher
     */
    static async getTeacherSchedule(teacherId) {
        try {
            const result = await pool.query(
                `SELECT c.id, c.title, c.subject_id, s.name as subject_name, c.status,
                        c.start_time, c.end_time, c.created_at,
                        COALESCE(cs.duration, 5) as duration
                 FROM contents c
                 LEFT JOIN subjects s ON c.subject_id = s.id
                 LEFT JOIN content_schedule cs ON c.id = cs.content_id
                 WHERE c.uploaded_by = $1 AND c.status = 'approved'
                 ORDER BY c.subject_id, cs.rotation_order ASC`,
                [teacherId]
            );

            return result.rows;
        } catch (error) {
            throw new AppError('Database error: ' + error.message, 500);
        }
    }
}

module.exports = ScheduleService;
