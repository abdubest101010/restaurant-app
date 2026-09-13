import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

const prisma = new PrismaClient();

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function signPayload(payload: object, secret: string) {
  const data = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', secret).update(data).digest('hex');
  const encoded = Buffer.from(data).toString('base64url');
  return `${encoded}.${signature}`;
}

async function upsertUser(email: string, displayName: string, password: string) {
  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.upsert({
    where: { email },
    update: { displayName },
    create: {
      email,
      displayName,
      isEmailVerified: true,
      authIdentities: { create: { provider: 'password', passwordHash } },
    },
  });

  const identity = await prisma.authIdentity.findFirst({
    where: { userId: user.id, provider: 'password' },
  });
  if (identity) {
    await prisma.authIdentity.update({
      where: { id: identity.id },
      data: { passwordHash },
    });
  }

  return user;
}

async function ensureRole(userId: string, roleCode: string, restaurantId?: string, branchId?: string) {
  const role = await prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
  const existing = await prisma.userRole.findFirst({
    where: { userId, roleId: role.id, restaurantId: restaurantId ?? null, branchId: branchId ?? null },
  });
  if (!existing) {
    await prisma.userRole.create({
      data: { userId, roleId: role.id, restaurantId, branchId },
    });
  }
}

async function main() {
  console.log('Seeding TableBite...');

  const roles = [
    { code: 'platform_superadmin', name: 'Platform Super Admin' },
    { code: 'platform_moderator', name: 'Platform Moderator' },
    { code: 'owner', name: 'Restaurant Owner' },
    { code: 'manager', name: 'Restaurant Manager' },
    { code: 'kitchen', name: 'Kitchen Staff' },
    { code: 'waiter', name: 'Waiter' },
    { code: 'customer', name: 'Customer' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({ where: { code: role.code }, update: { name: role.name }, create: role });
  }

  const adminUser = await upsertUser('admin@tablebite.com', 'Platform Admin', 'admin123');
  await ensureRole(adminUser.id, 'platform_superadmin');

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: 'demo-bistro' },
    update: { name: 'Demo Bistro', status: 'active', commissionRate: 0.05 },
    create: {
      name: 'Demo Bistro',
      slug: 'demo-bistro',
      status: 'active',
      commissionRate: 0.05,
    },
  });

  const branch = await prisma.branch.upsert({
    where: { restaurantId_slug: { restaurantId: restaurant.id, slug: 'main' } },
    update: {
      name: 'Main Location',
      timezone: 'America/New_York',
      address: '123 Main Street, New York, NY 10001',
      phone: '+1-555-0100',
      status: 'active',
    },
    create: {
      restaurantId: restaurant.id,
      name: 'Main Location',
      slug: 'main',
      timezone: 'America/New_York',
      address: '123 Main Street, New York, NY 10001',
      phone: '+1-555-0100',
      status: 'active',
    },
  });

  for (let i = 0; i < 7; i++) {
    await prisma.branchHours.upsert({
      where: { branchId_dayOfWeek: { branchId: branch.id, dayOfWeek: i } },
      update: { openTime: '09:00', closeTime: '22:00', isClosed: false },
      create: { branchId: branch.id, dayOfWeek: i, openTime: '09:00', closeTime: '22:00', isClosed: false },
    });
  }

  const ownerUser = await upsertUser('owner@demobistro.com', 'Demo Owner', 'owner123');
  await ensureRole(ownerUser.id, 'owner', restaurant.id);

  const kitchenUser = await upsertUser('kitchen@demobistro.com', 'Kitchen Lead', 'kitchen123');
  await ensureRole(kitchenUser.id, 'kitchen', restaurant.id, branch.id);

  const waiterUser = await upsertUser('waiter@demobistro.com', 'Floor Waiter', 'waiter123');
  await ensureRole(waiterUser.id, 'waiter', restaurant.id, branch.id);

  const customerUser = await upsertUser('guest@example.com', 'Alex Guest', 'guest123');
  await ensureRole(customerUser.id, 'customer');

  const categoryDefs = [
    {
      name: 'Appetizers',
      sortOrder: 1,
      items: [
        {
          name: 'Bruschetta',
          description: 'Toasted bread with fresh tomatoes, basil, and olive oil',
          basePrice: 8.99,
          dietaryTags: ['vegetarian'],
          isFeatured: true,
          image: 'https://images.unsplash.com/photo-1572695157366-7035f6145f47?w=400',
        },
        {
          name: 'Calamari Fritti',
          description: 'Crispy fried calamari with marinara sauce',
          basePrice: 12.99,
          dietaryTags: [],
        },
      ],
    },
    {
      name: 'Main Courses',
      sortOrder: 2,
      items: [
        {
          name: 'Grilled Salmon',
          description: 'Atlantic salmon with lemon butter sauce and seasonal vegetables',
          basePrice: 24.99,
          dietaryTags: ['gluten-free'],
          isFeatured: true,
          image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=400',
        },
        {
          name: 'Classic Burger',
          description: 'Angus beef patty with lettuce, tomato, and special sauce',
          basePrice: 16.99,
          dietaryTags: [],
        },
        {
          name: 'Margherita Pizza',
          description: 'Fresh mozzarella, tomato sauce, and basil on thin crust',
          basePrice: 18.99,
          dietaryTags: ['vegetarian'],
        },
      ],
    },
    {
      name: 'Beverages',
      sortOrder: 3,
      items: [
        { name: 'Fresh Lemonade', description: 'House-made lemonade', basePrice: 4.99, dietaryTags: ['vegan'] },
        { name: 'Espresso', description: 'Double shot espresso', basePrice: 3.49, dietaryTags: ['vegan'] },
      ],
    },
  ];

  for (const cat of categoryDefs) {
    let category = await prisma.menuCategory.findFirst({
      where: { restaurantId: restaurant.id, branchId: branch.id, name: cat.name },
    });
    if (!category) {
      category = await prisma.menuCategory.create({
        data: {
          restaurantId: restaurant.id,
          branchId: branch.id,
          name: cat.name,
          sortOrder: cat.sortOrder,
        },
      });
    }

    for (const item of cat.items) {
      const existing = await prisma.menuItem.findFirst({
        where: { categoryId: category.id, name: item.name },
      });
      if (!existing) {
        await prisma.menuItem.create({
          data: {
            categoryId: category.id,
            name: item.name,
            description: item.description,
            basePrice: item.basePrice,
            dietaryTags: item.dietaryTags,
            isFeatured: Boolean(item.isFeatured),
            images: item.image ? { create: [{ url: item.image, altText: item.name }] } : undefined,
          },
        });
      }
    }
  }

  const burger = await prisma.menuItem.findFirst({
    where: { name: 'Classic Burger', category: { restaurantId: restaurant.id } },
  });
  if (burger) {
    let group = await prisma.modifierGroup.findFirst({
      where: { restaurantId: restaurant.id, name: 'Cooking Temperature' },
    });
    if (!group) {
      group = await prisma.modifierGroup.create({
        data: {
          restaurantId: restaurant.id,
          name: 'Cooking Temperature',
          minSelect: 1,
          maxSelect: 1,
          isRequired: true,
          options: {
            create: [
              { name: 'Medium Rare', priceDelta: 0 },
              { name: 'Medium', priceDelta: 0 },
              { name: 'Well Done', priceDelta: 0 },
            ],
          },
        },
      });
    }
    const linked = await prisma.menuItemModifierGroup.findUnique({
      where: { menuItemId_modifierGroupId: { menuItemId: burger.id, modifierGroupId: group.id } },
    });
    if (!linked) {
      await prisma.menuItemModifierGroup.create({
        data: { menuItemId: burger.id, modifierGroupId: group.id },
      });
    }
  }

  const tableLabels = [
    { label: 'T1', area: 'Main Dining', capacity: 4 },
    { label: 'T2', area: 'Main Dining', capacity: 4 },
    { label: 'T3', area: 'Main Dining', capacity: 4 },
    { label: 'T4', area: 'Patio', capacity: 2 },
    { label: 'T5', area: 'Patio', capacity: 2 },
  ];

  const tables = [];
  for (const t of tableLabels) {
    let table = await prisma.restaurantTable.findFirst({
      where: { branchId: branch.id, label: t.label },
    });
    if (!table) {
      table = await prisma.restaurantTable.create({
        data: { branchId: branch.id, ...t, status: 'available' },
      });
    }
    tables.push(table);
  }

  const secret = process.env.QR_TOKEN_SECRET || 'change-me-qr-secret-key';
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const qrUrls: string[] = [];

  for (const table of tables) {
    const existingQr = await prisma.qrCode.findFirst({
      where: { tableId: table.id, isActive: true },
    });
    if (existingQr) continue;

    const token = generateToken();
    const qr = await prisma.qrCode.create({
      data: {
        branchId: branch.id,
        tableId: table.id,
        tokenHash: hashToken(token),
        tokenVersion: 1,
        isActive: true,
      },
    });
    const sig = signPayload({ qrCodeId: qr.id, branchId: branch.id, tableId: table.id, version: 1 }, secret);
    qrUrls.push(`${table.label}: ${baseUrl}/qr/${token}?sig=${sig}`);
  }

  const pendingRestaurant = await prisma.restaurant.upsert({
    where: { slug: 'sunset-grill' },
    update: {},
    create: {
      name: 'Sunset Grill',
      slug: 'sunset-grill',
      status: 'pending',
      commissionRate: 0.05,
      branches: {
        create: {
          name: 'Downtown',
          slug: 'downtown',
          address: '88 Harbor Ave',
          phone: '+1-555-0199',
        },
      },
    },
  });

  const existingPayout = await prisma.payout.findFirst({ where: { restaurantId: restaurant.id } });
  if (!existingPayout) {
    const periodEnd = new Date();
    const periodStart = new Date();
    periodStart.setDate(periodStart.getDate() - 14);
    await prisma.payout.create({
      data: {
        restaurantId: restaurant.id,
        amount: 186.4,
        status: 'pending',
        periodStart,
        periodEnd,
        notes: 'Bi-weekly settlement (demo)',
      },
    });
  }

  const existingOrder = await prisma.order.findFirst({
    where: { branchId: branch.id, customerId: customerUser.id },
  });
  if (!existingOrder) {
    const salmon = await prisma.menuItem.findFirst({
      where: { name: 'Grilled Salmon', category: { restaurantId: restaurant.id } },
    });
    if (salmon) {
      await prisma.order.create({
        data: {
          branchId: branch.id,
          tableId: tables[0]?.id,
          customerId: customerUser.id,
          orderType: 'dine_in',
          status: 'completed',
          subtotal: 24.99,
          tax: 2.0,
          total: 26.99,
          placedAt: new Date(),
          items: {
            create: {
              menuItemId: salmon.id,
              itemNameSnapshot: salmon.name,
              unitPriceSnapshot: 24.99,
              quantity: 1,
              status: 'served',
            },
          },
          payments: {
            create: {
              provider: 'cash',
              amount: 26.99,
              status: 'captured',
              paidAt: new Date(),
            },
          },
        },
      });
    }
  }

  console.log('Seed completed.');
  console.log('  Admin:    admin@tablebite.com / admin123');
  console.log('  Owner:    owner@demobistro.com / owner123');
  console.log('  Kitchen:  kitchen@demobistro.com / kitchen123');
  console.log('  Waiter:   waiter@demobistro.com / waiter123');
  console.log('  Customer: guest@example.com / guest123');
  console.log(`  Restaurant: ${restaurant.name} (${restaurant.id})`);
  console.log(`  Branch: ${branch.name} (${branch.id})`);
  console.log(`  Pending restaurant: ${pendingRestaurant.name}`);
  if (qrUrls.length) {
    console.log('  Sample table QR URLs:');
    for (const url of qrUrls) console.log(`    ${url}`);
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
