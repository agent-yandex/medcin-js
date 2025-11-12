const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctorController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const { validateDoctor, validateId } = require('../middleware/validators');

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /api/doctors:
 *   get:
 *     summary: Получить список всех врачей
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список врачей
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
 *                     $ref: '#/components/schemas/Doctor'
 */
router.get('/', doctorController.getAllDoctors);

/**
 * @swagger
 * /api/doctors/{id}:
 *   get:
 *     summary: Получить врача по ID
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID врача
 *     responses:
 *       200:
 *         description: Информация о враче
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Doctor'
 *       404:
 *         description: Врач не найден
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', validateId, doctorController.getDoctorById);

/**
 * @swagger
 * /api/doctors:
 *   post:
 *     summary: Создать нового врача
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - specialization
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: "Анна"
 *               lastName:
 *                 type: string
 *                 example: "Смирнова"
 *               middleName:
 *                 type: string
 *                 example: "Владимировна"
 *               specialization:
 *                 type: string
 *                 example: "Терапевт"
 *               contactPhone:
 *                 type: string
 *                 example: "+79001234567"
 *               contactEmail:
 *                 type: string
 *                 format: email
 *                 example: "a.smirnova@hospital.com"
 *               schedule:
 *                 type: object
 *                 example:
 *                   monday: "9:00-17:00"
 *                   tuesday: "9:00-17:00"
 *                   wednesday: "9:00-17:00"
 *                   thursday: "9:00-17:00"
 *                   friday: "9:00-15:00"
 *     responses:
 *       201:
 *         description: Врач успешно создан
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав (только admin)
 */
router.post('/', 
  authorizeRoles('admin'), 
  validateDoctor, 
  doctorController.createDoctor
);

/**
 * @swagger
 * /api/doctors/{id}:
 *   put:
 *     summary: Обновить информацию о враче
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID врача
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *               lastName:
 *                 type: string
 *               middleName:
 *                 type: string
 *               specialization:
 *                 type: string
 *               contactPhone:
 *                 type: string
 *               contactEmail:
 *                 type: string
 *                 format: email
 *               schedule:
 *                 type: object
 *     responses:
 *       200:
 *         description: Информация о враче обновлена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Doctor'
 *       400:
 *         description: Ошибка валидации
 *       403:
 *         description: Недостаточно прав (только admin)
 *       404:
 *         description: Врач не найден
 */
router.put('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  validateDoctor, 
  doctorController.updateDoctor
);

/**
 * @swagger
 * /api/doctors/{id}:
 *   delete:
 *     summary: Удалить врача
 *     tags: [Doctors]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID врача
 *     responses:
 *       200:
 *         description: Врач успешно удален
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Недостаточно прав (только admin)
 *       404:
 *         description: Врач не найден
 */
router.delete('/:id', 
  authorizeRoles('admin'), 
  validateId, 
  doctorController.deleteDoctor
);

module.exports = router;
