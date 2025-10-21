const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  patientId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'patient_id',
    references: {
      model: 'patients',
      key: 'id'
    }
  },
  doctorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'doctor_id',
    references: {
      model: 'doctors',
      key: 'id'
    }
  },
  appointmentDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'appointment_date'
  },
  status: {
    type: DataTypes.ENUM('scheduled', 'completed', 'cancelled'),
    allowNull: false,
    defaultValue: 'scheduled'
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Причина обращения'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: 'Заметки врача после приёма'
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['patient_id']
    },
    {
      fields: ['doctor_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['appointment_date']
    }
  ]
});

module.exports = Appointment;

