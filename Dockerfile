# syntax=docker/dockerfile:1.7

# =========================================================
# Dockerfile для Next.js 16 приложения (Timeweb App Platform)
#
# Особенности:
# - Multi-stage build: уменьшает размер итогового образа
# - Используется output: 'standalone' из next.config.ts
# - Prisma Client генерируется на этапе сборки
# - .env НЕ копируется в образ — переменные окружения
#   передаются Timeweb в рантайме через UI панели
# - БД и S3 — внешние сервисы, данные не хранятся в контейнере
# =========================================================


# ---------- Stage 1: Установка зависимостей ----------
FROM node:20-alpine AS deps

# libc6-compat нужен для совместимости некоторых нативных модулей (Prisma, bcrypt)
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Копируем только манифесты для кеширования слоя зависимостей
COPY package.json package-lock.json* ./
COPY prisma ./prisma

# Устанавливаем все зависимости (включая dev — нужны для сборки)
# postinstall в @prisma/client автоматически сгенерирует Prisma Client
RUN npm ci


# ---------- Stage 2: Сборка приложения ----------
FROM node:20-alpine AS builder

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Переносим установленные зависимости
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Telemetry Next.js отключаем для чистоты сборки
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Генерируем Prisma Client (на случай если postinstall не отработал)
RUN npx prisma generate

# Сборка Next.js. Переменные окружения (DATABASE_URL и др.)
# на этапе билда не нужны — они подставляются в рантайме Timeweb.
RUN npm run build


# ---------- Stage 3: Минимальный production-образ ----------
FROM node:20-alpine AS runner

RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV SMTP_USER=nursezim416@gmail.com
ENV SMTP_PASS=mjaf ndbg eavp eriz

# Создаём непривилегированного пользователя
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

# Standalone-сборка содержит минимальный node_modules и server.js
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Prisma: схема и сгенерированный клиент нужны в рантайме
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

USER nextjs

EXPOSE 3000

# server.js создаётся output: 'standalone' и слушает на $HOSTNAME:$PORT
CMD ["node", "server.js"]
