# Test Setup for v2 Backend

This directory contains comprehensive test files for all backend modules:

- `modules/auth/auth.test.ts` - Authentication tests (login, logout, refresh, me)
- `modules/user/user.test.ts` - User management tests (CRUD, permissions, bulk operations)
- `modules/product/product.test.ts` - Product management tests (CRUD, filters, bulk operations)
- `modules/category/category.test.ts` - Category management tests
- `modules/role/role.test.ts` - Role management tests
- `helpers.ts` - Test helper functions and utilities

## Running Tests

### Prerequisites

Before running tests, ensure you have:
1. MariaDB/MySQL database running
2. Environment variables configured in `.env` file
3. Prisma client generated: `bun run db:generate`

### Environment Variables

Create a `.env` file with the following variables:

```
DATABASE_HOST=localhost
DATABASE_PORT=3306
DATABASE_USER=your_db_user
DATABASE_PASSWORD=your_db_password
DATABASE_NAME=your_test_database
NODE_ENV=test
```

### Run All Tests

```bash
bun test
```

### Run Specific Test Suite

```bash
# Run auth tests only
bun test tests/modules/auth/auth.test.ts

# Run user tests only
bun test tests/modules/user/user.test.ts

# Run product tests only
bun test tests/modules/product/product.test.ts

# Run category tests only
bun test tests/modules/category/category.test.ts

# Run role tests only
bun test tests/modules/role/role.test.ts
```

### Run Tests in Watch Mode

```bash
bun test --watch
```

### Run Tests with Coverage

```bash
bun test --coverage
```

## Test Database

Tests create, read, update, and delete data in the database. We recommend:

1. **Using a separate test database** to avoid affecting production data
2. **Running `db:reset` before tests** to clean the database:
   ```bash
   bun run db:reset
   bun test
   ```
3. **Using database transactions** (for future improvements) to rollback changes after each test

## Test Coverage

The test suites cover:

### Auth Module
- ✅ Login with valid credentials
- ✅ Login with invalid email
- ✅ Login with invalid password
- ✅ Login with inactive user
- ✅ Permissions for admin users
- ✅ Permissions for employee users
- ✅ Refresh token creation
- ✅ Logout with valid/invalid tokens
- ✅ Token refresh with valid token
- ✅ Token refresh with expired token
- ✅ Token refresh with invalid token
- ✅ Multiple refresh tokens handling
- ✅ User info retrieval (me endpoint)

### User Module
- ✅ List users with pagination
- ✅ Filter users by email, name, role, isActive
- ✅ Filter users by permissions
- ✅ Search users by text
- ✅ Get user by ID
- ✅ Create user with valid data
- ✅ Create user with duplicate email (error)
- ✅ Create user with weak password (error)
- ✅ Update user fields
- ✅ Update user permissions
- ✅ Delete user
- ✅ Assign permissions to user
- ✅ Bulk assign permissions
- ✅ Get all permissions
- ✅ Edge cases (invalid IDs, empty arrays, etc.)

### Product Module
- ✅ List products with pagination
- ✅ Filter by name, category, status
- ✅ Filter by price range
- ✅ Filter by stock range
- ✅ Sort by various fields
- ✅ Get filter options
- ✅ Get product by ID
- ✅ Create product
- ✅ Update product fields
- ✅ Delete product
- ✅ Bulk delete products
- ✅ Bulk update product status
- ✅ Edge cases (invalid prices, quantities, etc.)

### Category Module
- ✅ List all categories
- ✅ Get category by ID
- ✅ Create category
- ✅ Update category
- ✅ Delete category
- ✅ Find category by slug
- ✅ Edge cases (duplicate slugs, special characters)

### Role Module
- ✅ List all roles
- ✅ Get role by code
- ✅ Get role by ID
- ✅ Role constants (ADMIN, EMPLOYEE)
- ✅ Edge cases (invalid IDs, duplicate codes)

## Error Handling Tests

All test suites include comprehensive error handling tests for:
- **UNAUTHORIZED** errors - Invalid credentials, missing tokens
- **NOT_FOUND** errors - Non-existent resources
- **CONFLICT** errors - Duplicate emails, duplicate slugs
- **BAD_REQUEST** errors - Invalid input, empty arrays
- **FORBIDDEN** errors - Insufficient permissions
- **VALIDATION** errors - Invalid input format

## CI/CD Integration

For continuous integration, you can add:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - run: bun install
      - run: bun run db:generate
      - run: bun test
```
