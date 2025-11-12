const request = require('supertest');
const app = require('../src/server');
const { createTestUser, createTestPatient } = require('./helpers');
const { Patient } = require('../src/models');

describe('Patient Routes', () => {
  let adminToken, receptionistToken, doctorToken;

  beforeEach(async () => {
    const timestamp = Date.now();
    const admin = await createTestUser({ username: `admin_${timestamp}`, role: 'admin' });
    const receptionist = await createTestUser({ username: `receptionist_${timestamp}`, role: 'receptionist' });
    const doctor = await createTestUser({ username: `doctor_${timestamp}`, role: 'doctor' });
    
    adminToken = admin.token;
    receptionistToken = receptionist.token;
    doctorToken = doctor.token;
  });

  describe('GET /api/patients', () => {
    it('should get all patients with authentication', async () => {
      await createTestPatient({ firstName: 'Иван', lastName: 'Петров' });
      await createTestPatient({ firstName: 'Мария', lastName: 'Иванова' });

      const response = await request(app)
        .get('/api/patients')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.patients).toHaveLength(2);
      expect(response.body.data.pagination).toHaveProperty('total', 2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/patients');

      expect(response.status).toBe(401);
    });

    it('should filter patients by search query', async () => {
      await createTestPatient({ firstName: 'Иван', lastName: 'Петров' });
      await createTestPatient({ firstName: 'Мария', lastName: 'Иванова' });

      const response = await request(app)
        .get('/api/patients?search=Иван')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.patients.length).toBeGreaterThan(0);
      // Check that at least one patient contains "Иван" in firstName or lastName
      const hasIvan = response.body.data.patients.some(
        p => p.firstName.includes('Иван') || p.lastName.includes('Иван')
      );
      expect(hasIvan).toBe(true);
    });
  });

  describe('GET /api/patients/:id', () => {
    it('should get patient by id', async () => {
      const patient = await createTestPatient();

      const response = await request(app)
        .get(`/api/patients/${patient.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(patient.id);
      expect(response.body.data.firstName).toBe(patient.firstName);
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/patients/99999')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/patients', () => {
    it('should create patient with admin role', async () => {
      const patientData = {
        firstName: 'Новый',
        lastName: 'Пациент',
        middleName: 'Тестович',
        dateOfBirth: '1985-03-20',
        gender: 'male',
        email: 'newpatient@example.com',
        insurancePolicy: '9876543210987654'
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(patientData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(patientData.firstName);
      expect(response.body.data.lastName).toBe(patientData.lastName);
    });

    it('should create patient with receptionist role', async () => {
      const patientData = {
        firstName: 'Новый',
        lastName: 'Пациент',
        dateOfBirth: '1985-03-20',
        gender: 'male',
        email: 'newpatient2@example.com',
        insurancePolicy: '9876543210987655'
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send(patientData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 403 with doctor role', async () => {
      const patientData = {
        firstName: 'Новый',
        lastName: 'Пациент',
        dateOfBirth: '1985-03-20',
        gender: 'male',
        email: 'newpatient3@example.com',
        insurancePolicy: '9876543210987656'
      };

      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(patientData);

      expect(response.status).toBe(403);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/patients')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Test'
          // missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/patients/:id', () => {
    it('should update patient with admin role', async () => {
      const patient = await createTestPatient();

      const response = await request(app)
        .put(`/api/patients/${patient.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Обновленное',
          lastName: 'Имя'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe('Обновленное');
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .put('/api/patients/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Test'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 with doctor role', async () => {
      const patient = await createTestPatient();

      const response = await request(app)
        .put(`/api/patients/${patient.id}`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          firstName: 'Test'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/patients/:id', () => {
    it('should delete patient with admin role', async () => {
      const patient = await createTestPatient();

      const response = await request(app)
        .delete(`/api/patients/${patient.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify patient is deleted
      const deletedPatient = await Patient.findByPk(patient.id);
      expect(deletedPatient).toBeNull();
    });

    it('should return 403 with receptionist role', async () => {
      const patient = await createTestPatient();

      const response = await request(app)
        .delete(`/api/patients/${patient.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .delete('/api/patients/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});

