.PHONY: help migrate-create migrate-up migrate-down migrate-history run dev install clean

# Цвета для вывода
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

# Переменные
BACKEND_DIR=Backend
VENV_PYTHON=../.venv/bin/python
VENV_ALEMBIC=../.venv/bin/alembic
UVICORN=../.venv/bin/uvicorn

help: ## Показать это сообщение помощи
	@echo "$(GREEN)Доступные команды:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-20s$(NC) %s\n", $$1, $$2}'

install: ## Установить зависимости
	@echo "$(GREEN)Установка зависимостей...$(NC)"
	python3 -m venv .venv
	.venv/bin/pip install -r $(BACKEND_DIR)/requirements.txt
	@echo "$(GREEN)Зависимости установлены!$(NC)"

migrate-create: ## Создать новую миграцию (использование: make migrate-create msg="описание")
	@if [ -z "$(msg)" ]; then \
		echo "$(YELLOW)Ошибка: Укажите сообщение для миграции$(NC)"; \
		echo "Пример: make migrate-create msg=\"add users table\""; \
		exit 1; \
	fi
	@echo "$(GREEN)Создание миграции: $(msg)$(NC)"
	cd $(BACKEND_DIR) && $(VENV_ALEMBIC) revision --autogenerate -m "$(msg)"

migrate-up: ## Применить все миграции
	@echo "$(GREEN)Применение миграций...$(NC)"
	cd $(BACKEND_DIR) && $(VENV_ALEMBIC) upgrade head

migrate-down: ## Откатить последнюю миграцию
	@echo "$(YELLOW)Откат последней миграции...$(NC)"
	cd $(BACKEND_DIR) && $(VENV_ALEMBIC) downgrade -1

migrate-history: ## Показать историю миграций
	@echo "$(GREEN)История миграций:$(NC)"
	cd $(BACKEND_DIR) && $(VENV_ALEMBIC) history

migrate-current: ## Показать текущую версию миграции
	@echo "$(GREEN)Текущая версия:$(NC)"
	cd $(BACKEND_DIR) && $(VENV_ALEMBIC) current

run: ## Запустить бэкенд в production режиме
	@echo "$(GREEN)Запуск бэкенда...$(NC)"
	cd $(BACKEND_DIR) && $(UVICORN) app.main:app --host 0.0.0.0 --port 8000

dev: ## Запустить бэкенд в режиме разработки с автоперезагрузкой
	@echo "$(GREEN)Запуск бэкенда в режиме разработки...$(NC)"
	cd $(BACKEND_DIR) && $(UVICORN) app.main:app --reload --host 0.0.0.0 --port 8000

clean: ## Очистить кэш Python
	@echo "$(GREEN)Очистка кэша...$(NC)"
	find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
	find . -type f -name "*.pyc" -delete
	@echo "$(GREEN)Кэш очищен!$(NC)"

db-reset: ## ВНИМАНИЕ: Полностью пересоздать БД (удалит все данные!)
	@echo "$(YELLOW)ВНИМАНИЕ: Это удалит все данные из БД!$(NC)"
	@read -p "Вы уверены? [y/N] " -n 1 -r; \
	echo; \
	if [[ $$REPLY =~ ^[Yy]$$ ]]; then \
		echo "$(GREEN)Сброс БД...$(NC)"; \
		cd $(BACKEND_DIR) && $(VENV_ALEMBIC) downgrade base; \
		cd $(BACKEND_DIR) && $(VENV_ALEMBIC) upgrade head; \
		echo "$(GREEN)БД пересоздана!$(NC)"; \
	fi

test: ## Запустить тесты (если есть)
	@echo "$(GREEN)Запуск тестов...$(NC)"
	$(VENV_PYTHON) -m pytest $(BACKEND_DIR)/tests/

.DEFAULT_GOAL := help