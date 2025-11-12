const request = require('supertest');
const app = require('../src/server');
const { createTestUser, createTestDoctor } = require('./helpers');
const { Doctor } = require('../src/models');

describe('Doctor Routes', () => {
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

  describe('GET /api/doctors', () => {
    it('should get all doctors with authentication', async () => {
      await createTestDoctor({ firstName: 'Анна', lastName: 'Смирнова' });
      await createTestDoctor({ firstName: 'Петр', lastName: 'Иванов' });

      const response = await request(app)
        .get('/api/doctors')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.doctors).toHaveLength(2);
      expect(response.body.data.pagination).toHaveProperty('total', 2);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/doctors');

      expect(response.status).toBe(401);
    });

    it('should filter doctors by specialization', async () => {
      await createTestDoctor({ specialization: 'Терапевт' });
      await createTestDoctor({ specialization: 'Хирург' });

      const response = await request(app)
        .get('/api/doctors?specialization=Терапевт')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.doctors.length).toBeGreaterThan(0);
      expect(response.body.data.doctors[0].specialization).toContain('Терапевт');
    });
  });

  describe('GET /api/doctors/:id', () => {
    it('should get doctor by id', async () => {
      const doctor = await createTestDoctor();

      const response = await request(app)
        .get(`/api/doctors/${doctor.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(doctor.id);
      expect(response.body.data.firstName).toBe(doctor.firstName);
    });

    it('should return 404 for non-existent doctor', async () => {
      const response = await request(app)
        .get('/api/doctors/99999')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/doctors', () => {
    it('should create doctor with admin role', async () => {
      const doctorData = {
        firstName: 'Новый',
        lastName: 'Врач',
        middleName: 'Тестович',
        specialization: 'Кардиолог',
        contactPhone: '+79001111111',
        contactEmail: 'newdoctor@hospital.com',
        schedule: {
          monday: '10:00-18:00',
          tuesday: '10:00-18:00'
        }
      };

      const response = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(doctorData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.firstName).toBe(doctorData.firstName);
      expect(response.body.data.specialization).toBe(doctorData.specialization);
    });

    it('should return 403 with receptionist role', async () => {
      const doctorData = {
        firstName: 'Новый',
        lastName: 'Врач',
        specialization: 'Кардиолог'
      };

      const response = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send(doctorData);

      expect(response.status).toBe(403);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/doctors')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          firstName: 'Test'
          // missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/doctors/:id', () => {
    it('should update doctor with admin role', async () => {
      const doctor = await createTestDoctor();

      const response = await request(app)
        .put(`/api/doctors/${doctor.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          specialization: 'Обновленная специализация'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.specialization).toBe('Обновленная специализация');
    });

    it('should return 404 for non-existent doctor', async () => {
      const response = await request(app)
        .put('/api/doctors/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          specialization: 'Test'
        });

      expect(response.status).toBe(404);
    });

    it('should return 403 with receptionist role', async () => {
      const doctor = await createTestDoctor();

      const response = await request(app)
        .put(`/api/doctors/${doctor.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send({
          specialization: 'Test'
        });

      expect(response.status).toBe(403);
    });
  });

  describe('DELETE /api/doctors/:id', () => {
    it('should delete doctor with admin role', async () => {
      const doctor = await createTestDoctor();

      const response = await request(app)
        .delete(`/api/doctors/${doctor.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify doctor is deleted
      const deletedDoctor = await Doctor.findByPk(doctor.id);
      expect(deletedDoctor).toBeNull();
    });

    it('should return 403 with receptionist role', async () => {
      const doctor = await createTestDoctor();

      const response = await request(app)
        .delete(`/api/doctors/${doctor.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent doctor', async () => {
      const response = await request(app)
        .delete('/api/doctors/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});

