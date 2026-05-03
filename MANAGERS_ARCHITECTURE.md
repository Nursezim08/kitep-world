# Архитектура системы управления менеджерами

## Общая схема

```
┌─────────────────────────────────────────────────────────────────┐
│                         КЛИЕНТ (Browser)                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │         /admin/managers (ManagersClient.tsx)           │    │
│  │                                                         │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐            │    │
│  │  │  Таблица │  │  Поиск   │  │ Модалки  │            │    │
│  │  │менеджеров│  │          │  │ Add/Edit │            │    │
│  │  └──────────┘  └──────────┘  └──────────┘            │    │
│  │                                                         │    │
│  │  State: managers, branches, formData, searchQuery      │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ fetch()                           │
│                              ▼                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTP/HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      СЕРВЕР (Next.js)                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              API Routes (Route Handlers)               │    │
│  │                                                         │    │
│  │  GET    /api/admin/managers          ┐                │    │
│  │  POST   /api/admin/managers          │ Auth Check     │    │
│  │  PATCH  /api/admin/managers/[id]     │ (admin_session)│    │
│  │  DELETE /api/admin/managers/[id]     │                │    │
│  │  GET    /api/admin/branches          ┘                │    │
│  │                                                         │    │
│  │  Middleware: cookies(), validation, error handling     │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              │ Prisma Client                     │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                  lib/prisma.ts                          │    │
│  │                  lib/password.ts (bcrypt)               │    │
│  └────────────────────────────────────────────────────────┘    │
│                              │                                   │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ SQL Queries
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    БАЗА ДАННЫХ (PostgreSQL)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐ │
│  │    users     │      │ branch_users │      │   branches   │ │
│  ├──────────────┤      ├──────────────┤      ├──────────────┤ │
│  │ id (PK)      │◄─────┤ user_id (FK) │      │ id (PK)      │ │
│  │ full_name    │      │ branch_id(FK)├─────►│ name         │ │
│  │ email (UQ)   │      └──────────────┘      │ city         │ │
│  │ phone (UQ)   │                             │ code (UQ)    │ │
│  │ password_hash│                             │ status       │ │
│  │ role         │                             └──────────────┘ │
│  │ status       │                                               │
│  └──────────────┘                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Поток данных

### 1. Получение списка менеджеров

```
User clicks "Менеджеры"
         │
         ▼
Router navigates to /admin/managers
         │
         ▼
page.tsx (Server Component)
  - Проверка admin_session cookie
  - Проверка роли admin
  - Рендер ManagersClient
         │
         ▼
ManagersClient.tsx (Client Component)
  - useEffect → fetchManagers()
         │
         ▼
GET /api/admin/managers
  - Проверка admin_session
  - Prisma query: User.findMany({ role: 'manager' })
  - Include: branchUsers.branch
         │
         ▼
Response: { managers: [...] }
         │
         ▼
setState(managers)
         │
         ▼
Render table with managers
```

### 2. Создание менеджера

```
User clicks "Добавить менеджера"
         │
         ▼
Show modal with form
         │
         ▼
User fills form and submits
         │
         ▼
handleAddManager(formData)
         │
         ▼
POST /api/admin/managers
  - Проверка admin_session
  - Валидация данных
  - Проверка уникальности email/phone
  - hashPassword(password)
  - Prisma: User.create({ role: 'manager' })
  - If branchId: BranchUser.create()
         │
         ▼
Response: { manager: {...} }
         │
         ▼
Close modal, refresh list
```

### 3. Редактирование менеджера

```
User clicks edit icon
         │
         ▼
openEditModal(manager)
  - setSelectedManager(manager)
  - setEditFormData(manager data)
  - Show modal
         │
         ▼
User modifies form and submits
         │
         ▼
handleEditManager(editFormData)
         │
         ▼
PATCH /api/admin/managers/[id]
  - Проверка admin_session
  - Проверка существования менеджера
  - Валидация данных
  - Проверка уникальности (если изменились)
  - If password: hashPassword(password)
  - Prisma: User.update()
  - If branchId changed:
    - BranchUser.deleteMany()
    - BranchUser.create()
         │
         ▼
Response: { manager: {...} }
         │
         ▼
Close modal, refresh list
```

### 4. Удаление менеджера

```
User clicks delete icon
         │
         ▼
Confirm dialog
         │
         ▼
handleDeleteManager(managerId)
         │
         ▼
DELETE /api/admin/managers/[id]
  - Проверка admin_session
  - Проверка существования менеджера
  - Prisma: User.delete()
    (Cascade: BranchUser автоматически удаляется)
         │
         ▼
Response: { message: "success" }
         │
         ▼
