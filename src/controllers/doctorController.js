const { Doctor } = require('../models');
const { Op } = require('sequelize');

// Get all doctors
const getAllDoctors = async (req, res, next) => {
  try {
    const { search, specialization, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (search) {
      where[Op.or] = [
        { firstName: { [Op.iLike]: `%${search}%` } },
        { lastName: { [Op.iLike]: `%${search}%` } },
        { contactEmail: { [Op.iLike]: `%${search}%` } }
      ];
    }
    
    if (specialization) {
      where.specialization = { [Op.iLike]: `%${specialization}%` };
    }

    const { count, rows } = await Doctor.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        doctors: rows,
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

// Get doctor by ID
const getDoctorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Врач не найден'
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// Create doctor
const createDoctor = async (req, res, next) => {
  try {
    const { firstName, lastName, middleName, specialization, contactPhone, contactEmail, schedule } = req.body;

    const doctor = await Doctor.create({
      firstName,
      lastName,
      middleName,
      specialization,
      contactPhone,
      contactEmail,
      schedule
    });

    res.status(201).json({
      success: true,
      message: 'Врач успешно создан',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// Update doctor
const updateDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, middleName, specialization, contactPhone, contactEmail, schedule } = req.body;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Врач не найден'
      });
    }

    await doctor.update({
      firstName,
      lastName,
      middleName,
      specialization,
      contactPhone,
      contactEmail,
      schedule
    });

    res.json({
      success: true,
      message: 'Врач успешно обновлён',
      data: doctor
    });
  } catch (error) {
    next(error);
  }
};

// Delete doctor
const deleteDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Врач не найден'
      });
    }

    await doctor.destroy();

    res.json({
      success: true,
      message: 'Врач успешно удалён'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor
};

