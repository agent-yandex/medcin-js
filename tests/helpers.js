const jwt = require('jsonwebtoken');
const { User, Patient, Doctor, Appointment } = require('../src/models');

/**
 * Create a test user and return auth token
 */
const createTestUser = async (userData = {}) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const defaultData = {
    username: `testuser_${timestamp}_${random}`,
    email: `test_${timestamp}_${random}@example.com`,
    password: 'password123',
    role: 'receptionist',
    ...userData
  };

  const user = await User.create(defaultData);
  
  const token = jwt.sign(
    { userId: user.id, username: user.username, role: user.role },
    process.env.JWT_SECRET || 'test-secret-key',
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );

  return { user, token };
};

/**
 * Create a test patient
 */
const createTestPatient = async (patientData = {}) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const defaultData = {
    firstName: 'Иван',
    lastName: 'Петров',
    middleName: 'Сергеевич',
    dateOfBirth: '1990-05-15',
    gender: 'male',
    email: `ivan.petrov_${timestamp}_${random}@example.com`,
    insurancePolicy: `${timestamp}${random}`.slice(0, 16).padStart(16, '0'),
    ...patientData
  };

  return await Patient.create(defaultData);
};

/**
 * Create a test doctor
 */
const createTestDoctor = async (doctorData = {}) => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  
  const defaultData = {
    firstName: 'Анна',
    lastName: 'Смирнова',
    middleName: 'Владимировна',
    specialization: 'Терапевт',
    contactPhone: `+7900${timestamp.toString().slice(-7)}`,
    contactEmail: `a.smirnova_${timestamp}_${random}@hospital.com`,
    schedule: {
      monday: '9:00-17:00',
      tuesday: '9:00-17:00',
      wednesday: '9:00-17:00',
      thursday: '9:00-17:00',
      friday: '9:00-15:00'
    },
    ...doctorData
  };

  return await Doctor.create(defaultData);
};

/**
 * Create a test appointment
 */
const createTestAppointment = async (appointmentData = {}) => {
  // Create patient and doctor if not provided
  let patient, doctor;
  
  if (appointmentData.patientId) {
    patient = await Patient.findByPk(appointmentData.patientId);
  } else {
    patient = await createTestPatient();
  }
  
  if (appointmentData.doctorId) {
    doctor = await Doctor.findByPk(appointmentData.doctorId);
  } else {
    doctor = await createTestDoctor();
  }

  const defaultData = {
    patientId: patient.id,
    doctorId: doctor.id,
    appointmentDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    status: 'scheduled',
    reason: 'Общее обследование',
    ...appointmentData,
    patientId: patient.id,
    doctorId: doctor.id
  };

  return await Appointment.create(defaultData);
};

module.exports = {
  createTestUser,
  createTestPatient,
  createTestDoctor,
  createTestAppointment
};