Refresh list
```

## Компоненты системы

### Frontend (Client Components)

```
ManagersClient.tsx
├── State Management
│   ├── managers: Manager[]
│   ├── branches: Branch[]
│   ├── formData: CreateManagerForm
│   ├── editFormData: EditManagerForm
│   ├── searchQuery: string
│   ├── showAddModal: boolean
│   └── showEditModal: boolean
│
├── UI Components
│   ├── Header (logo, search, user, logout)
│   ├── Search Input
│   ├── Managers Table
│   │   ├── Table Header
│   │   └── Table Rows (map managers)
│   ├── Add Manager Modal
│   │   └── Form (name, email, phone, password, branch)
│   └── Edit Manager Modal
│       └── Form (name, email, phone, password, status, branch)
│
└── Functions
    ├── fetchManagers()
    ├── fetchBranches()
    ├── handleAddManager()
    ├── handleEditManager()
    ├── handleDeleteManager()
    ├── openEditModal()
    ├── getStatusColor()
    └── getStatusText()
```

### Backend (API Routes)

```
/api/admin/managers/route.ts
├── GET
│   ├── Auth check (admin_session)
│   ├── Query: User.findMany({ role: 'manager' })
│   └── Response: { managers: [...] }
│
└── POST
    ├── Auth check (admin_session)
    ├── Validation (required fields)
    ├── Check email uniqueness
    ├── Check phone uniqueness
    ├── Hash password
    ├── Create: User.create()
    ├── If branchId: BranchUser.create()
    └── Response: { manager: {...} }

/api/admin/managers/[id]/route.ts
├── PATCH
│   ├── Auth check (admin_session)
│   ├── Check manager exists
│   ├── Validation
│   ├── Check uniqueness (if changed)
│   ├── If password: hash it
│   ├── Update: User.update()
│   ├── If branchId changed: update BranchUser
│   └── Response: { manager: {...} }
│
└── DELETE
    ├── Auth check (admin_session)
    ├── Check manager exists
    ├── Delete: User.delete() (cascade BranchUser)
    └── Response: { message: "success" }

/api/admin/branches/route.ts
└── GET
    ├── Auth check (admin_session)
    ├── Query: Branch.findMany({ status: 'active' })
    └── Response: { branches: [...] }
```

### Database Schema

```
User (менеджеры)
├── id: UUID (PK)
├── full_name: VARCHAR(255)
├── email: VARCHAR(255) UNIQUE
├── email_verified: BOOLEAN (default: false)
├── role: ENUM (admin, user, manager)
├── phone: VARCHAR(30) UNIQUE
├── password_hash: TEXT
├── status: ENUM (active, inactive, blocked)
├── created_at: TIMESTAMP
└── updated_at: TIMESTAMP

BranchUser (связь)
├── id: UUID (PK)
├── branch_id: UUID (FK → branches.id)
├── user_id: UUID (FK → users.id)
└── UNIQUE(branch_id, user_id)

Branch (филиалы)
├── id: UUID (PK)
├── name: VARCHAR(255)
├── code: VARCHAR(50) UNIQUE
├── city: VARCHAR(100)
├── status: ENUM (active, inactive, deleted)
└── ...
```

## Безопасность

### Уровни защиты

```
1. Frontend
   ├── Form validation
   ├── Required fields check
   └── Client-side error handling

2. API Routes
   ├── Session check (admin_session cookie)
   ├── Role check (admin only)
   ├── Input validation
   ├── Uniqueness checks
   └── Error handling

3. Database
   ├── Unique constraints (email, phone)
   ├── Foreign key constraints
   ├── Cascade delete rules
   └── Indexes for performance

4. Password Security
   ├── bcrypt hashing
   ├── Salt rounds: 10
   └── Never stored in plain text
```

## Производительность

### Оптимизации

```
1. Database Queries
   ├── Indexes on email, phone
   ├── Select only needed fields
   ├── Include relations efficiently
   └── Order by created_at DESC

2. Frontend
   ├── Client-side search (no API calls)
   ├── Debounced search input
   ├── Lazy loading modals
   └── Optimistic UI updates

3. Caching
   ├── Prisma connection pooling
   ├── Next.js automatic caching
   └── Browser cache for static assets
```

## Масштабируемость

### Текущие ограничения

```
- Нет пагинации (все менеджеры загружаются сразу)
- Нет фильтрации на сервере
- Поиск только на клиенте
```

### Будущие улучшения

```
1. Пагинация
   ├── Cursor-based pagination
   ├── Page size: 20-50 items
   └── Infinite scroll или page numbers

2. Фильтрация
   ├── По статусу
   ├── По филиалу
   └── По дате создания

3. Сортировка
   ├── По имени
   ├── По email
   └── По дате

4. Кеширование
   ├── Redis для сессий
   ├── Query caching
   └── CDN для статики
```

## Мониторинг и логирование

### Текущее состояние

```
- console.error() для ошибок
- HTTP status codes
- Error messages в response
```

### Рекомендации

```
1. Логирование
   ├── Winston или Pino
   ├── Structured logs
   └── Log levels (error, warn, info, debug)

2. Мониторинг
   ├── Sentry для ошибок
   ├── Analytics для использования
   └── Performance monitoring

3. Аудит
   ├── Логирование всех действий админа
   ├── История изменений
   └── IP и timestamp
```

---

**Примечание**: Эта архитектура спроектирована для расширения и может быть дополнена новыми функциями без значительных изменений в существующем коде.
