require('dotenv').config();
const { sequelize, User } = require('../models');

const migrate = async () => {
  try {
    console.log('Starting database migration...');

    // Check connection
    await sequelize.authenticate();
    console.log('✓ Database connection established');

    // Synchronize all models
    await sequelize.sync({ force: false, alter: true });
    console.log('✓ All models synchronized');

    // Create default admin user if it doesn't exist
    const [admin, created] = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        username: 'admin',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin'
      }
    });

    if (created) {
      console.log(' Default admin user created');
      console.log('  Username: admin');
      console.log('  Password: admin123');
      console.log('  Email: admin@hospital.com');
    } else {
      console.log(' Admin user already exists');
    }

    console.log('\n Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error(' Migration failed:', error);
    process.exit(1);
  }
};

migrate();

