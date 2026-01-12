# Backend - Product Management System

The backend API for the Product Management System, built with Express.js, tRPC, and Prisma ORM.

## 🚀 Features

- **RESTful API**: Type-safe API with tRPC v11
- **Authentication**: JWT-based authentication with access and refresh tokens
- **Role-Based Access Control (RBAC)**: Admin and Employee roles with granular permissions
- **Permission Management**: Fine-grained product permissions (View, Create, Edit, Delete, Bulk Actions)
- **User Management**: Create, edit, and manage employees with permission assignments
- **Product Management**: Full CRUD operations with bulk actions and filtering
- **Category Management**: Product category management
- **Advanced Filtering**: Server-driven filtering with real-time search capabilities
- **Bulk Operations**: Bulk status updates, deletions, and permission assignments
- **Image Upload**: Product image management with file uploads using Multer
- **Database**: MySQL/MariaDB with Prisma ORM

## 🛠️ Tech Stack

- **Runtime**: Node.js (Bun compatible)
- **Framework**: Express.js
- **API**: tRPC v11
- **Database**: MySQL/MariaDB with Prisma ORM
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **File Upload**: Multer
- **Language**: TypeScript

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** (v9 or higher) or **yarn**
- **MySQL** database
- **Git**

> **Note**: This project is optimized for Bun runtime but works with Node.js. All commands use npm for compatibility.

## 🚀 Getting Started

### Install Dependencies

```bash
cd backend
npm install
```

### Environment Configuration

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

### Database Setup

Generate Prisma client and push schema:

```bash
npm run db:generate
npm run db:push
```

Seed the database with initial data:

```bash
npm run db:seed
```

### Start the Backend Server

```bash
npm run dev
```

The backend API will be available at `http://localhost:5000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   ├── cors.ts      # CORS configuration
│   │   ├── database.ts  # Database connection
│   │   └── env.ts       # Environment variables
│   ├── lib/             # Utility libraries
│   │   ├── errors.ts    # Error handling utilities
│   │   ├── jwt.ts       # JWT token utilities
│   │   ├── logger.ts    # Logging utilities
│   │   ├── password.ts  # Password hashing utilities
│   │   └── productId.ts # Product ID generation
│   ├── middleware/      # Express middleware
│   │   ├── error.ts     # Error handling middleware
│   │   ├── request-id.ts # Request ID middleware
│   │   ├── request-logger.ts # Request logging
│   │   ├── require-permission.ts # Permission middleware
│   │   └── upload.ts    # File upload middleware
│   ├── modules/         # Feature modules
│   │   ├── auth/        # Authentication module
│   │   │   ├── auth.router.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.repo.ts
│   │   │   ├── auth.schema.ts
│   │   │   └── auth.types.ts
│   │   ├── user/        # User management module
│   │   ├── product/     # Product management module
│   │   ├── category/    # Category management module
│   │   ├── role/        # Role management module
│   │   └── permission/  # Permission management module
│   ├── routers/         # tRPC routers and context
│   │   ├── index.ts     # Main router combining all modules
│   │   ├── trpc.ts      # tRPC initialization
│   │   └── context.ts   # Context creation
│   ├── app.ts           # Express app setup
│   └── index.ts         # Entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Database seed script
├── tests/               # Test files
│   ├── setup.ts         # Test setup
│   └── modules/         # Module-specific tests
├── uploads/             # Uploaded files directory
└── package.json
```

## 🧪 Available Scripts

### Development

```bash
npm run dev              # Start development server with watch mode
```

### Database

```bash
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema changes to database
npm run db:seed          # Seed database with initial data
npm run db:studio        # Open Prisma Studio
npm run db:reset         # Reset database (⚠️ deletes all data)
```

### Build & Production

```bash
npm run build            # Build for production
npm run start            # Start production server
```

### Testing

```bash
npm run test             # Run tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Run tests with coverage
```

### Code Quality

```bash
npm run typecheck        # Type check without emitting files
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
- **Category**: Product categories
- **Permission**: Permission definitions
- **Role**: Role definitions (currently ADMIN and EMPLOYEE)
- **UserPermission**: Junction table for user-permission relationships
- **RefreshToken**: Refresh token storage

## 🧩 API Documentation

The API uses tRPC for type-safe endpoints. All endpoints are accessible via:

- **Base URL**: `http://localhost:5000/trpc`
- **Format**: tRPC batch requests

### Main Endpoints

- `auth.*`: Authentication (login, refresh, logout, me)
- `user.*`: User management (list, create, update, delete, permissions)
- `product.*`: Product CRUD operations (list, create, update, delete, bulk operations)
- `category.*`: Category management
- `permission.*`: Permission management
- `role.*`: Role management

### Module Architecture

Each module follows a consistent structure:

- **Router** (`*.router.ts`): tRPC router definitions, handles HTTP/tRPC concerns
- **Service** (`*.service.ts`): Business logic layer
- **Repository** (`*.repo.ts`): Data access layer, Prisma queries
- **Schema** (`*.schema.ts`): Zod validation schemas
- **Types** (`*.types.ts`): TypeScript type definitions

## 🚢 Deployment

### Production Setup

1. Set production environment variables in `.env`
2. Build the application: `npm run build`
3. Run migrations: `npm run db:push` (or use Prisma migrations)
4. Start the server: `npm run start`

### Environment Variables

Ensure all required environment variables are set in production:

- Database connection details
- JWT secrets (use strong, unique secrets)
- Server port
- Frontend URL for CORS
- Log level

### Docker (Optional)

You can containerize the backend using Docker. Ensure to:

- Set environment variables in the container
- Mount the uploads directory for file persistence
- Configure database connection to external MySQL instance

## 🐛 Troubleshooting

### Database Connection Issues

- **Verify database credentials** in `.env`
- **Check database is running** and accessible
- **Verify network connectivity** to database host
- **Check database exists** and user has proper permissions

### Port Already in Use

- Change `PORT` in `.env` to an available port
- Or stop the conflicting process using the port

### Prisma Errors

- Run `npm run db:generate` after schema changes
- Ensure database is accessible before running migrations
- Check Prisma schema syntax

### JWT Token Issues

- Verify `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET` are set
- Ensure secrets are at least 32 characters long
- Check token expiration settings

### File Upload Issues

- Ensure `uploads/` directory exists and is writable
- Check file size limits in upload middleware
- Verify Multer configuration

## 📝 Code Style

- **ESLint**: Configured with TypeScript rules
- **TypeScript**: Strict mode enabled
- **Conventions**: Follow existing code patterns and naming conventions
- **Module Structure**: Each feature in its own module with clear separation of concerns

## 🧪 Testing

Tests are located in the `tests/` directory and organized by module:

```bash
npm run test             # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report
```

Test structure mirrors the source code structure for easy navigation.

## 📚 Additional Resources

- [tRPC Documentation](https://trpc.io)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com)
- [Zod Documentation](https://zod.dev)

---

**Note**: For Bun users, you can replace `npm` commands with `bun` for faster execution. The project is fully compatible with both Node.js and Bun runtimes.
