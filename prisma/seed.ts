import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Seed Admin User
  const adminPassword = await bcrypt.hash("admin123", 10);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@anekacitra.com" },
    update: {},
    create: {
      email: "admin@anekacitra.com",
      passwordHash: adminPassword,
      name: "Admin Aneka Citra",
      role: "ADMIN",
      admin: {
        create: {},
      },
    },
    include: {
      admin: true,
    },
  });
  console.log("✅ Admin created:", adminUser.email);

  // Seed Customer Users
  const customerPassword = await bcrypt.hash("customer123", 10);
  
  const customer1 = await prisma.user.upsert({
    where: { email: "fiqih@gmail.com" },
    update: {},
    create: {
      email: "fiqih@gmail.com",
      passwordHash: customerPassword,
      name: "Fiqih Customer",
      role: "CUSTOMER",
    },
  });
  console.log("✅ Customer created:", customer1.email);

  const customer2 = await prisma.user.upsert({
    where: { email: "aku@gmail.com" },
    update: {},
    create: {
      email: "aku@gmail.com",
      passwordHash: customerPassword,
      name: "Aku Customer",
      role: "CUSTOMER",
    },
  });
  console.log("✅ Customer created:", customer2.email);

  // Seed Products
  const products = [
    {
      name: "Canon PIXMA G1020",
      brand: "Canon",
      priceCents: 2250000,
      stock: 15,
      description:
        "Printer ink tank system dengan hasil cetak berkualitas tinggi untuk kebutuhan rumah dan kantor kecil. Hemat biaya operasional dengan sistem tinta refillable.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "Epson L3110",
      brand: "Epson",
      priceCents: 2100000,
      stock: 20,
      description:
        "Printer multifungsi dengan teknologi Epson EcoTank yang dapat mencetak, scan, dan fotokopi. Tinta original untuk hasil cetak tahan lama.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "HP DeskJet 2336",
      brand: "HP",
      priceCents: 950000,
      stock: 12,
      description:
        "Printer all-in-one yang kompak dan terjangkau untuk mencetak dokumen dan foto dengan mudah di rumah. Cocok untuk pengguna casual.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "Brother DCP-T420W",
      brand: "Brother",
      priceCents: 2400000,
      stock: 8,
      description:
        "Printer multifungsi dengan fitur WiFi untuk kemudahan mencetak dari smartphone atau tablet. Sistem ink tank ekonomis untuk volume cetak tinggi.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "Canon PIXMA iP2770",
      brand: "Canon",
      priceCents: 650000,
      stock: 18,
      description:
        "Printer inkjet sederhana dan andal untuk kebutuhan cetak dokumen sehari-hari. Hemat energi dan mudah digunakan.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "Epson L3150",
      brand: "Epson",
      priceCents: 3100000,
      stock: 10,
      description:
        "Printer all-in-one dengan WiFi dan WiFi Direct untuk kemudahan koneksi nirkabel. Dilengkapi layar LCD untuk operasi yang lebih mudah.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "HP LaserJet Pro M15w",
      brand: "HP",
      priceCents: 1850000,
      stock: 6,
      description:
        "Printer laser monochrome kompak dengan konektivitas nirkabel. Kecepatan cetak tinggi dan ideal untuk dokumen bisnis profesional.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
    {
      name: "Brother HL-L2321D",
      brand: "Brother",
      priceCents: 1950000,
      stock: 14,
      description:
        "Printer laser monochrome dengan automatic duplex printing untuk menghemat kertas. Sempurna untuk kebutuhan kantor dengan volume cetak sedang.",
      imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500",
    },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({
      where: { name: product.name },
    });

    if (!existing) {
      const created = await prisma.product.create({
        data: product,
      });
      console.log("✅ Product created:", created.name);
    } else {
      console.log("⏭️  Product already exists:", product.name);
    }
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
