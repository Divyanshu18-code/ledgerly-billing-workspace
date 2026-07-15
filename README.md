# Ledgerly - Cloud-Based Billing & Finance Workspace (SaaS)

Ledgerly is a premium, multi-tenant Cloud-Based Billing and Finance Workspace designed for businesses, freelancers, and accountants. It offers workspace isolation, client profiles management, inventory item registry (products and services), and dynamic theme customisation.

---

## 🚀 Technology Stack

### Frontend
- **Framework & Runtime**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **State Management & Queries**: TanStack Query (React Query) v5
- **Form Validation**: React Hook Form, Zod

### Backend
- **Framework & Runtime**: Node.js, Express, TypeScript, nodemon + tsx
- **ORM**: Prisma ORM v7
- **Database**: PostgreSQL (Local Server)
- **Security & Tokens**: JWT Access Tokens, HTTP-Only Cookie Refresh Tokens, Bcrypt Password Hashing

---

## 📂 Project Directory Structure

```
ledgerly/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & icons
│   ├── src/
│   │   ├── assets/             # Images & visual themes
│   │   ├── components/         # Global Layout wrappers (DashboardLayout, etc.)
│   │   ├── hooks/              # Global hooks (useAuth, useTheme context providers)
│   │   ├── lib/                # API client (Axios configuration)
│   │   ├── modules/            # Domain-Specific Module Folders
│   │   │   ├── auth/           # Login, Registration pages & form schemas
│   │   │   ├── clients/        # Clients listings page & add/edit form components
│   │   │   └── products/       # Products & Services registry list & forms
│   │   ├── routes/             # App routing rules & Auth/Role guards
│   │   ├── App.tsx             # Entry wrapper with Theme & Query providers
│   │   ├── index.css           # Global CSS variables & Tailwind v4 variants
│   │   └── main.tsx            # DOM root mounting
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── server/                     # Backend API Service (Express + Node.js)
│   ├── prisma/
│   │   └── schema.prisma       # Prisma DB Relational Models & PostgreSQL Sync Schema
│   ├── src/
│   │   ├── config/             # DB client initialization with Adapter adapters
│   │   ├── middlewares/        # Auth, Error handlers, & Zod validator wrappers
│   │   ├── modules/            # Domain-Specific API Modules
│   │   │   ├── auth/           # Auth controllers, services, repositories, & routes
│   │   │   ├── clients/        # Clients CRUD repository & business services
│   │   │   └── products/       # Products & Services SKU registry modules
│   │   ├── utils/              # Standard exception errors classes
│   │   └── index.ts            # App entry point mounting routes listeners
│   ├── nodemon.json
│   ├── package.json
│   └── tsconfig.json
│
└── .gitignore                  # Global Git ignore rules
```

---

## 🔄 Core Application Flows

### 1. Authentication & Tenant Membership Flow
```
User Sign Up ──> Creates User record ──> Creates Workspace ──> Creates WorkspaceMember (Role: OWNER)
```
- Access tokens are stored in React memory (15-min expiry).
- Refresh tokens are safely transmitted via HTTP-Only, Secure, SameSite=Strict cookies (7-day expiry).
- Global request interceptors automatically extract active workspace metadata to inject the `x-workspace-id` header in all backend requests.

### 2. Multi-Tenant Clients & Products Flow
- Both clients and products are constrained to the active workspace:
  - Clients are stored with unique constraints on `[workspaceId, email]`.
  - Products/Services are stored with unique constraints on `[workspaceId, sku]`.
- Input fields (e.g. rate inputs) use autofocus selection (`onFocus={(e) => e.target.select()}`) to prevent leading zero formatting bugs.

---

## 🛠️ Local Environment Setup

### 1. Prerequisites
- **Node.js** (v18+)
- **PostgreSQL** active local service (default port: `5432`)

### 2. Backend Config & Launch
1. Navigate to `/server`.
2. Create a `.env` file containing database credentials:
   ```env
   DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/ledgerly?schema=public"
   JWT_ACCESS_SECRET="your_jwt_access_secret_key_here"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret_key_here"
   PORT=5000
   ```
3. Install dependencies and push Prisma migration layout to your local DB:
   ```bash
   npm install
   npx prisma db push
   ```
4. Start dev listener:
   ```bash
   npm run dev
   ```
   The API will start running at `http://localhost:5000`.

### 3. Frontend Config & Launch
1. Navigate to `/client`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start Vite bundler:
   ```bash
   npm run dev
   ```
   The client application will start running at `http://localhost:5173`.

---

## 📐 System Architecture Diagrams

### 1. Database Entity-Relationship Diagram (ERD)
The following schema models Ledgerly's relational structures and database entities:

```mermaid
erDiagram
    User ||--o{ WorkspaceMember : belongs_to
    Workspace ||--o{ WorkspaceMember : belongs_to
    Workspace ||--o{ Client : owns
    Workspace ||--o{ Product : owns
    Workspace ||--o{ Invoice : owns
    Workspace ||--o{ Quotation : owns
    Workspace ||--o{ Expense : owns
    Workspace ||--o{ TaxRate : owns
    Workspace ||--o{ AuditLog : tracks
    User ||--o{ AuditLog : performs
    Client ||--o{ Invoice : billed_to
    Client ||--o{ Quotation : offered_to
    Invoice ||--|{ InvoiceItem : contains
    Product ||--o{ InvoiceItem : linked_to
    Quotation ||--|{ QuotationItem : contains
    Product ||--o{ QuotationItem : linked_to
    Invoice ||--o{ Payment : receives
```

### 2. Password Reset Lifecycle Sequence
The password reset lifecycle handles token generation, encryption, hashing, and database persistence:

```mermaid
sequenceDiagram
    autonumber
    actor Client as User Browser
    participant API as Express Router
    participant Service as AuthService
    participant DB as PostgreSQL

    Note over Client, DB: Forgot Password Flow
    Client->>API: POST /auth/forgot-password {email}
    API->>Service: initiatePasswordReset(email)
    Service->>DB: Find user, update resetToken & resetTokenExp
    DB-->>Service: Token saved
    Service-->>Client: Return 200 OK (Email dispatched mock)
    
    Note over Client, DB: Reset Password Flow
    Client->>API: POST /auth/reset-password {token, newPassword}
    API->>Service: resetPassword(token, newPassword)
    Service->>DB: Find user where token matches & not expired
    Service->>Service: Hash newPassword via bcrypt
    Service->>DB: Update passwordHash, clear resetToken variables
    DB-->>Service: Password updated successfully
    Service-->>Client: Return 200 OK
```

### 3. Verification & RBAC Authorization Pipeline
This execution pipeline checks user sessions, workspace memberships, and verifies roles privileges:

```mermaid
graph TD
    A[Incoming Request] --> B[requireAuth Middleware]
    B -->|Check JWT Token| C{Valid Token?}
    C -->|No| D[401 Unauthorized]
    C -->|Yes| E{x-workspace-id header present?}
    E -->|No| F[400 Bad Request]
    E -->|Yes| G{User is member of Workspace?}
    G -->|No| H[403 Forbidden]
    G -->|Yes| I[Attach req.user and req.workspaceId]
    I --> J[checkRole Middleware]
    J --> K{User role matches route requirements?}
    K -->|No| L[403 Forbidden]
    K -->|Yes| M[Route Controller Executes]
```
