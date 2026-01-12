/**
 * Prisma Seed Script
 * Run with: bun run db:seed
 *
 * Seeds the database with:
 * - Admin user
 * - 25 Employees with various permissions
 * - Permissions
 * - Categories (Retail focused)
 * - Sample products (120)
 */

import { Role, ProductStatus } from "../generated/prisma/client.js";
import { prisma } from "../src/config/database.ts";
import bcrypt from "bcryptjs";

// ============================================
// SEED DATA
// ============================================

const PERMISSIONS = [
  {
    name: "View Products",
    code: "PRODUCT_VIEW",
    description: "Can view product list and details",
  },
  {
    name: "Create Products",
    code: "PRODUCT_CREATE",
    description: "Can add new products",
  },
  {
    name: "Edit Products",
    code: "PRODUCT_EDIT",
    description: "Can modify existing products",
  },
  {
    name: "Delete Products",
    code: "PRODUCT_DELETE",
    description: "Can remove products",
  },
  {
    name: "Bulk Actions",
    code: "PRODUCT_BULK",
    description: "Can perform bulk delete and status updates",
  },
] as const;

const CATEGORIES = [
  { name: "Clothing", slug: "clothing" },
  { name: "Home & Living", slug: "home-living" },
  { name: "Food & Beverages", slug: "food-beverages" },
  { name: "Sports & Outdoors", slug: "sports-outdoors" },
  { name: "Beauty & Personal Care", slug: "beauty-care" },
  { name: "Books & Media", slug: "books-media" },
] as const;

