# Hospital Management API

API для управления пациентами, врачами и записями на приём в больнице. Построено на Node.js, Express.js, Sequelize и PostgreSQL.

## Возможности

- ✅ Управление пациентами (CRUD операции)
- ✅ Управление врачами (CRUD операции)
- ✅ Запись на приём к врачам
- ✅ История посещений пациентов с фильтрацией
- ✅ Аутентификация пользователей (JWT)
- ✅ Авторизация на основе ролей (admin, doctor, receptionist)
- ✅ Валидация данных
- ✅ Обработка ошибок
- ✅ Swagger/OpenAPI документация

## Технологический стек

- **Node.js** - серверная платформа
- **Express.js** - веб-фреймворк
- **Sequelize** - ORM для работы с БД
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **bcryptjs** - хеширование паролей
- **express-validator** - валидация данных
- **swagger-jsdoc** - генерация Swagger документации
- **swagger-ui-express** - UI для Swagger документации

## API Документация (Swagger)

После запуска сервера, интерактивная документация API доступна по адресу:

**http://localhost:8080/api-docs**

В Swagger UI вы можете:
- Просмотреть все доступные эндпоинты
- Увидеть схемы запросов и ответов
- Протестировать API прямо из браузера
- Авторизоваться с помощью JWT токена (кнопка "Authorize")

## Установка

### Вариант 1: С Docker (Рекомендуется)

**Предварительные требования:**
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

**Быстрый старт:**

```bash
# 1. Запустите все сервисы
docker-compose up -d

# 2. Выполните миграцию
docker-compose exec app npm run migrate

# 3. (Опционально) Загрузите тестовые данные
docker-compose exec app npm run seed
```

**Готово!** API доступен на http://localhost:8080

Сервер запустится на `http://localhost:8080`

**API Документация:** http://localhost:8080/api-docs

## Структура API

### Базовые эндпоинты

- **Health Check:** `GET /health`
- **API Info:** `GET /api`

### Аутентификация (`/api/auth`)

| Метод | Эндпоинт | Описание | Аутентификация |
|-------|----------|----------|----------------|
| POST | `/api/auth/register` | Регистрация пользователя | Нет |
| POST | `/api/auth/login` | Вход пользователя | Нет |
| GET | `/api/auth/me` | Получить текущего пользователя | Да |

### Пациенты (`/api/patients`)

| Метод | Эндпоинт | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/patients` | Получить всех пациентов | Все |
| GET | `/api/patients/:id` | Получить пациента по ID | Все |
| POST | `/api/patients` | Создать пациента | admin, receptionist |
| PUT | `/api/patients/:id` | Обновить пациента | admin, receptionist |
| DELETE | `/api/patients/:id` | Удалить пациента | admin |

### Врачи (`/api/doctors`)

| Метод | Эндпоинт | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/doctors` | Получить всех врачей | Все |
| GET | `/api/doctors/:id` | Получить врача по ID | Все |
| POST | `/api/doctors` | Создать врача | admin |
| PUT | `/api/doctors/:id` | Обновить врача | admin |
| DELETE | `/api/doctors/:id` | Удалить врача | admin |

### Записи на приём (`/api/appointments`)

| Метод | Эндпоинт | Описание | Роли |
|-------|----------|----------|------|
| GET | `/api/appointments` | Получить все записи | Все |
| GET | `/api/appointments/:id` | Получить запись по ID | Все |
| GET | `/api/appointments/patient/:patientId/history` | История посещений пациента | Все |
| POST | `/api/appointments` | Создать запись | admin, receptionist, doctor |
| PUT | `/api/appointments/:id` | Обновить запись | admin, receptionist, doctor |
| DELETE | `/api/appointments/:id` | Удалить запись | admin |

## Примеры запросов

### 1. Регистрация пользователя

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "receptionist1",
    "email": "receptionist@hospital.com",
    "password": "password123",
    "role": "receptionist"
  }'
```

### 2. Вход пользователя

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

**Ответ:**
```json
{
  "success": true,
  "message": "Вход выполнен успешно",
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@hospital.com",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Создать пациента

```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Иван",
    "lastName": "Петров",
    "middleName": "Сергеевич",
    "dateOfBirth": "1990-05-15",
    "gender": "male",
    "email": "ivan.petrov@example.com",
    "insurancePolicy": "1234567890123456"
  }'
```

### 4. Создать врача

```bash
curl -X POST http://localhost:8080/api/doctors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "firstName": "Анна",
    "lastName": "Смирнова",
    "middleName": "Владимировна",
    "specialization": "Терапевт",
    "contactPhone": "+79001234567",
    "contactEmail": "a.smirnova@hospital.com",
    "schedule": {
      "monday": "9:00-17:00",
      "tuesday": "9:00-17:00",
      "wednesday": "9:00-17:00",
      "thursday": "9:00-17:00",
      "friday": "9:00-15:00"
    }
  }'
```

### 5. Создать запись на приём

```bash
curl -X POST http://localhost:8080/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "patientId": 1,
    "doctorId": 1,
    "appointmentDate": "2024-12-25T10:00:00Z",
    "status": "scheduled",
    "reason": "Общее обследование"
  }'
```

### 6. Получить историю посещений пациента

```bash
# Все посещения
curl http://localhost:8080/api/appointments/patient/1/history \
  -H "Authorization: Bearer YOUR_TOKEN"

# С фильтром по статусу
curl "http://localhost:8080/api/appointments/patient/1/history?status=completed" \
  -H "Authorization: Bearer YOUR_TOKEN"

# С фильтром по дате
curl "http://localhost:8080/api/appointments/patient/1/history?startDate=2024-01-01&endDate=2024-12-31" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Роли пользователей

- **admin** - полный доступ ко всем операциям
- **receptionist** - может управлять пациентами и записями
- **doctor** - может просматривать и управлять записями

## Модели данных

### Patient (Пациент)
- `firstName` - Имя
- `lastName` - Фамилия
- `middleName` - Отчество (опционально)
- `dateOfBirth` - Дата рождения
- `gender` - Пол (male, female, other)
- `email` - Email (уникальный)
- `insurancePolicy` - Страховой полис (уникальный)

### Doctor (Врач)
- `firstName` - Имя
- `lastName` - Фамилия
- `middleName` - Отчество (опционально)
- `specialization` - Специализация
- `contactPhone` - Телефон
- `contactEmail` - Email
- `schedule` - График работы (JSON)

### Appointment (Запись на приём)
- `patientId` - ID пациента
- `doctorId` - ID врача
- `appointmentDate` - Дата и время приёма
- `status` - Статус (scheduled, completed, cancelled)
- `reason` - Причина обращения
- `notes` - Заметки врача

## Безопасность

- Все пароли хешируются с помощью bcrypt
- JWT токены используются для аутентификации
- Защита от SQL-инъекций через Sequelize ORM
- Валидация всех входящих данных
- CORS настроен для безопасного обмена данными
