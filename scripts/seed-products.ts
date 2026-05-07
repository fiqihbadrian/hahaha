import { PrismaClient } from '@prisma/client'


const prisma = new PrismaClient()


const products = [
  {
    name: "Epson EcoTank L3210",
    brand: "Epson",
    priceCents: 2500000,
    stock: 15,
    description: "Printer multifungsi dengan sistem tangki tinta untuk mencetak, menyalin, dan memindai dokumen dengan biaya per halaman yang sangat rendah. Cocok untuk kebutuhan rumah dan kantor kecil.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Inkjet" },
      { key: "Fungsi", value: "Print, Scan, Copy" },
      { key: "Resolusi Cetak", value: "5760 x 1440 dpi" },
      { key: "Kecepatan Cetak Hitam", value: "33 ppm" },
      { key: "Kecepatan Cetak Warna", value: "15 ppm" },
      { key: "Konektivitas", value: "USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "Canon PIXMA G3010",
    brand: "Canon",
    priceCents: 2800000,
    stock: 12,
    description: "Printer wireless dengan tangki tinta berkapsitas tinggi. Dilengkapi WiFi untuk mencetak dari smartphone atau laptop. Ideal untuk kebutuhan printing dokumentasi dan foto berkualitas.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Inkjet" },
      { key: "Fungsi", value: "Print, Scan, Copy" },
      { key: "Resolusi Cetak", value: "4800 x 1200 dpi" },
      { key: "Kecepatan Cetak Hitam", value: "8.8 ipm" },
      { key: "Kecepatan Cetak Warna", value: "5.0 ipm" },
      { key: "Konektivitas", value: "WiFi, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "HP LaserJet Pro M15w",
    brand: "HP",
    priceCents: 1950000,
    stock: 20,
    description: "Printer laser monochrome kompak dengan WiFi. Mencetak cepat dan hemat dengan hasil tajam untuk dokumen teks. Sangat cocok untuk kebutuhan kantor dan mahasiswa.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Laser" },
      { key: "Fungsi", value: "Print" },
      { key: "Resolusi Cetak", value: "600 x 600 dpi" },
      { key: "Kecepatan Cetak", value: "19 ppm" },
      { key: "Tipe Warna", value: "Monochrome (Hitam Putih)" },
      { key: "Konektivitas", value: "WiFi, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "Brother DCP-T520W",
    brand: "Brother",
    priceCents: 2650000,
    stock: 10,
    description: "Printer multifungsi dengan sistem tangki tinta dan koneksi wireless. Desain compact dengan hasil cetak berkualitas tinggi untuk dokumen dan foto.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Inkjet" },
      { key: "Fungsi", value: "Print, Scan, Copy" },
      { key: "Resolusi Cetak", value: "6000 x 1200 dpi" },
      { key: "Kecepatan Cetak Hitam", value: "12 ppm" },
      { key: "Kecepatan Cetak Warna", value: "10 ppm" },
      { key: "Konektivitas", value: "WiFi, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "Epson L5190",
    brand: "Epson",
    priceCents: 4200000,
    stock: 8,
    description: "Printer all-in-one dengan ADF untuk scan dokumen berkumpul. Dilengkapi fax, WiFi Direct, dan sistem tangki tinta original. Sempurna untuk produktivitas kantor.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Inkjet" },
      { key: "Fungsi", value: "Print, Scan, Copy, Fax" },
      { key: "Resolusi Cetak", value: "4800 x 1200 dpi" },
      { key: "Kecepatan Cetak Hitam", value: "33 ppm" },
      { key: "Kecepatan Cetak Warna", value: "20 ppm" },
      { key: "ADF", value: "30 Lembar" },
      { key: "Konektivitas", value: "WiFi, Ethernet, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "2 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "Canon ImageCLASS MF244dw",
    brand: "Canon",
    priceCents: 3900000,
    stock: 7,
    description: "Printer laser multifungsi monochrome dengan duplex otomatis dan WiFi. Cepat, efisien, dan hemat untuk volume cetak tinggi di kantor.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Laser" },
      { key: "Fungsi", value: "Print, Scan, Copy" },
      { key: "Resolusi Cetak", value: "600 x 600 dpi" },
      { key: "Kecepatan Cetak", value: "27 ppm" },
      { key: "Tipe Warna", value: "Monochrome (Hitam Putih)" },
      { key: "Duplex", value: "Otomatis" },
      { key: "Konektivitas", value: "WiFi, Ethernet, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "HP DeskJet Ink Advantage 2775",
    brand: "HP",
    priceCents: 1450000,
    stock: 18,
    description: "Printer all-in-one kompak dengan koneksi wireless. Mudah digunakan untuk mencetak dari smartphone. Hemat energi dan cocok untuk penggunaan rumahan.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Inkjet" },
      { key: "Fungsi", value: "Print, Scan, Copy" },
      { key: "Resolusi Cetak", value: "4800 x 1200 dpi" },
      { key: "Kecepatan Cetak Hitam", value: "7.5 ppm" },
      { key: "Kecepatan Cetak Warna", value: "5.5 ppm" },
      { key: "Konektivitas", value: "WiFi, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  },
  {
    name: "Brother HL-L2375DW",
    brand: "Brother",
    priceCents: 2950000,
    stock: 14,
    description: "Printer laser hitam putih dengan duplex otomatis dan WiFi. Kecepatan cetak tinggi dan toner hemat untuk dokumen berkualitas profesional.",
    specifications: JSON.stringify([
      { key: "Teknologi Cetak", value: "Laser" },
      { key: "Fungsi", value: "Print" },
      { key: "Resolusi Cetak", value: "2400 x 600 dpi" },
      { key: "Kecepatan Cetak", value: "34 ppm" },
      { key: "Tipe Warna", value: "Monochrome (Hitam Putih)" },
      { key: "Duplex", value: "Otomatis" },
      { key: "Konektivitas", value: "WiFi, Ethernet, USB" },
      { key: "Kondisi", value: "Baru" },
      { key: "Garansi", value: "1 Tahun Resmi" }
    ]),
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=500"
  }
]

async function main() {
  console.log('🌱 Seeding products...')
  
  for (const product of products) {
    const created = await prisma.product.create({
      data: product
    })
    console.log(`✅ Created: ${created.name}`)
  }
  
  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
