const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  middleName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'middle_name'
  },
  specialization: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  contactPhone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'contact_phone'
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'contact_email',
    validate: {
      isEmail: true
    }
  },
  schedule: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    comment: 'График работы в формате JSON: {"monday": "9:00-17:00", "tuesday": "9:00-17:00", ...}'
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['specialization']
    }
  ]
});

module.exports = Doctor;