// Sample products with category slug mapping
const SAMPLE_PRODUCTS = [
  // Clothing (20 products)
  { name: "Classic White T-Shirt", category: "clothing", price: 19.99, quantity: 150, stockDetails: 150, status: ProductStatus.STOCK_IN },
  { name: "Denim Jeans - Blue", category: "clothing", price: 59.99, quantity: 80, stockDetails: 80, status: ProductStatus.STOCK_IN },
  { name: "Cotton Hoodie", category: "clothing", price: 45.99, quantity: 60, stockDetails: 60, status: ProductStatus.STOCK_IN },
  { name: "Wool Winter Coat", category: "clothing", price: 129.99, quantity: 40, stockDetails: 40, status: ProductStatus.STOCK_IN },
  { name: "Leather Jacket", category: "clothing", price: 199.99, quantity: 25, stockDetails: 25, status: ProductStatus.STOCK_IN },
  { name: "Summer Dress - Floral", category: "clothing", price: 39.99, quantity: 70, stockDetails: 70, status: ProductStatus.STOCK_IN },
  { name: "Business Suit - Navy", category: "clothing", price: 249.99, quantity: 30, stockDetails: 30, status: ProductStatus.STOCK_IN },
  { name: "Athletic Shorts", category: "clothing", price: 24.99, quantity: 100, stockDetails: 100, status: ProductStatus.STOCK_IN },
  { name: "Cardigan Sweater", category: "clothing", price: 54.99, quantity: 50, stockDetails: 50, status: ProductStatus.STOCK_IN },
  { name: "Polo Shirt", category: "clothing", price: 29.99, quantity: 90, stockDetails: 90, status: ProductStatus.STOCK_IN },
  { name: "Silk Scarf", category: "clothing", price: 34.99, quantity: 0, stockDetails: 0, status: ProductStatus.STOCK_OUT },
  { name: "Cargo Pants", category: "clothing", price: 49.99, quantity: 65, stockDetails: 65, status: ProductStatus.STOCK_IN },
  { name: "Tank Top", category: "clothing", price: 16.99, quantity: 120, stockDetails: 120, status: ProductStatus.STOCK_IN },
  { name: "Blazer - Black", category: "clothing", price: 89.99, quantity: 35, stockDetails: 35, status: ProductStatus.STOCK_IN },
  { name: "Leggings - Active", category: "clothing", price: 32.99, quantity: 85, stockDetails: 85, status: ProductStatus.STOCK_IN },
  { name: "Trench Coat", category: "clothing", price: 149.99, quantity: 20, stockDetails: 20, status: ProductStatus.STOCK_IN },
  { name: "Knit Sweater", category: "clothing", price: 64.99, quantity: 45, stockDetails: 45, status: ProductStatus.STOCK_IN },
  { name: "Maxi Dress", category: "clothing", price: 44.99, quantity: 55, stockDetails: 55, status: ProductStatus.STOCK_IN },
  { name: "Chinos - Khaki", category: "clothing", price: 42.99, quantity: 75, stockDetails: 75, status: ProductStatus.STOCK_IN },
  { name: "Baseball Cap", category: "clothing", price: 22.99, quantity: 110, stockDetails: 110, status: ProductStatus.STOCK_IN },

  // Home & Living (20 products)
  { name: "Throw Pillow Set - 4 Pack", category: "home-living", price: 34.99, quantity: 80, stockDetails: 80, status: ProductStatus.STOCK_IN },
  { name: "Bed Sheet Set - Queen", category: "home-living", price: 49.99, quantity: 60, stockDetails: 60, status: ProductStatus.STOCK_IN },
  { name: "Coffee Table - Modern", category: "home-living", price: 199.99, quantity: 15, stockDetails: 15, status: ProductStatus.STOCK_IN },
  { name: "Area Rug - 8x10", category: "home-living", price: 149.99, quantity: 25, stockDetails: 25, status: ProductStatus.STOCK_IN },
  { name: "Table Lamp - LED", category: "home-living", price: 39.99, quantity: 70, stockDetails: 70, status: ProductStatus.STOCK_IN },
  { name: "Dining Chairs - Set of 4", category: "home-living", price: 179.99, quantity: 20, stockDetails: 20, status: ProductStatus.STOCK_IN },
  { name: "Kitchen Towel Set", category: "home-living", price: 19.99, quantity: 100, stockDetails: 100, status: ProductStatus.STOCK_IN },
  { name: "Curtains - Light Blocking", category: "home-living", price: 54.99, quantity: 40, stockDetails: 40, status: ProductStatus.STOCK_IN },
  { name: "Wall Art - Canvas Print", category: "home-living", price: 29.99, quantity: 50, stockDetails: 50, status: ProductStatus.STOCK_IN },
  { name: "Plant Pot - Ceramic", category: "home-living", price: 24.99, quantity: 90, stockDetails: 90, status: ProductStatus.STOCK_IN },
  { name: "Throw Blanket - Soft", category: "home-living", price: 44.99, quantity: 0, stockDetails: 0, status: ProductStatus.STOCK_OUT },
  { name: "Desk Organizer", category: "home-living", price: 27.99, quantity: 65, stockDetails: 65, status: ProductStatus.STOCK_IN },
  { name: "Bath Mat Set", category: "home-living", price: 32.99, quantity: 55, stockDetails: 55, status: ProductStatus.STOCK_IN },
  { name: "Bookshelf - 5 Tier", category: "home-living", price: 89.99, quantity: 30, stockDetails: 30, status: ProductStatus.STOCK_IN },
  { name: "Candle Set - 3 Pack", category: "home-living", price: 22.99, quantity: 85, stockDetails: 85, status: ProductStatus.STOCK_IN },
  { name: "Storage Baskets - 3 Pack", category: "home-living", price: 37.99, quantity: 45, stockDetails: 45, status: ProductStatus.STOCK_IN },
  { name: "Duvet Cover Set", category: "home-living", price: 59.99, quantity: 35, stockDetails: 35, status: ProductStatus.STOCK_IN },
  { name: "Mirror - Wall Mounted", category: "home-living", price: 74.99, quantity: 25, stockDetails: 25, status: ProductStatus.STOCK_IN },
  { name: "Vase - Glass", category: "home-living", price: 18.99, quantity: 95, stockDetails: 95, status: ProductStatus.STOCK_IN },
  { name: "Room Diffuser", category: "home-living", price: 26.99, quantity: 75, stockDetails: 75, status: ProductStatus.STOCK_IN },

  // Food & Beverages (20 products)
  { name: "Organic Coffee Beans - 1lb", category: "food-beverages", price: 16.99, quantity: 200, stockDetails: 200, status: ProductStatus.STOCK_IN },
  { name: "Green Tea - 100 Bags", category: "food-beverages", price: 12.99, quantity: 150, stockDetails: 150, status: ProductStatus.STOCK_IN },
  { name: "Honey - Raw Organic", category: "food-beverages", price: 18.99, quantity: 120, stockDetails: 120, status: ProductStatus.STOCK_IN },
  { name: "Olive Oil - Extra Virgin", category: "food-beverages", price: 24.99, quantity: 100, stockDetails: 100, status: ProductStatus.STOCK_IN },
  { name: "Pasta - Italian", category: "food-beverages", price: 8.99, quantity: 250, stockDetails: 250, status: ProductStatus.STOCK_IN },
  { name: "Granola - Organic", category: "food-beverages", price: 14.99, quantity: 180, stockDetails: 180, status: ProductStatus.STOCK_IN },
  { name: "Dark Chocolate Bar", category: "food-beverages", price: 6.99, quantity: 300, stockDetails: 300, status: ProductStatus.STOCK_IN },
  { name: "Almonds - Raw", category: "food-beverages", price: 19.99, quantity: 140, stockDetails: 140, status: ProductStatus.STOCK_IN },
  { name: "Jam - Strawberry", category: "food-beverages", price: 9.99, quantity: 160, stockDetails: 160, status: ProductStatus.STOCK_IN },
  { name: "Cereal - Whole Grain", category: "food-beverages", price: 11.99, quantity: 170, stockDetails: 170, status: ProductStatus.STOCK_IN },
  { name: "Wine - Red", category: "food-beverages", price: 29.99, quantity: 0, stockDetails: 0, status: ProductStatus.STOCK_OUT },
  { name: "Coconut Oil", category: "food-beverages", price: 15.99, quantity: 130, stockDetails: 130, status: ProductStatus.STOCK_IN },
  { name: "Protein Powder", category: "food-beverages", price: 34.99, quantity: 90, stockDetails: 90, status: ProductStatus.STOCK_IN },
  { name: "Rice - Basmati", category: "food-beverages", price: 13.99, quantity: 190, stockDetails: 190, status: ProductStatus.STOCK_IN },
  { name: "Maple Syrup - Pure", category: "food-beverages", price: 21.99, quantity: 110, stockDetails: 110, status: ProductStatus.STOCK_IN },
  { name: "Quinoa - Organic", category: "food-beverages", price: 17.99, quantity: 125, stockDetails: 125, status: ProductStatus.STOCK_IN },
  { name: "Peanut Butter - Natural", category: "food-beverages", price: 10.99, quantity: 165, stockDetails: 165, status: ProductStatus.STOCK_IN },
  { name: "Spices - Set of 12", category: "food-beverages", price: 27.99, quantity: 75, stockDetails: 75, status: ProductStatus.STOCK_IN },
  { name: "Soup Mix - Vegetable", category: "food-beverages", price: 7.99, quantity: 220, stockDetails: 220, status: ProductStatus.STOCK_IN },
  { name: "Energy Bar - 12 Pack", category: "food-beverages", price: 16.99, quantity: 145, stockDetails: 145, status: ProductStatus.STOCK_IN },

  // Sports & Outdoors (20 products)
  { name: "Yoga Mat", category: "sports-outdoors", price: 29.99, quantity: 80, stockDetails: 80, status: ProductStatus.STOCK_IN },
  { name: "Running Shoes", category: "sports-outdoors", price: 89.99, quantity: 50, stockDetails: 50, status: ProductStatus.STOCK_IN },
  { name: "Dumbbell Set - 20lb", category: "sports-outdoors", price: 49.99, quantity: 40, stockDetails: 40, status: ProductStatus.STOCK_IN },
  { name: "Backpack - Hiking", category: "sports-outdoors", price: 79.99, quantity: 35, stockDetails: 35, status: ProductStatus.STOCK_IN },
  { name: "Water Bottle - Insulated", category: "sports-outdoors", price: 24.99, quantity: 100, stockDetails: 100, status: ProductStatus.STOCK_IN },
  { name: "Tennis Racket", category: "sports-outdoors", price: 119.99, quantity: 25, stockDetails: 25, status: ProductStatus.STOCK_IN },
  { name: "Basketball", category: "sports-outdoors", price: 34.99, quantity: 60, stockDetails: 60, status: ProductStatus.STOCK_IN },
  { name: "Resistance Bands Set", category: "sports-outdoors", price: 19.99, quantity: 90, stockDetails: 90, status: ProductStatus.STOCK_IN },
  { name: "Camping Tent - 4 Person", category: "sports-outdoors", price: 199.99, quantity: 15, stockDetails: 15, status: ProductStatus.STOCK_IN },
  { name: "Jump Rope", category: "sports-outdoors", price: 14.99, quantity: 110, stockDetails: 110, status: ProductStatus.STOCK_IN },
  { name: "Cycling Helmet", category: "sports-outdoors", price: 54.99, quantity: 0, stockDetails: 0, status: ProductStatus.STOCK_OUT },
  { name: "Exercise Ball", category: "sports-outdoors", price: 27.99, quantity: 55, stockDetails: 55, status: ProductStatus.STOCK_IN },
  { name: "Fishing Rod", category: "sports-outdoors", price: 69.99, quantity: 30, stockDetails: 30, status: ProductStatus.STOCK_IN },
  { name: "Golf Balls - 12 Pack", category: "sports-outdoors", price: 24.99, quantity: 70, stockDetails: 70, status: ProductStatus.STOCK_IN },
  { name: "Foam Roller", category: "sports-outdoors", price: 32.99, quantity: 45, stockDetails: 45, status: ProductStatus.STOCK_IN },
  { name: "Hiking Boots", category: "sports-outdoors", price: 129.99, quantity: 20, stockDetails: 20, status: ProductStatus.STOCK_IN },
  { name: "Soccer Ball", category: "sports-outdoors", price: 29.99, quantity: 65, stockDetails: 65, status: ProductStatus.STOCK_IN },
  { name: "Yoga Block Set", category: "sports-outdoors", price: 18.99, quantity: 85, stockDetails: 85, status: ProductStatus.STOCK_IN },
  { name: "Treadmill Mat", category: "sports-outdoors", price: 39.99, quantity: 40, stockDetails: 40, status: ProductStatus.STOCK_IN },
  { name: "Paddle Board", category: "sports-outdoors", price: 449.99, quantity: 10, stockDetails: 10, status: ProductStatus.STOCK_IN },

  // Beauty & Personal Care (20 products)
  { name: "Face Moisturizer", category: "beauty-care", price: 24.99, quantity: 120, stockDetails: 120, status: ProductStatus.STOCK_IN },
  { name: "Shampoo - Volumizing", category: "beauty-care", price: 16.99, quantity: 150, stockDetails: 150, status: ProductStatus.STOCK_IN },
  { name: "Sunscreen SPF 50", category: "beauty-care", price: 19.99, quantity: 130, stockDetails: 130, status: ProductStatus.STOCK_IN },
  { name: "Lipstick - Red", category: "beauty-care", price: 14.99, quantity: 100, stockDetails: 100, status: ProductStatus.STOCK_IN },
  { name: "Face Cleanser", category: "beauty-care", price: 18.99, quantity: 140, stockDetails: 140, status: ProductStatus.STOCK_IN },
  { name: "Body Lotion", category: "beauty-care", price: 12.99, quantity: 160, stockDetails: 160, status: ProductStatus.STOCK_IN },
  { name: "Hair Dryer", category: "beauty-care", price: 49.99, quantity: 60, stockDetails: 60, status: ProductStatus.STOCK_IN },
  { name: "Nail Polish Set - 6 Colors", category: "beauty-care", price: 22.99, quantity: 80, stockDetails: 80, status: ProductStatus.STOCK_IN },
  { name: "Face Mask - Clay", category: "beauty-care", price: 15.99, quantity: 110, stockDetails: 110, status: ProductStatus.STOCK_IN },
  { name: "Perfume - Eau de Toilette", category: "beauty-care", price: 59.99, quantity: 40, stockDetails: 40, status: ProductStatus.STOCK_IN },
  { name: "Electric Razor", category: "beauty-care", price: 79.99, quantity: 0, stockDetails: 0, status: ProductStatus.STOCK_OUT },
  { name: "Toothbrush - Electric", category: "beauty-care", price: 39.99, quantity: 70, stockDetails: 70, status: ProductStatus.STOCK_IN },
  { name: "Hand Cream", category: "beauty-care", price: 11.99, quantity: 145, stockDetails: 145, status: ProductStatus.STOCK_IN },
  { name: "Eye Cream", category: "beauty-care", price: 29.99, quantity: 90, stockDetails: 90, status: ProductStatus.STOCK_IN },
  { name: "Hairbrush - Detangling", category: "beauty-care", price: 17.99, quantity: 105, stockDetails: 105, status: ProductStatus.STOCK_IN },
  { name: "Makeup Brush Set", category: "beauty-care", price: 34.99, quantity: 50, stockDetails: 50, status: ProductStatus.STOCK_IN },
  { name: "Deodorant - Natural", category: "beauty-care", price: 9.99, quantity: 175, stockDetails: 175, status: ProductStatus.STOCK_IN },
  { name: "Face Toner", category: "beauty-care", price: 16.99, quantity: 125, stockDetails: 125, status: ProductStatus.STOCK_IN },
  { name: "Hair Serum", category: "beauty-care", price: 21.99, quantity: 95, stockDetails: 95, status: ProductStatus.STOCK_IN },
  { name: "Shower Gel", category: "beauty-care", price: 13.99, quantity: 155, stockDetails: 155, status: ProductStatus.STOCK_IN },

  // Books & Media (20 products)
  { name: "Novel - Mystery Thriller", category: "books-media", price: 14.99, quantity: 80, stockDetails: 80, status: ProductStatus.STOCK_IN },
  { name: "Cookbook - Italian Cuisine", category: "books-media", price: 24.99, quantity: 60, stockDetails: 60, status: ProductStatus.STOCK_IN },
  { name: "Children's Picture Book", category: "books-media", price: 12.99, quantity: 100, stockDetails: 100, status: ProductStatus.STOCK_IN },
  { name: "Science Fiction Paperback", category: "books-media", price: 13.99, quantity: 75, stockDetails: 75, status: ProductStatus.STOCK_IN },
  { name: "Self-Help Book", category: "books-media", price: 16.99, quantity: 90, stockDetails: 90, status: ProductStatus.STOCK_IN },
  { name: "Historical Biography", category: "books-media", price: 19.99, quantity: 55, stockDetails: 55, status: ProductStatus.STOCK_IN },
  { name: "Graphic Novel", category: "books-media", price: 21.99, quantity: 65, stockDetails: 65, status: ProductStatus.STOCK_IN },
  { name: "Poetry Collection", category: "books-media", price: 15.99, quantity: 70, stockDetails: 70, status: ProductStatus.STOCK_IN },
  { name: "Travel Guide Book", category: "books-media", price: 18.99, quantity: 50, stockDetails: 50, status: ProductStatus.STOCK_IN },
  { name: "Business Strategy Book", category: "books-media", price: 22.99, quantity: 45, stockDetails: 45, status: ProductStatus.STOCK_IN },
  { name: "Music CD - Pop Album", category: "books-media", price: 12.99, quantity: 0, stockDetails: 0, status: ProductStatus.STOCK_OUT },
  { name: "DVD Movie - Classic", category: "books-media", price: 9.99, quantity: 85, stockDetails: 85, status: ProductStatus.STOCK_IN },
  { name: "Audiobook - Fiction", category: "books-media", price: 24.99, quantity: 40, stockDetails: 40, status: ProductStatus.STOCK_IN },
  { name: "Vinyl Record - Jazz", category: "books-media", price: 29.99, quantity: 30, stockDetails: 30, status: ProductStatus.STOCK_IN },
  { name: "Magazine Subscription", category: "books-media", price: 19.99, quantity: 95, stockDetails: 95, status: ProductStatus.STOCK_IN },
  { name: "Comic Book Series", category: "books-media", price: 11.99, quantity: 110, stockDetails: 110, status: ProductStatus.STOCK_IN },
  { name: "Educational Textbook", category: "books-media", price: 49.99, quantity: 35, stockDetails: 35, status: ProductStatus.STOCK_IN },
  { name: "Art Book - Photography", category: "books-media", price: 39.99, quantity: 25, stockDetails: 25, status: ProductStatus.STOCK_IN },
  { name: "E-book Reader Case", category: "books-media", price: 17.99, quantity: 75, stockDetails: 75, status: ProductStatus.STOCK_IN },
  { name: "Bookmark Set - Leather", category: "books-media", price: 8.99, quantity: 120, stockDetails: 120, status: ProductStatus.STOCK_IN },
] as const;

