# Используем официальный образ Node.js
FROM node:18-alpine

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm ci --only=production

# Копирование исходного кода
COPY . .

# Создание пользователя без root прав
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Создание директории для логов
RUN mkdir -p logs && chown -R nodejs:nodejs /app

# Переключение на пользователя nodejs
USER nodejs

# Открытие порта
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:8080/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Запуск приложения
CMD ["npm", "start"]

