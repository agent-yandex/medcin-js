const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validatePatient, validateId } = require('../middleware/validators');

// All routes require authentication
router.use(authenticateToken);

// Get all patients
router.get('/', patientController.getAllPatients);

// Get patient by ID
router.get('/:id', validateId, patientController.getPatientById);

// Create patient (only admin and receptionist)
router.post('/', 
  authorizeRoles('admin', 'receptionist'), 
  validatePatient, 
  patientController.createPatient
);

// Update patient (only admin and receptionist)
router.put('/:id', 
  authorizeRoles('admin', 'receptionist'), 
  validateId, 
  validatePatient, 
  patientController.updatePatient
);

// Delete patient (only admin)
router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  patientController.deletePatient
);

module.exports = router;

