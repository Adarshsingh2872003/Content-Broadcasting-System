const express = require('express');
const {
    approveContent,
    rejectContent,
    getPendingContents,
    getAllContentsForPrincipal,
} = require('../controllers/approvalController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Only principal can access these routes
router.post('/approve', authMiddleware, roleMiddleware(['principal']), approveContent);
router.post('/reject', authMiddleware, roleMiddleware(['principal']), rejectContent);
router.get('/pending', authMiddleware, roleMiddleware(['principal']), getPendingContents);
router.get('/', authMiddleware, roleMiddleware(['principal']), getAllContentsForPrincipal);

module.exports = router;
