# Product Management System

A full-stack product management application with role-based access control (RBAC), permission-based features, and comprehensive admin/employee management capabilities.

## 🚀 Features

- **Role-Based Access Control (RBAC)**: Admin and Employee roles with granular permissions
- **Permission Management**: Fine-grained product permissions (View, Create, Edit, Delete, Bulk Actions)
- **User Management**: Create, edit, and manage employees with permission assignments
- **Product Management**: Full CRUD operations with bulk actions and filtering
- **Advanced Filtering**: Server-driven filtering with real-time search capabilities
- **Bulk Operations**: Bulk status updates, deletions, and permission assignments
- **Image Upload**: Product image management with file uploads
- **Responsive Design**: Mobile-first design with sticky columns for data tables
- **Dark Mode**: Theme support with light/dark mode toggle
- **Type-Safe API**: End-to-end type safety with tRPC

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js (Bun compatible)
- **Framework**: Express.js
- **API**: tRPC v11
- **Database**: MySQL/MariaDB with Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **File Upload**: Multer

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: Radix UI
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Tables**: TanStack Table
- **Forms**: React Hook Form + Zod
- **API Client**: tRPC React Query
- **Charts**: Recharts

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MySQL** database
- **Git**

> **Note**: This project is optimized for Bun runtime but works with Node.js. All commands use npm for compatibility.

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd product-management
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd backend
npm install
```

#### Environment Configuration

Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```env
# Database Configuration
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=product_management

# JWT Configuration
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000

# Optional: Logging
LOG_LEVEL=debug

# Optional: Prisma Query Logging
# Controls SQL query logging in terminal
# Options: "off" (disable all), "query" (queries only), "error" (errors only), 
#          "query,error,warn" (multiple types), or leave unset for default behavior
# Default in dev: logs queries, errors, and warnings
# Default in prod: logs errors only
PRISMA_LOG=query,error,warn
```

#### Database Setup

Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

Seed the database with initial data:

```bash
npm run db:seed
```

#### Start the Backend Server

```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd frontend
npm install
```

#### Environment Configuration

Copy the `.env.example` file to create your `.env` file:

```bash
cp .env.example .env
```

Then edit the `.env` file with your configuration:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

#### Start the Frontend Development Server

```bash
npm run dev
```

The frontend application will be available at `http://localhost:3000`

## 👤 Default Login Credentials

The database seed includes default users for testing:

### Admin Account
- **Email**: `admin@example.com`
- **Password**: `Admin@123`
- **Permissions**: Full access to all features

### Employee Account
- **Email**: `employee1@example.com`
- **Password**: `Employee@123`
- **Permissions**: View-only access (can be modified)

## 📁 Project Structure

```
product-management/
├── backend/
│   ├── src/
│   │   ├── config/          # Configuration files
│   │   ├── lib/              # Utility libraries
│   │   ├── middleware/       # Express middleware
│   │   ├── modules/          # Feature modules
│   │   ├── schemas/          # Zod validation schemas
│   │   ├── trpc/             # tRPC routers and context
│   │   └── index.ts          # Entry point
│   ├── prisma/
│   │   ├── schema.prisma     # Database schema
│   │   └── seed.ts           # Database seed script
│   └── package.json
├── frontend/
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   ├── features/             # Feature modules
│   ├── lib/                  # Utilities and configurations
│   ├── store/                # Zustand stores
│   └── package.json
└── README.md
```

## 🧪 Available Scripts

### Backend Scripts

```bash
# Development
npm run dev              # Start development server with watch mode

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (⚠️ deletes all data)

# Build & Production
npm run build            # Build for production
npm run start            # Start production server

# Testing
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Code Quality
npm run typecheck        # Type check without emitting files
```

### Frontend Scripts

```bash
# Development
npm run dev              # Start Next.js development server

# Build & Production
npm run build            # Build for production
npm run start            # Start production server

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
npm run format:check     # Check code formatting
```

## 🔐 Authentication & Authorization

### Authentication Flow

1. **Login**: User credentials are validated, and JWT tokens are issued
2. **Access Token**: Stored in memory (client-side), short-lived (15 minutes)
3. **Refresh Token**: Stored in HttpOnly cookie, long-lived (7 days)
4. **Auto Refresh**: Access token is automatically refreshed using refresh token on expiry

### Permission System

The system uses a custom RBAC implementation with the following permissions:

- `PRODUCT_VIEW`: View products
- `PRODUCT_CREATE`: Create new products
- `PRODUCT_EDIT`: Edit existing products
- `PRODUCT_DELETE`: Delete products
- `PRODUCT_BULK`: Perform bulk operations (requires Edit or Delete)

### Role Hierarchy

- **ADMIN**: Full access to all features, can manage users and permissions
- **EMPLOYEE**: Limited access based on assigned permissions

## 🗄️ Database Schema

The application uses Prisma ORM with MySQL/MariaDB. Key models include:

- **User**: User accounts with roles and permissions
- **Product**: Product catalog with images and metadata
- **Permission**: Permission definitions
- **Role**: Role definitions (currently ADMIN and EMPLOYEE)

## 🧩 API Documentation

The API uses tRPC for type-safe endpoints. All endpoints are accessible via:

- **Base URL**: `http://localhost:5000/trpc`
- **Format**: tRPC batch requests

### Main Endpoints

- `auth.*`: Authentication (login, refresh, logout)
- `user.*`: User management
- `product.*`: Product CRUD operations
- `permission.*`: Permission management

## 🎨 UI Components

The frontend uses a custom component library built on Radix UI:

- **Data Tables**: Sticky columns, filtering, pagination
- **Forms**: React Hook Form integration with Zod validation
- **Modals**: Dialog components for create/edit operations
- **Command Bar**: Keyboard shortcuts for common actions
- **Theme Toggle**: Light/dark mode support

## 🚢 Deployment

### Backend Deployment

1. Set production environment variables
2. Build the application: `npm run build`
3. Run migrations: `npm run db:migrate:prod`
4. Start the server: `npm run start`

### Frontend Deployment

1. Set `NEXT_PUBLIC_API_URL` to your production backend URL
2. Build the application: `npm run build`
3. Start the server: `npm run start`

Or deploy to Vercel/Netlify with environment variables configured.

## 📝 Code Style

- **ESLint**: Configured with Next.js and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **TypeScript**: Strict mode enabled
- **Conventions**: Follow existing code patterns and naming conventions

## 🐛 Troubleshooting

### Backend Issues

- **Database Connection**: Verify database credentials in `.env`
- **Port Already in Use**: Change `PORT` in `.env` or stop the conflicting process
- **Prisma Errors**: Run `npm run db:generate` after schema changes

### Frontend Issues

- **API Connection**: Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- **CORS Errors**: Ensure `FRONTEND_URL` in backend `.env` matches frontend URL
- **Build Errors**: Clear `.next` folder and rebuild

**Note**: For Bun users, you can replace `npm` commands with `bun` for faster execution. The project is fully compatible with both Node.js and Bun runtimes.