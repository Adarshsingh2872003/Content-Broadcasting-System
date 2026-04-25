const Joi = require('joi');

const validateRegister = (data) => {
    const schema = Joi.object({
        name: Joi.string().required().min(2).max(100),
        email: Joi.string().email().required(),
        password: Joi.string().required().min(6),
        role: Joi.string().required().valid('principal', 'teacher'),
    });
    return schema.validate(data);
};

const validateLogin = (data) => {
    const schema = Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required(),
    });
    return schema.validate(data);
};

const validateContentUpload = (data) => {
    const schema = Joi.object({
        title: Joi.string().required().max(255),
        description: Joi.string().max(1000),
        subject_id: Joi.number().required(),
        start_time: Joi.date().required(),
        end_time: Joi.date().required(),
        rotation_duration: Joi.number().min(1),
    });
    return schema.validate(data);
};

const validateApproval = (data) => {
    const schema = Joi.object({
        content_id: Joi.number().required(),
    });
    return schema.validate(data);
};

const validateRejection = (data) => {
    const schema = Joi.object({
        content_id: Joi.number().required(),
        rejection_reason: Joi.string().required().max(500),
    });
    return schema.validate(data);
};

module.exports = {
    validateRegister,
    validateLogin,
    validateContentUpload,
    validateApproval,
    validateRejection,
};
