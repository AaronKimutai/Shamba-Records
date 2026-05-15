const {createField, assignFieldAgent, updateFieldDetails, viewAllFields, monitorFieldUpdates, viewAssignedFields} = require('../controllers/fieldController');
const authMiddleware = require('../middleware/authMiddleware');
const express = require('express');
const router = express.Router();
const {validateFieldCreation, validateUpdateFieldByFieldAgent} = require('../middleware/expressValidator');
// Create a new field
router.post('/', authMiddleware, validateFieldCreation, createField);
// Assign a field agent to a field
router.put('/:id/assign', authMiddleware, assignFieldAgent);
// Update field details
router.put('/:id', authMiddleware, validateUpdateFieldByFieldAgent, updateFieldDetails);
// View all fields
router.get('/', authMiddleware, viewAllFields);
// Monitor field updates
router.get('/monitor', authMiddleware, monitorFieldUpdates);
// see assigned fields
router.get('/assigned', authMiddleware, viewAssignedFields);

module.exports = router;