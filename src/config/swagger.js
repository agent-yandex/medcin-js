const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hospital Management API',
      version: '1.0.0',
      description: 'API для управления больницей, пациентами, врачами и записями на прием',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:8080',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID пользователя',
            },
            username: {
              type: 'string',
              description: 'Имя пользователя',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email пользователя',
            },
            role: {
              type: 'string',
              enum: ['admin', 'doctor', 'receptionist'],
              description: 'Роль пользователя',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Patient: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID пациента',
            },
            firstName: {
              type: 'string',
              description: 'Имя пациента',
            },
            lastName: {
              type: 'string',
              description: 'Фамилия пациента',
            },
            middleName: {
              type: 'string',
              description: 'Отчество пациента',
            },
            dateOfBirth: {
              type: 'string',
              format: 'date',
              description: 'Дата рождения',
            },
            gender: {
              type: 'string',
              enum: ['male', 'female', 'other'],
              description: 'Пол',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Email',
            },
            insurancePolicy: {
              type: 'string',
              description: 'Страховой полис',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Doctor: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID врача',
            },
            firstName: {
              type: 'string',
              description: 'Имя врача',
            },
            lastName: {
              type: 'string',
              description: 'Фамилия врача',
            },
            middleName: {
              type: 'string',
              description: 'Отчество врача',
            },
            specialization: {
              type: 'string',
              description: 'Специализация',
            },
            contactPhone: {
              type: 'string',
              description: 'Контактный телефон',
            },
            contactEmail: {
              type: 'string',
              format: 'email',
              description: 'Контактный email',
            },
            schedule: {
              type: 'object',
              description: 'График работы в формате JSON',
              example: {
                monday: '9:00-17:00',
                tuesday: '9:00-17:00',
                wednesday: '9:00-17:00',
                thursday: '9:00-17:00',
                friday: '9:00-15:00'
              },
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Appointment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'ID записи',
            },
            patientId: {
              type: 'integer',
              description: 'ID пациента',
            },
            doctorId: {
              type: 'integer',
              description: 'ID врача',
            },
            appointmentDate: {
              type: 'string',
              format: 'date-time',
              description: 'Дата и время приема',
            },
            status: {
              type: 'string',
              enum: ['scheduled', 'completed', 'cancelled'],
              description: 'Статус записи',
            },
            reason: {
              type: 'string',
              description: 'Причина обращения',
            },
            notes: {
              type: 'string',
              description: 'Заметки врача после приёма',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
            },
            data: {
              type: 'object',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/server.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;

