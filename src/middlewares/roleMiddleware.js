const { AppError } = require('../utils/errorHandler');

const roleMiddleware = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new AppError('User not authenticated', 401));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new AppError('Insufficient permissions', 403));
        }

        next();
    };
};

module.exports = roleMiddleware;
