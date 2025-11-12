# Makefile для упрощения работы с Docker

.PHONY: help up down restart logs migrate seed clean build rebuild test test-watch test-coverage test-check-db check-db

help: ## Показать помощь
	@echo "Доступные команды:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

up: ## Запустить все сервисы
	docker-compose up -d

down: ## Остановить все сервисы
	docker-compose down

restart: ## Перезапустить все сервисы
	docker-compose restart

logs: ## Показать логи
	docker-compose logs -f

migrate: ## Выполнить миграцию БД
	docker-compose exec app npm run migrate

seed: ## Заполнить БД тестовыми данными
	docker-compose exec app npm run seed

clean: ## Остановить и удалить контейнеры с volumes (УДАЛИТ ДАННЫЕ!)
	docker-compose down -v

build: ## Собрать образы
	docker-compose build

rebuild: ## Пересобрать и запустить
	docker-compose up -d --build

rebuild-no-cache: ## Пересобрать образ без кеша (при изменении зависимостей)
	docker-compose build --no-cache app
	docker-compose up -d

dev: ## Запустить только PostgreSQL (для локальной разработки)
	docker-compose -f docker-compose.dev.yml up -d

dev-down: ## Остановить dev окружение
	docker-compose -f docker-compose.dev.yml down

ps: ## Показать статус контейнеров
	docker-compose ps

shell-app: ## Войти в контейнер приложения
	docker-compose exec app sh

shell-db: ## Войти в PostgreSQL
	docker-compose exec postgres psql -U postgres -d medcin_db

backup: ## Создать бэкап БД
	docker-compose exec postgres pg_dump -U postgres medcin_db > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Бэкап создан: backup_$$(date +%Y%m%d_%H%M%S).sql"

stats: ## Показать использование ресурсов
	docker stats $$(docker-compose ps -q)

test: ## Запустить тесты
	npm test

test-watch: ## Запустить тесты в режиме watch
	npm run test:watch

test-coverage: ## Запустить тесты с покрытием кода
	npm run test:coverage

test-check-db: ## Проверить подключение к тестовой БД
	npm run test:check-db

check-db: ## Проверить подключение к БД
	npm run check-db

