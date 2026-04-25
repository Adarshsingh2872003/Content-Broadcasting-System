const ScheduleService = require('../services/scheduleService');
const { AppError } = require('../utils/errorHandler');

/**
 * PUBLIC API: Get currently active content for a specific teacher
 * This is the main endpoint that students use to fetch live content
 */
const getLiveContent = async (req, res, next) => {
    try {
        const { teacherId } = req.params;
        const { subject_id } = req.query;

        // Validate teacherId
        if (!teacherId || isNaN(teacherId)) {
            throw new AppError('Invalid teacher ID', 400);
        }

        // Get active content using rotation logic
        const activeContent = await ScheduleService.getActiveContent(
            parseInt(teacherId),
            subject_id ? parseInt(subject_id) : null
        );

        // Edge Case 1 & 2: No content available
        if (!activeContent) {
            return res.status(200).json({
                status: 'success',
                message: 'No content available',
                data: null,
            });
        }

        res.status(200).json({
            status: 'success',
            data: {
                content: activeContent,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get teacher's schedule (for internal use, requires auth)
 */
const getTeacherSchedule = async (req, res, next) => {
    try {
        const schedule = await ScheduleService.getTeacherSchedule(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                total: schedule.length,
                schedule,
            },
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get subject-specific schedule
 */
const getSubjectSchedule = async (req, res, next) => {
    try {
        const { subjectId } = req.params;

        if (!subjectId || isNaN(subjectId)) {
            throw new AppError('Invalid subject ID', 400);
        }

        const schedule = await ScheduleService.getSubjectSchedule(parseInt(subjectId));

        res.status(200).json({
            status: 'success',
            data: {
                total: schedule.length,
                schedule,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLiveContent,
    getTeacherSchedule,
    getSubjectSchedule,
};
