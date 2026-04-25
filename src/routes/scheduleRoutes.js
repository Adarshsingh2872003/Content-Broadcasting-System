const express = require('express');
const {
    getLiveContent,
    getTeacherSchedule,
    getSubjectSchedule,
} = require('../controllers/scheduleController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Public endpoint - students access this (no auth required)
router.get('/live/:teacherId', getLiveContent);

// Protected endpoints
router.get('/my-schedule', authMiddleware, getTeacherSchedule);
router.get('/subject/:subjectId', getSubjectSchedule);

module.exports = router;
