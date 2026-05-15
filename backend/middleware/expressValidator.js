const { body } = require('express-validator');

const validateFieldCreation = [
    body('Name').notEmpty().withMessage('Field name is required'),
    body('cropType').notEmpty().withMessage('Crop type is required'),
    body('plantingDate').notEmpty().withMessage('Planting date is required'),
    body('currentStage').notEmpty().isIn(['planted', 'growing', 'ready', 'harvested']).withMessage('Current and valid currentstage is required'),
]

const validateUpdateFieldByFieldAgent = [
    body('notes').optional().notEmpty().withMessage('Notes are required'),
    body('currentStage').optional().customSanitizer((value)=>value.toLowerCase()).
    isIn(['planted', 'growing', 'ready', 'harvested']).withMessage('Invalid current stage')
]

const userCreationValidation = [
    body('name').
    notEmpty()
    .trim().withMessage('Name is required'),
    body('email').notEmpty().isEmail().normalizeEmail().withMessage('Valid email address is required'),
    body('password').notEmpty().isLength({min: 8}).withMessage('Password must be at least 8 characters long'),
    body('role').notEmpty().customSanitizer((value)=>value.toLowerCase()).isIn(['admin', 'field agent']).withMessage('Role is required')

]

const userUpdateValidation = [
    body('name').optional().trim(),
    body('email').optional().isEmail().normalizeEmail().withMessage('Valid email address is required'),
    body('role').optional().customSanitizer((value)=>value.toLowerCase()).isIn(['admin', 'field agent']).withMessage('Role is required')
]

module.exports = {
    validateFieldCreation,
    validateUpdateFieldByFieldAgent,
    userCreationValidation,
    userUpdateValidation
};
