const { ContentService } = require('../services/contentService');
const { AppError } = require('../utils/errorHandler');

const uploadContent = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new AppError('File is required', 400);
        }

        const { title, description, subject_id, start_time, end_time, rotation_duration } = req.body;

        const content = await ContentService.uploadContent(
            title,
            description,
            parseInt(subject_id),
            req.file,
            req.user.id,
            start_time,
            end_time,
            rotation_duration ? parseInt(rotation_duration) : null
        );

        res.status(201).json({
            status: 'success',
            data: {
                content,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getMyContents = async (req, res, next) => {
    try {
        const contents = await ContentService.getTeacherContents(req.user.id);

        res.status(200).json({
            status: 'success',
            data: {
                total: contents.length,
                contents,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getContentById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const content = await ContentService.getContentById(id);

        res.status(200).json({
            status: 'success',
            data: {
                content,
            },
        });
    } catch (error) {
        next(error);
    }
};

const getAllContents = async (req, res, next) => {
    try {
        const { status, subject_id } = req.query;

        const filters = {};
        if (status) filters.status = status;
        if (subject_id) filters.subject_id = subject_id;

        const contents = await ContentService.getAllContents(filters);

        res.status(200).json({
            status: 'success',
            data: {
                total: contents.length,
                contents,
            },
        });
    } catch (error) {
        next(error);
    }
};

const deleteContent = async (req, res, next) => {
    try {
        const { id } = req.params;

        const result = await ContentService.deleteContent(id, req.user.id, req.user.role);

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    uploadContent,
    getMyContents,
    getContentById,
    getAllContents,
    deleteContent,
};
