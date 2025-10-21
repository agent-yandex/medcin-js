const sequelize = require('../config/database');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Appointment = require('./Appointment');
const User = require('./User');

// Definition of relationships between models
Patient.hasMany(Appointment, {
  foreignKey: 'patient_id',
  as: 'appointments'
});

Appointment.belongsTo(Patient, {
  foreignKey: 'patient_id',
  as: 'patient'
});

Doctor.hasMany(Appointment, {
  foreignKey: 'doctor_id',
  as: 'appointments'
});

Appointment.belongsTo(Doctor, {
  foreignKey: 'doctor_id',
  as: 'doctor'
});

module.exports = {
  sequelize,
  Patient,
  Doctor,
  Appointment,
  User
};

