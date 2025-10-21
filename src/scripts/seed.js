require('dotenv').config();
const { sequelize, User, Patient, Doctor, Appointment } = require('../models');

const seedData = async () => {
  try {
    console.log('Starting database seeding...');

    // Check connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Create users
    console.log('\nCreating users...');
    
    const [admin] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin'
      }
    });
    console.log(' Admin user created');

    const [receptionist] = await User.findOrCreate({
      where: { username: 'receptionist' },
      defaults: {
        username: 'receptionist',
        email: 'receptionist@hospital.com',
        password: 'receptionist123',
        role: 'receptionist'
      }
    });
    console.log(' Receptionist user created');

    const [doctorUser] = await User.findOrCreate({
      where: { username: 'doctor' },
      defaults: {
        username: 'doctor',
        email: 'doctor@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      }
    });
    console.log(' Doctor user created');

    // Create doctors
    console.log('\nCreating doctors...');
    
    const doctors = await Doctor.bulkCreate([
      {
        firstName: 'Анна',
        lastName: 'Смирнова',
        middleName: 'Владимировна',
        specialization: 'Терапевт',
        contactPhone: '+79001234567',
        contactEmail: 'a.smirnova@hospital.com',
        schedule: {
          monday: '9:00-17:00',
          tuesday: '9:00-17:00',
          wednesday: '9:00-17:00',
          thursday: '9:00-17:00',
          friday: '9:00-15:00',
          saturday: 'выходной',
          sunday: 'выходной'
        }
      },
      {
        firstName: 'Сергей',
        lastName: 'Иванов',
        middleName: 'Петрович',
        specialization: 'Кардиолог',
        contactPhone: '+79009876543',
        contactEmail: 's.ivanov@hospital.com',
        schedule: {
          monday: '10:00-18:00',
          tuesday: '10:00-18:00',
          wednesday: '10:00-18:00',
          thursday: '10:00-18:00',
          friday: '10:00-16:00',
          saturday: 'выходной',
          sunday: 'выходной'
        }
      },
      {
        firstName: 'Мария',
        lastName: 'Козлова',
        middleName: 'Александровна',
        specialization: 'Невролог',
        contactPhone: '+79005554433',
        contactEmail: 'm.kozlova@hospital.com',
        schedule: {
          monday: '8:00-16:00',
          tuesday: '8:00-16:00',
          wednesday: '8:00-16:00',
          thursday: '8:00-16:00',
          friday: '8:00-14:00',
          saturday: 'выходной',
          sunday: 'выходной'
        }
      }
    ], { 
      updateOnDuplicate: ['firstName', 'lastName', 'middleName', 'specialization', 'contactPhone', 'contactEmail', 'schedule']
    });
    console.log(` Created ${doctors.length} doctors`);

    // Create patients
    console.log('\nCreating patients...');
    
    const patients = await Patient.bulkCreate([
      {
        firstName: 'Иван',
        lastName: 'Петров',
        middleName: 'Сергеевич',
        dateOfBirth: '1990-05-15',
        gender: 'male',
        email: 'ivan.petrov@example.com',
        insurancePolicy: '1234567890123456'
      },
      {
        firstName: 'Елена',
        lastName: 'Сидорова',
        middleName: 'Николаевна',
        dateOfBirth: '1985-08-22',
        gender: 'female',
        email: 'elena.sidorova@example.com',
        insurancePolicy: '2345678901234567'
      },
      {
        firstName: 'Дмитрий',
        lastName: 'Морозов',
        middleName: 'Викторович',
        dateOfBirth: '1978-03-10',
        gender: 'male',
        email: 'dmitry.morozov@example.com',
        insurancePolicy: '3456789012345678'
      },
      {
        firstName: 'Ольга',
        lastName: 'Новикова',
        middleName: 'Игоревна',
        dateOfBirth: '1995-11-30',
        gender: 'female',
        email: 'olga.novikova@example.com',
        insurancePolicy: '4567890123456789'
      },
      {
        firstName: 'Александр',
        lastName: 'Волков',
        middleName: 'Андреевич',
        dateOfBirth: '1982-07-18',
        gender: 'male',
        email: 'alex.volkov@example.com',
        insurancePolicy: '5678901234567890'
      }
    ], { 
      updateOnDuplicate: ['firstName', 'lastName', 'middleName', 'dateOfBirth', 'gender', 'email', 'insurancePolicy']
    });
    console.log(` Created ${patients.length} patients`);

    // Create appointments
    console.log('\nCreating appointments...');
    
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const appointments = await Appointment.bulkCreate([
      {
        patientId: patients[0].id,
        doctorId: doctors[0].id,
        appointmentDate: tomorrow.toISOString(),
        status: 'scheduled',
        reason: 'Общее обследование, профилактический осмотр'
      },
      {
        patientId: patients[1].id,
        doctorId: doctors[1].id,
        appointmentDate: nextWeek.toISOString(),
        status: 'scheduled',
        reason: 'Боли в области сердца, консультация'
      },
      {
        patientId: patients[2].id,
        doctorId: doctors[2].id,
        appointmentDate: lastWeek.toISOString(),
        status: 'completed',
        reason: 'Головные боли, мигрень',
        notes: 'Диагноз: мигрень. Назначено: парацетамол 500мг 2 раза в день, 5 дней. Повторный приём через неделю.'
      },
      {
        patientId: patients[3].id,
        doctorId: doctors[0].id,
        appointmentDate: lastWeek.toISOString(),
        status: 'completed',
        reason: 'Простуда, высокая температура',
        notes: 'Диагноз: ОРВИ. Назначено: постельный режим, обильное питьё, жаропонижающие при температуре выше 38.5.'
      },
      {
        patientId: patients[4].id,
        doctorId: doctors[1].id,
        appointmentDate: today.toISOString(),
        status: 'cancelled',
        reason: 'Плановое обследование'
      }
    ], { 
      updateOnDuplicate: ['patientId', 'doctorId', 'appointmentDate', 'status', 'reason', 'notes']
    });
    console.log(` Created ${appointments.length} appointments`);

    console.log('\n Seeding completed successfully!');
    console.log('\n=== Test Users ===');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('\nReceptionist:');
    console.log('  Username: receptionist');
    console.log('  Password: receptionist123');
    console.log('\nDoctor:');
    console.log('  Username: doctor');
    console.log('  Password: doctor123');
    
    process.exit(0);
  } catch (error) {
    console.error('✗ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();