// ============================================
// SEED FUNCTIONS
// ============================================

async function seedPermissions() {
  console.log("Seeding permissions...");

  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { code: perm.code },
      update: {},
      create: perm,
    });
  }

  console.log(`✓ ${PERMISSIONS.length} permissions seeded`);
}

async function seedAdminUser() {
  console.log("Seeding admin user...");

  const hashedPassword = await bcrypt.hash("Admin@123", 12);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Michael Anderson",
      role: Role.ADMIN,
      isActive: true,
    },
  });

  console.log("✓ Admin user seeded (admin@example.com / Admin@123)");
}

async function seedEmployees() {
  console.log("Seeding 25 employees...");

  const employeeNames = [
    "Sarah Mitchell",
    "James Chen",
    "Emily Rodriguez",
    "David Kim",
    "Lisa Thompson",
    "Robert Martinez",
    "Jennifer Lee",
    "Christopher Brown",
    "Amanda White",
    "Michael Garcia",
    "Jessica Anderson",
    "Daniel Taylor",
    "Michelle Wilson",
    "Andrew Johnson",
    "Nicole Davis",
    "Matthew Jackson",
    "Stephanie Moore",
    "Ryan Miller",
    "Lauren Harris",
    "Kevin Thomas",
    "Rachel Clark",
    "Justin Lewis",
    "Samantha Walker",
    "Brandon Hall",
    "Ashley Young",
  ];

  const hashedPassword = await bcrypt.hash("Employee@123", 12);

  const permissions = await prisma.permission.findMany();
  const permMap = new Map(permissions.map(p => [p.code, p.id]));

  const createdEmployees = [];

  for (let i = 0; i < employeeNames.length; i++) {
    const name = employeeNames[i]!;
    const email = i === 0 
      ? "employee@example.com"
      : `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;

    const employee = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        email,
        password: hashedPassword,
        name,
        role: Role.EMPLOYEE,
        isActive: Math.random() > 0.1,
      },
    });

    createdEmployees.push(employee);

    // Assign random permissions based on index
    const employeePerms = [];

    // All employees get VIEW permission
    if (permMap.has("PRODUCT_VIEW")) {
      employeePerms.push({ userId: employee.id, permissionId: permMap.get("PRODUCT_VIEW")! });
    }

    // Assign CREATE permission to first 20 employees
    if (i < 20 && permMap.has("PRODUCT_CREATE")) {
      employeePerms.push({ userId: employee.id, permissionId: permMap.get("PRODUCT_CREATE")! });
    }

    // Assign EDIT permission to first 15 employees
    if (i < 15 && permMap.has("PRODUCT_EDIT")) {
      employeePerms.push({ userId: employee.id, permissionId: permMap.get("PRODUCT_EDIT")! });
    }

    // Assign DELETE permission to first 10 employees
    if (i < 10 && permMap.has("PRODUCT_DELETE")) {
      employeePerms.push({ userId: employee.id, permissionId: permMap.get("PRODUCT_DELETE")! });
    }

    // Assign BULK permission to first 5 employees
    if (i < 5 && permMap.has("PRODUCT_BULK")) {
      employeePerms.push({ userId: employee.id, permissionId: permMap.get("PRODUCT_BULK")! });
    }

    // Create user permissions
    for (const perm of employeePerms) {
      await prisma.userPermission.upsert({
        where: {
          userId_permissionId: { userId: perm.userId, permissionId: perm.permissionId }
        },
        update: {},
        create: perm,
      });
    }
  }

  console.log(`✓ ${createdEmployees.length} employees seeded`);
  console.log(`  Email: employee@example.com (first employee), others use name-based emails`);
  console.log(`  Password: Employee@123`);
  console.log(`  Active users: ${createdEmployees.filter(e => e.isActive).length}`);
  console.log(`  Inactive users: ${createdEmployees.filter(e => !e.isActive).length}`);
}

async function seedCategories() {
  console.log("Seeding categories...");

  for (const cat of CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  console.log(`✓ ${CATEGORIES.length} categories seeded`);
}

async function seedProducts() {
  console.log("Seeding products...");

  // Get all categories for mapping
  const categories = await prisma.category.findMany();
  const categoryMap = new Map(categories.map((c) => [c.slug, c.id]));

  for (let i = 0; i < SAMPLE_PRODUCTS.length; i++) {
    const product = SAMPLE_PRODUCTS[i]!;
    const productId = `PRD${String(i + 1).padStart(3, "0")}`;
    const categoryId = categoryMap.get(product.category);

    if (!categoryId) {
      console.warn(`Category not found for product: ${product.name}`);
      continue;
    }

    await prisma.product.upsert({
      where: { productId },
      update: {},
      create: {
        productId,
        name: product.name,
        categoryId,
        price: product.price,
        quantity: product.quantity,
        stockDetails: product.stockDetails,
        status: product.status,
        imageUrl: null, // No default images
      },
    });
  }

  console.log(`✓ ${SAMPLE_PRODUCTS.length} products seeded`);
}

// ============================================
// MAIN
// ============================================

async function main() {
  console.log("\n🌱 Starting database seed...\n");

  try {
    await seedPermissions();
    await seedAdminUser();
    await seedEmployees();
    await seedCategories();
    await seedProducts();

    console.log("\n✅ Database seeded successfully!\n");

    // Print summary
    const userCount = await prisma.user.count();
    const permCount = await prisma.permission.count();
    const catCount = await prisma.category.count();
    const prodCount = await prisma.product.count();

    console.log("Summary:");
    console.log(`  Users: ${userCount} (1 Admin + 25 Employees)`);
    console.log(`  Permissions: ${permCount}`);
    console.log(`  Categories: ${catCount}`);
    console.log(`  Products: ${prodCount}`);
    console.log("\nDefault credentials:");
    console.log("  Admin: admin@example.com / Admin@123");
    console.log("  Employee: employee@example.com / Employee@123");
    console.log("  Other employees: [firstname].[lastname]@example.com / Employee@123");
    console.log("");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
