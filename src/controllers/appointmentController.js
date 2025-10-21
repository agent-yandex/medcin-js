const { Appointment, Patient, Doctor } = require('../models');
const { Op } = require('sequelize');

// Get all appointments
const getAllAppointments = async (req, res, next) => {
  try {
    const { status, doctorId, patientId, startDate, endDate, limit = 50, offset = 0 } = req.query;
    
    const where = {};
    
    if (status) {
      where.status = status;
    }
    
    if (doctorId) {
      where.doctorId = doctorId;
    }
    
    if (patientId) {
      where.patientId = patientId;
    }
    
    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.appointmentDate[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Patient,
          as: 'patient',
          attributes: ['id', 'firstName', 'lastName', 'middleName', 'email']
        },
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'middleName', 'specialization']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appointmentDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        appointments: rows,
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

// Get appointment by ID
const getAppointmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id, {
      include: [
        {
          model: Patient,
          as: 'patient'
        },
        {
          model: Doctor,
          as: 'doctor'
        }
      ]
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись на приём не найдена'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
};

// Create appointment
const createAppointment = async (req, res, next) => {
  try {
    const { patientId, doctorId, appointmentDate, status, reason, notes } = req.body;

    // Check if patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Пациент не найден'
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Врач не найден'
      });
    }

    // Check for time conflict
    const conflictingAppointment = await Appointment.findOne({
      where: {
        doctorId,
        appointmentDate: new Date(appointmentDate),
        status: { [Op.ne]: 'cancelled' }
      }
    });

    if (conflictingAppointment) {
      return res.status(409).json({
        success: false,
        message: 'Врач уже занят в это время'
      });
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate,
      status: status || 'scheduled',
      reason,
      notes
    });

    const createdAppointment = await Appointment.findByPk(appointment.id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    res.status(201).json({
      success: true,
      message: 'Запись на приём успешно создана',
      data: createdAppointment
    });
  } catch (error) {
    next(error);
  }
};

// Update appointment
const updateAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { appointmentDate, status, reason, notes } = req.body;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись на приём не найдена'
      });
    }

    // If date is updated, check for conflicts
    if (appointmentDate && appointmentDate !== appointment.appointmentDate.toISOString()) {
      const conflictingAppointment = await Appointment.findOne({
        where: {
          id: { [Op.ne]: id },
          doctorId: appointment.doctorId,
          appointmentDate: new Date(appointmentDate),
          status: { [Op.ne]: 'cancelled' }
        }
      });

      if (conflictingAppointment) {
        return res.status(409).json({
          success: false,
          message: 'Врач уже занят в это время'
        });
      }
    }

    await appointment.update({
      appointmentDate: appointmentDate || appointment.appointmentDate,
      status: status || appointment.status,
      reason: reason !== undefined ? reason : appointment.reason,
      notes: notes !== undefined ? notes : appointment.notes
    });

    const updatedAppointment = await Appointment.findByPk(id, {
      include: [
        { model: Patient, as: 'patient' },
        { model: Doctor, as: 'doctor' }
      ]
    });

    res.json({
      success: true,
      message: 'Запись на приём успешно обновлена',
      data: updatedAppointment
    });
  } catch (error) {
    next(error);
  }
};

// Delete appointment
const deleteAppointment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Запись на приём не найдена'
      });
    }

    await appointment.destroy();

    res.json({
      success: true,
      message: 'Запись на приём успешно удалена'
    });
  } catch (error) {
    next(error);
  }
};

// Get patient history
const getPatientHistory = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    const { status, startDate, endDate, limit = 50, offset = 0 } = req.query;

    // Check if patient exists
    const patient = await Patient.findByPk(patientId);
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Пациент не найден'
      });
    }

    const where = { patientId };
    
    if (status) {
      where.status = status;
    }
    
    if (startDate || endDate) {
      where.appointmentDate = {};
      if (startDate) {
        where.appointmentDate[Op.gte] = new Date(startDate);
      }
      if (endDate) {
        where.appointmentDate[Op.lte] = new Date(endDate);
      }
    }

    const { count, rows } = await Appointment.findAndCountAll({
      where,
      include: [
        {
          model: Doctor,
          as: 'doctor',
          attributes: ['id', 'firstName', 'lastName', 'middleName', 'specialization']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['appointmentDate', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          lastName: patient.lastName,
          middleName: patient.middleName
        },
        appointments: rows,
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

module.exports = {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPatientHistory
};

