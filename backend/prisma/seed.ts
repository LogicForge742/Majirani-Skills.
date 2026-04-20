import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data in dependency order
  await prisma.review.deleteMany();
  await prisma.service.deleteMany();
  await prisma.artisan.deleteMany();
  await prisma.user.deleteMany();

  const salt = await bcrypt.genSalt(10);

  // ─── Users ───────────────────────────────────────────────

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@majirani.co.ke',
      password: await bcrypt.hash('Admin@1234', salt),
      name: 'System Administrator',
      phone: '+254700000000',
      role: Role.ADMIN,
    },
  });

  const clientUser = await prisma.user.create({
    data: {
      email: 'john.doe@gmail.com',
      password: await bcrypt.hash('Client@1234', salt),
      name: 'John Doe',
      phone: '+254711000001',
      role: Role.CLIENT,
    },
  });

  const artisanUser = await prisma.user.create({
    data: {
      email: 'peter.mwangi@gmail.com',
      password: await bcrypt.hash('Artisan@1234', salt),
      name: 'Peter Mwangi',
      phone: '+254722000002',
      role: Role.ARTISAN,
    },
  });

  const artisanUser2 = await prisma.user.create({
    data: {
      email: 'grace.wanjiku@gmail.com',
      password: await bcrypt.hash('Artisan@1234', salt),
      name: 'Grace Wanjiku',
      phone: '+254733000003',
      role: Role.ARTISAN,
    },
  });

  // ─── Artisan Profiles ────────────────────────────────────

  const artisan1 = await prisma.artisan.create({
    data: {
      userId: artisanUser.id,
      skill: 'Plumbing',
      bio: 'Certified plumber with over 8 years of experience. Specializing in residential and commercial installations, repairs, and maintenance.',
      location: 'Nairobi, Westlands',
      county: 'Nairobi',
      experience: '8 years',
      availability: true,
      verified: true,
      rating: 4.7,
      reviewCount: 1,
    },
  });

  const artisan2 = await prisma.artisan.create({
    data: {
      userId: artisanUser2.id,
      skill: 'Carpentry',
      bio: 'Expert carpenter specializing in custom furniture, cabinetry, and interior woodwork. Passionate about precision and craftsmanship.',
      location: 'Nairobi, Karen',
      county: 'Nairobi',
      experience: '5 years',
      availability: true,
      verified: true,
      rating: 4.5,
      reviewCount: 0,
    },
  });

  // ─── Services ────────────────────────────────────────────

  await prisma.service.createMany({
    data: [
      {
        artisanId: artisan1.id,
        title: 'Pipe Installation & Repair',
        category: 'Plumbing',
        description: 'Full pipe installation and leak repair for residential and commercial spaces.',
        price: 2500,
        priceUnit: 'per job',
        isActive: true,
      },
      {
        artisanId: artisan1.id,
        title: 'Bathroom Fitting',
        category: 'Plumbing',
        description: 'Complete bathroom suite installation including toilets, sinks, showers, and tubs.',
        price: 8000,
        priceUnit: 'per job',
        isActive: true,
      },
      {
        artisanId: artisan2.id,
        title: 'Custom Furniture Design',
        category: 'Carpentry',
        description: 'Bespoke furniture crafted to your specifications. Wardrobes, beds, dining sets and more.',
        price: 5000,
        priceUnit: 'per item',
        isActive: true,
      },
      {
        artisanId: artisan2.id,
        title: 'Kitchen Cabinet Installation',
        category: 'Carpentry',
        description: 'Professional kitchen cabinet fitting and installation with a clean finish.',
        price: 15000,
        priceUnit: 'per kitchen',
        isActive: true,
      },
    ],
  });

  // ─── Reviews ─────────────────────────────────────────────

  await prisma.review.create({
    data: {
      artisanId: artisan1.id,
      authorId: clientUser.id,
      rating: 5,
      comment: 'Peter fixed our burst pipe within an hour of calling. Extremely professional and clean work. Highly recommended!',
    },
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Seed Credentials:');
  console.log('  Admin   → admin@majirani.co.ke     / Admin@1234');
  console.log('  Client  → john.doe@gmail.com        / Client@1234');
  console.log('  Artisan → peter.mwangi@gmail.com   / Artisan@1234');
  console.log('  Artisan → grace.wanjiku@gmail.com  / Artisan@1234');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
