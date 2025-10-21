const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDoctor, validateId } = require('../middleware/validators');

// All routes require authentication
router.use(authenticateToken);

// Get all doctors
router.get('/', doctorController.getAllDoctors);

// Get doctor by ID
router.get('/:id', validateId, doctorController.getDoctorById);

// Create doctor (only admin)
router.post('/', 
  authorizeRoles('admin'), 
  validateDoctor, 
  doctorController.createDoctor
);

// Update doctor (only admin)
router.put('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  validateDoctor, 
  doctorController.updateDoctor
);

// Delete doctor (only admin)
router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  doctorController.deleteDoctor
);

module.exports = router;
