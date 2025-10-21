const { body, param, query, validationResult } = require('express-validator');

// Middleware for handling validation results
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false,
      message: 'Ошибка валидации данных',
      errors: errors.array() 
    });
  }
  next();
};

// Validation for patients
const validatePatient = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Имя обязательно')
    .isLength({ min: 2, max: 100 }).withMessage('Имя должно быть от 2 до 100 символов'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Фамилия обязательна')
    .isLength({ min: 2, max: 100 }).withMessage('Фамилия должна быть от 2 до 100 символов'),
  body('middleName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Отчество должно быть не более 100 символов'),
  body('dateOfBirth')
    .notEmpty().withMessage('Дата рождения обязательна')
    .isDate().withMessage('Неверный формат даты'),
  body('gender')
    .notEmpty().withMessage('Пол обязателен')
    .isIn(['male', 'female', 'other']).withMessage('Пол должен быть: male, female или other'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email'),
  body('insurancePolicy')
    .trim()
    .notEmpty().withMessage('Страховой полис обязателен')
    .isLength({ min: 5, max: 50 }).withMessage('Страховой полис должен быть от 5 до 50 символов'),
  handleValidationErrors
];

// Validation for doctors
const validateDoctor = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('Имя обязательно')
    .isLength({ min: 2, max: 100 }).withMessage('Имя должно быть от 2 до 100 символов'),
  body('lastName')
    .trim()
    .notEmpty().withMessage('Фамилия обязательна')
    .isLength({ min: 2, max: 100 }).withMessage('Фамилия должна быть от 2 до 100 символов'),
  body('middleName')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Отчество должно быть не более 100 символов'),
  body('specialization')
    .trim()
    .notEmpty().withMessage('Специализация обязательна')
    .isLength({ min: 2, max: 255 }).withMessage('Специализация должна быть от 2 до 255 символов'),
  body('contactPhone')
    .optional()
    .trim()
    .isMobilePhone('any').withMessage('Неверный формат телефона'),
  body('contactEmail')
    .optional()
    .trim()
    .isEmail().withMessage('Неверный формат email'),
  body('schedule')
    .optional()
    .isObject().withMessage('График работы должен быть объектом'),
  handleValidationErrors
];

// Validation for appointment
const validateAppointment = [
  body('patientId')
    .notEmpty().withMessage('ID пациента обязателен')
    .isInt({ min: 1 }).withMessage('ID пациента должен быть положительным числом'),
  body('doctorId')
    .notEmpty().withMessage('ID врача обязателен')
    .isInt({ min: 1 }).withMessage('ID врача должен быть положительным числом'),
  body('appointmentDate')
    .notEmpty().withMessage('Дата и время приёма обязательны')
    .isISO8601().withMessage('Неверный формат даты и времени'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled']).withMessage('Статус должен быть: scheduled, completed или cancelled'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Причина обращения должна быть не более 1000 символов'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Заметки должны быть не более 2000 символов'),
  handleValidationErrors
];

// Validation for updating appointment
const validateAppointmentUpdate = [
  body('appointmentDate')
    .optional()
    .isISO8601().withMessage('Неверный формат даты и времени'),
  body('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled']).withMessage('Статус должен быть: scheduled, completed или cancelled'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 }).withMessage('Причина обращения должна быть не более 1000 символов'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 2000 }).withMessage('Заметки должны быть не более 2000 символов'),
  handleValidationErrors
];

// Validation for ID in parameters
const validateId = [
  param('id')
    .isInt({ min: 1 }).withMessage('ID должен быть положительным числом'),
  handleValidationErrors
];

// Validation for patientId in parameters
const validatePatientId = [
  param('patientId')
    .isInt({ min: 1 }).withMessage('ID пациента должен быть положительным числом'),
  handleValidationErrors
];

// Validation for user registration
const validateUserRegistration = [
  body('username')
    .trim()
    .notEmpty().withMessage('Имя пользователя обязательно')
    .isLength({ min: 3, max: 50 }).withMessage('Имя пользователя должно быть от 3 до 50 символов')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Имя пользователя может содержать только буквы, цифры и подчеркивание'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email обязателен')
    .isEmail().withMessage('Неверный формат email'),
  body('password')
    .notEmpty().withMessage('Пароль обязателен')
    .isLength({ min: 6 }).withMessage('Пароль должен быть не менее 6 символов'),
  body('role')
    .optional()
    .isIn(['admin', 'doctor', 'receptionist']).withMessage('Роль должна быть: admin, doctor или receptionist'),
  handleValidationErrors
];

// Validation for user login
const validateUserLogin = [
  body('username')
    .trim()
    .notEmpty().withMessage('Имя пользователя обязательно'),
  body('password')
    .notEmpty().withMessage('Пароль обязателен'),
  handleValidationErrors
];

// Validation for appointment filters
const validateAppointmentFilters = [
  query('status')
    .optional()
    .isIn(['scheduled', 'completed', 'cancelled']).withMessage('Статус должен быть: scheduled, completed или cancelled'),
  query('startDate')
    .optional()
    .isISO8601().withMessage('Неверный формат даты начала'),
  query('endDate')
    .optional()
    .isISO8601().withMessage('Неверный формат даты окончания'),
  handleValidationErrors
];

module.exports = {
  validatePatient,
  validateDoctor,
  validateAppointment,
  validateAppointmentUpdate,
  validateId,
  validatePatientId,
  validateUserRegistration,
  validateUserLogin,
  validateAppointmentFilters,
  handleValidationErrors
};

