const AuthService = require('../services/authService');
const { AppError, handleError } = require('../utils/errorHandler');

const register = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        const user = await AuthService.register(name, email, password, role);

        res.status(201).json({
            status: 'success',
            data: {
                user,
            },
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await AuthService.login(email, password);

        res.status(200).json({
            status: 'success',
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
};
