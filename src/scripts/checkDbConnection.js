const { sequelize } = require('../models');

/**
 * Script to check database connection
 */
const checkConnection = async () => {
  try {
    console.log('Проверка подключения к базе данных...');
    console.log(`Host: ${process.env.DB_HOST || 'не указан'}`);
    console.log(`Port: ${process.env.DB_PORT || 'не указан'}`);
    console.log(`Database: ${process.env.DB_NAME || 'не указана'}`);
    console.log(`User: ${process.env.DB_USER || 'не указан'}`);
    console.log('');

    await sequelize.authenticate();
    console.log('✅ Подключение к базе данных успешно установлено!');
    
    // Try to query database
    const [results] = await sequelize.query('SELECT version()');
    console.log(`✅ Версия PostgreSQL: ${results[0].version}`);
    
    await sequelize.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка подключения к базе данных:');
    console.error(error.message);
    console.error('');
    console.error('Проверьте:');
    console.error('1. Запущена ли база данных (docker-compose up -d)');
    console.error('2. Правильно ли настроены переменные окружения в .env');
    console.error('3. Доступен ли хост и порт базы данных');
    process.exit(1);
  }
};

checkConnection();

