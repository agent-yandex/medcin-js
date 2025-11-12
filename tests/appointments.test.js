const request = require('supertest');
const app = require('../src/server');
const { createTestUser, createTestPatient, createTestDoctor, createTestAppointment } = require('./helpers');
const { Appointment } = require('../src/models');

describe('Appointment Routes', () => {
  let adminToken, receptionistToken, doctorToken;
  let testPatient, testDoctor;

  beforeEach(async () => {
    const timestamp = Date.now();
    const admin = await createTestUser({ username: `admin_${timestamp}`, role: 'admin' });
    const receptionist = await createTestUser({ username: `receptionist_${timestamp}`, role: 'receptionist' });
    const doctor = await createTestUser({ username: `doctor_${timestamp}`, role: 'doctor' });
    
    adminToken = admin.token;
    receptionistToken = receptionist.token;
    doctorToken = doctor.token;

    testPatient = await createTestPatient();
    testDoctor = await createTestDoctor();
  });

  describe('GET /api/appointments', () => {
    it('should get all appointments with authentication', async () => {
      await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });
      await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.appointments).toHaveLength(2);
    });

    it('should filter appointments by status', async () => {
      await createTestAppointment({ status: 'scheduled', patientId: testPatient.id, doctorId: testDoctor.id });
      await createTestAppointment({ status: 'completed', patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .get('/api/appointments?status=scheduled')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.appointments.every(apt => apt.status === 'scheduled')).toBe(true);
    });

    it('should filter appointments by patientId', async () => {
      const patient2 = await createTestPatient({ email: 'patient2@example.com', insurancePolicy: '1111111111111111' });
      
      await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });
      await createTestAppointment({ patientId: patient2.id, doctorId: testDoctor.id });

      const response = await request(app)
        .get(`/api/appointments?patientId=${testPatient.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.appointments.every(apt => apt.patientId === testPatient.id)).toBe(true);
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/appointments');

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/appointments/:id', () => {
    it('should get appointment by id', async () => {
      const appointment = await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .get(`/api/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(appointment.id);
      expect(response.body.data).toHaveProperty('patient');
      expect(response.body.data).toHaveProperty('doctor');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .get('/api/appointments/99999')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/appointments/patient/:patientId/history', () => {
    it('should get patient history', async () => {
      await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });
      await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .get(`/api/appointments/patient/${testPatient.id}/history`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.patient.id).toBe(testPatient.id);
      expect(response.body.data.appointments.length).toBeGreaterThanOrEqual(2);
    });

    it('should return 404 for non-existent patient', async () => {
      const response = await request(app)
        .get('/api/appointments/patient/99999/history')
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/appointments', () => {
    it('should create appointment with admin role', async () => {
      const appointmentData = {
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        status: 'scheduled',
        reason: 'Консультация'
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.patientId).toBe(testPatient.id);
      expect(response.body.data.doctorId).toBe(testDoctor.id);
    });

    it('should create appointment with receptionist role', async () => {
      const appointmentData = {
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${receptionistToken}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should create appointment with doctor role', async () => {
      const appointmentData = {
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send(appointmentData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 if patient does not exist', async () => {
      const appointmentData = {
        patientId: 99999,
        doctorId: testDoctor.id,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      expect(response.status).toBe(404);
    });

    it('should return 404 if doctor does not exist', async () => {
      const appointmentData = {
        patientId: testPatient.id,
        doctorId: 99999,
        appointmentDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      expect(response.status).toBe(404);
    });

    it('should return 409 if doctor is already busy', async () => {
      const appointmentDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      
      await createTestAppointment({
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: appointmentDate,
        status: 'scheduled'
      });

      const appointmentData = {
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: appointmentDate.toISOString()
      };

      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(appointmentData);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should return 400 if validation fails', async () => {
      const response = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          // missing required fields
        });

      expect(response.status).toBe(400);
    });
  });

  describe('PUT /api/appointments/:id', () => {
    it('should update appointment with admin role', async () => {
      const appointment = await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .put(`/api/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed',
          notes: 'Прием завершен успешно'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('completed');
      expect(response.body.data.notes).toBe('Прием завершен успешно');
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .put('/api/appointments/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'completed'
        });

      expect(response.status).toBe(404);
    });

    it('should return 409 if updating date causes conflict', async () => {
      const baseTime = Date.now() + 48 * 60 * 60 * 1000;
      const appointmentDate1 = new Date(baseTime);
      const appointmentDate2 = new Date(baseTime + 24 * 60 * 60 * 1000);
      
      const appointment1 = await createTestAppointment({
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: appointmentDate1
      });

      await createTestAppointment({
        patientId: testPatient.id,
        doctorId: testDoctor.id,
        appointmentDate: appointmentDate2
      });

      // Try to update appointment1 to conflict with appointment2
      const response = await request(app)
        .put(`/api/appointments/${appointment1.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          appointmentDate: appointmentDate2.toISOString()
        });

      expect(response.status).toBe(409);
    });
  });

  describe('DELETE /api/appointments/:id', () => {
    it('should delete appointment with admin role', async () => {
      const appointment = await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .delete(`/api/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      // Verify appointment is deleted
      const deletedAppointment = await Appointment.findByPk(appointment.id);
      expect(deletedAppointment).toBeNull();
    });

    it('should return 403 with receptionist role', async () => {
      const appointment = await createTestAppointment({ patientId: testPatient.id, doctorId: testDoctor.id });

      const response = await request(app)
        .delete(`/api/appointments/${appointment.id}`)
        .set('Authorization', `Bearer ${receptionistToken}`);

      expect(response.status).toBe(403);
    });

    it('should return 404 for non-existent appointment', async () => {
      const response = await request(app)
        .delete('/api/appointments/99999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});

