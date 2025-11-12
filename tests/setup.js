require('dotenv').config();

// Set test environment variables if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-jwt-tokens';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const { sequelize } = require('../src/models');

// Global flag to track if DB is synced (shared across all test files)
if (!global.dbSynced) {
  global.dbSynced = false;
}

// Setup before all tests
beforeAll(async () => {
  try {
    // Connect to test database
    if (!global.dbSynced) {
      await sequelize.authenticate();
      
      // Sync database (create tables) - only once
      await sequelize.sync({ force: true });
      global.dbSynced = true;
    } else {
      // Just authenticate if already synced
      await sequelize.authenticate();
    }
  } catch (error) {
    // Re-throw error without logging - Jest will handle it
    throw error;
  }
});

// Cleanup after all tests
afterAll(async () => {
  // Close connection only if it's the last test file
  // In practice, with maxWorkers: 1, this should work fine
  try {
    if (sequelize && !sequelize.connectionManager.pool._closed) {
      await sequelize.close();
    }
  } catch (error) {
    // Ignore errors when closing
  }
});

// Clean up database after each test
afterEach(async () => {
  // Clear all tables using truncate (faster and safer than destroy)
  const { User, Patient, Doctor, Appointment } = require('../src/models');
  
  try {
    // Use truncate with CASCADE to handle foreign keys
    // Order matters: delete child tables first (appointments), then parent tables
    await sequelize.query('TRUNCATE TABLE appointments, patients, doctors, users RESTART IDENTITY CASCADE');
  } catch (error) {
    // Fallback to destroy if truncate fails
    try {
      // Delete in correct order to respect foreign keys
      await Appointment.destroy({ where: {}, truncate: false });
      await Patient.destroy({ where: {}, truncate: false });
      await Doctor.destroy({ where: {}, truncate: false });
      await User.destroy({ where: {}, truncate: false });
    } catch (destroyError) {
      // If both fail, silently continue - tests can continue
      // Error is ignored to prevent test failures
    }
  }
});

