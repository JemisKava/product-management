import { prisma } from '../src/config/database.ts';
import { hashPassword } from '../src/lib/password.ts';
import { generateAccessToken, generateRefreshToken } from '../src/lib/jwt.ts';

export const TEST_USER = {
  admin: {
    email: 'admin@test.com',
    password: 'Admin@123',
    name: 'Test Admin',
    role: 'ADMIN' as const,
  },
  employee: {
    email: 'employee@test.com',
    password: 'Employee@123',
    name: 'Test Employee',
    role: 'EMPLOYEE' as const,
  },
};

export const TEST_CATEGORY = {
  name: 'Test Category',
  slug: 'test-category',
};

export const TEST_PRODUCT = {
  name: 'Test Product',
  price: 99.99,
  quantity: 10,
  stockDetails: 15,
  status: 'STOCK_IN' as const,
};

export async function setupTestDatabase() {
  await prisma.userPermission.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
}

export async function teardownTestDatabase() {
  await prisma.userPermission.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.user.deleteMany();
  await prisma.$disconnect();
}

export async function createTestPermissions() {
  const permissions = [
    { name: 'View Products', code: 'PRODUCT_VIEW', description: 'Can view products' },
    { name: 'Create Products', code: 'PRODUCT_CREATE', description: 'Can create products' },
    { name: 'Edit Products', code: 'PRODUCT_EDIT', description: 'Can edit products' },
    { name: 'Delete Products', code: 'PRODUCT_DELETE', description: 'Can delete products' },
    { name: 'Bulk Products', code: 'PRODUCT_BULK', description: 'Can perform bulk operations' },
  ];

  const created = await Promise.all(
    permissions.map((p) => prisma.permission.upsert({
      where: { code: p.code },
      update: {},
      create: p,
    }))
  );

  return created;
}

export async function createTestUser(email: string, password: string, name: string, role: 'ADMIN' | 'EMPLOYEE', isActive = true) {
  const hashedPassword = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      isActive,
    },
  });

  return user;
}

export async function createTestAdmin() {
  await createTestPermissions();
  const admin = await createTestUser(
    TEST_USER.admin.email,
    TEST_USER.admin.password,
    TEST_USER.admin.name,
    TEST_USER.admin.role
  );
  return admin;
}

export async function createTestEmployee(permissionCodes: string[] = ['PRODUCT_VIEW']) {
  const permissions = await createTestPermissions();
  const employee = await createTestUser(
    TEST_USER.employee.email,
    TEST_USER.employee.password,
    TEST_USER.employee.name,
    TEST_USER.employee.role
  );

  const permissionRecords = permissions.filter((p) => permissionCodes.includes(p.code));
  await prisma.userPermission.createMany({
    data: permissionRecords.map((p) => ({
      userId: employee.id,
      permissionId: p.id,
    })),
  });

  return employee;
}

export async function createTestCategory() {
  const category = await prisma.category.create({
    data: TEST_CATEGORY,
  });
  return category;
}

export async function createTestProduct(categoryId: number, overrides = {}) {
  const product = await prisma.product.create({
    data: {
      ...TEST_PRODUCT,
      categoryId,
      productId: `PRD${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      ...overrides,
    },
  });
  return product;
}

export async function createTestRefreshToken(userId: string, expiresAt: Date) {
  const refreshToken = generateRefreshToken({ userId: parseInt(userId) });
  const hashedToken = await hashPassword(refreshToken);

  const token = await prisma.refreshToken.create({
    data: {
      userId: parseInt(userId),
      token: hashedToken,
      expiresAt,
    },
  });

  return { token: refreshToken, dbToken: token };
}

export function getAuthToken(user: { id: number; email: string; name: string; role: string }, permissions: string[]) {
  return generateAccessToken({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role as 'ADMIN' | 'EMPLOYEE',
    permissions,
  });
}
