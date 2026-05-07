# Aneka Citra Computer - E-Commerce Printer

Website e-commerce buat toko printer **Aneka Citra Computer** di Jambu 2, Bogor. Di sini ada katalog produk, cart, checkout, login, sampai dashboard admin.

## Gambaran Singkat

- Katalog produk printer dan aksesoris
- Keranjang belanja dengan tambah, ubah jumlah, hapus item
- Login dan register user
- Checkout dengan form pengiriman
- Simulasi pembayaran pakai Xendit sandbox
- Dashboard admin buat kelola produk dan pesanan

## Tech Stack

- **Framework:** Next.js 16.1.1
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** SQLite + Prisma ORM v5.14.0
- **Auth:** JWT (jose) + bcryptjs
- **Validation:** Zod
- **Payment:** Xendit sandbox/mock

## Setup

1. Install dependency.

   ```bash
   npm install
   ```

2. Isi `.env`.

   ```env
   DATABASE_URL="file:./prisma/dev.db"
   JWT_SECRET="your-secret-key-here"
   ```

3. Generate Prisma client, lalu migrate database.

   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

4. Seed data awal.

   ```bash
   npm run prisma:seed
   ```

5. Jalankan project.

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000).

## Login Admin

Setelah seed, pakai akun ini buat masuk ke dashboard admin:

- **Email:** admin@anekacitra.com
- **Password:** admin123

## Fitur Customer

1. Buka homepage dan lihat produk.
2. Klik detail produk kalau mau cek spesifikasi lengkap.
3. Login atau register kalau belum punya akun.
4. Tambah produk ke cart dan atur jumlahnya.
5. Checkout isi data pengiriman.
6. Lanjut ke pembayaran.
7. Status pembayaran bisa disimulasikan lewat Xendit sandbox.

## Fitur Admin

- Lihat ringkasan data toko di dashboard.
- Kelola produk: tambah, edit, hapus.
- Kelola pesanan: lihat status dan update kalau perlu.
- Route admin dilindungi JWT middleware.

## Database

- **User:** akun customer dan admin
- **Admin:** relasi akun admin
- **Product:** data produk, harga, stok, deskripsi, gambar
- **Order:** data pesanan dan status pembayaran
- **OrderItem:** detail item di tiap order

## Script

```bash
npm run dev
npm run build
npm run start
npm run lint

npm run prisma:generate
npm run prisma:migrate
npm run prisma:studio
npm run prisma:seed
```

## Security

- Password di-hash pakai bcryptjs
- JWT disimpan di httpOnly cookie
- Route admin dilindungi middleware
- Input API divalidasi pakai Zod

## Catatan

- SQLite dipakai buat development biar setup-nya gampang
- Xendit masih mode sandbox
- Kalau mau production, database bisa dipindah ke PostgreSQL atau MySQL

## Preview

![home](https://raw.githubusercontent.com/fiqihbadrian/acc-jambu-2/refs/heads/main/public/hom.png)
![login](https://raw.githubusercontent.com/fiqihbadrian/acc-jambu-2/refs/heads/main/public/log.png)
![das](https://raw.githubusercontent.com/fiqihbadrian/acc-jambu-2/refs/heads/main/public/dashbor.png)
![edit](https://raw.githubusercontent.com/fiqihbadrian/acc-jambu-2/refs/heads/main/public/edit.png)
![admin](https://raw.githubusercontent.com/fiqihbadrian/acc-jambu-2/refs/heads/main/public/admin.png)
