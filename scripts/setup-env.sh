#!/bin/bash

# Скрипт для копирования .env.production в .env на production сервере
# Запускается автоматически при деплое на Timeweb

echo "🔧 Setting up environment variables..."

if [ -f ".env.production" ]; then
  cp .env.production .env
  echo "✅ .env file created from .env.production"
else
  echo "❌ .env.production file not found!"
  exit 1
fi

echo "✅ Environment setup complete!"
