const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { 
  validateAppointment, 
  validateAppointmentUpdate, 
  validateId,
  validatePatientId,
  validateAppointmentFilters 
} = require('../middleware/validators');

// All routes require authentication
router.use(authenticateToken);

// Get all appointments
router.get('/', validateAppointmentFilters, appointmentController.getAllAppointments);

// Get patient history
router.get('/patient/:patientId/history', 
  validatePatientId, 
  validateAppointmentFilters, 
  appointmentController.getPatientHistory
);

// Get appointment by ID
router.get('/:id', validateId, appointmentController.getAppointmentById);

// Create appointment
router.post('/', 
  authorizeRoles('admin', 'receptionist', 'doctor'), 
  validateAppointment, 
  appointmentController.createAppointment
);

// Update appointment
router.put('/:id', 
  authorizeRoles('admin', 'receptionist', 'doctor'), 
  validateId, 
  validateAppointmentUpdate, 
  appointmentController.updateAppointment
);

// Delete appointment (only admin)
router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  appointmentController.deleteAppointment
);

module.exports = router;

