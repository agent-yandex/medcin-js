const { Patient } = require('../models');
const { Op } = require('sequelize');

// Get all patients
const getAllPatients = async (req, res, next) => {
  try {
    const { search, gender, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { email: { [Op.iLike]: `%${search}%` } },
        { insurancePolicy: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (gender) {
      where.gender = gender;
    }

    const { count, rows } = await Patient.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        patients: rows,
        pagination: {
          total: count,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get patient by ID
const getPatientById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Пациент не найден'
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Create patient
const createPatient = async (req, res, next) => {
  try {
    const { firstName, lastName, middleName, dateOfBirth, gender, email, insurancePolicy } = req.body;

    const patient = await Patient.create({
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      email,
      insurancePolicy
    });

    res.status(201).json({
      success: true,
      message: 'Пациент успешно создан',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Update patient
const updatePatient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, dateOfBirth, gender, email, insurancePolicy } = req.body;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Пациент не найден'
      });
    }

    await patient.update({
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      gender,
      email,
      insurancePolicy
    });

    res.json({
      success: true,
      message: 'Пациент успешно обновлён',
      data: patient
    });
  } catch (error) {
    next(error);
  }
};

// Delete patient
const deletePatient = async (req, res, next) => {
  try {
    const { id } = req.params;

    const patient = await Patient.findByPk(id);

    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Пациент не найден'
      });
    }

    await patient.destroy();

    res.json({
      success: true,
      message: 'Пациент успешно удалён'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllPatients,
  getPatientById,
  createPatient,
  updatePatient,
  deletePatient
};

