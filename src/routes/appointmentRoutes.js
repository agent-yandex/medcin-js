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

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     summary: Получить список всех записей на прием
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: Фильтр по статусу
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: integer
 *         description: Фильтр по ID пациента
 *       - in: query
 *         name: doctorId
 *         schema:
 *           type: integer
 *         description: Фильтр по ID врача
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата
 *     responses:
 *       200:
 *         description: Список записей на прием
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 */
router.get('/', validateAppointmentFilters, appointmentController.getAllAppointments);

/**
 * @swagger
 * /api/appointments/patient/{patientId}/history:
 *   get:
 *     summary: Получить историю записей пациента
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patientId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID пациента
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [scheduled, completed, cancelled]
 *         description: Фильтр по статусу
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Начальная дата
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Конечная дата
 *     responses:
 *       200:
 *         description: История записей пациента
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Пациент не найден
 */
router.get('/patient/:patientId/history', 
  validatePatientId, 
  validateAppointmentFilters, 
  appointmentController.getPatientHistory
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     summary: Получить запись на прием по ID
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID записи
 *     responses:
 *       200:
 *         description: Информация о записи
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       404:
 *         description: Запись не найдена
 */
router.get('/:id', validateId, appointmentController.getAppointmentById);

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     summary: Создать новую запись на прием
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientId
 *               - doctorId
 *               - appointmentDate
 *             properties:
 *               patientId:
 *                 type: integer
 *                 example: 1
 *               doctorId:
 *                 type: integer
 *                 example: 1
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-25T10:00:00Z"
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *                 default: scheduled
 *                 example: "scheduled"
 *               reason:
 *                 type: string
 *                 example: "Общее обследование"
 *     responses:
 *       201:
 *         description: Запись успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 */
router.post('/', 
  authorizeRoles('admin', 'receptionist', 'doctor'), 
  validateAppointment, 
  appointmentController.createAppointment
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     summary: Обновить запись на прием
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID записи
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               patientId:
 *                 type: integer
 *               doctorId:
 *                 type: integer
 *               appointmentDate:
 *                 type: string
 *                 format: date-time
 *               status:
 *                 type: string
 *                 enum: [scheduled, completed, cancelled]
 *               reason:
 *                 type: string
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Запись успешно обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Appointment'
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав
 *       404:
 *         description: Запись не найдена
 */
router.put('/:id', 
  authorizeRoles('admin', 'receptionist', 'doctor'), 
  validateId, 
  validateAppointmentUpdate, 
  appointmentController.updateAppointment
);

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     summary: Удалить запись на прием
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID записи
 *     responses:
 *       200:
 *         description: Запись успешно удалена
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Недостаточно прав (только admin)
 *       404:
 *         description: Запись не найдена
 */
router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  appointmentController.deleteAppointment
);

module.exports = router;

