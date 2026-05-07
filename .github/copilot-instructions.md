# Aneka Citra Computer - E-Commerce Project

## Project Overview
This is a complete e-commerce website for **Aneka Citra Computer**, a printer and computer accessories store located in Jambu 2, Bogor, Indonesia. The website features product catalog, shopping cart, checkout, authentication, and admin dashboard.

## Tech Stack
- **Framework:** Next.js 16.1.1 with App Router
- **Language:** TypeScript with strict mode
- **Styling:** Tailwind CSS v4
- **Database:** SQLite with Prisma ORM v5.14.0
- **Authentication:** JWT (jose) + bcryptjs
- **Validation:** Zod schemas
- **Payment:** Xendit sandbox/mock integration

## Project Structure
```
src/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Login & Register
│   │   ├── products/          # Get products
│   │   ├── orders/            # Order creation & payment
│   │   └── admin/             # Admin CRUD operations
│   ├── dashboard/             # Admin pages (protected)
│   │   ├── page.tsx          # Dashboard overview
│   │   └── products/         # Product management
│   ├── checkout/             # Customer checkout flow
│   └── page.tsx              # Main homepage
├── lib/
│   ├── auth.ts               # JWT & password utilities
│   ├── db.ts                 # Prisma client singleton
│   └── xendit.ts             # Mock payment integration
└── middleware.ts             # Admin route protection (JWT)

prisma/
├── schema.prisma             # Database schema
├── seed.ts                   # Seeding script
└── migrations/               # Migration history
```

## Key Features Implemented
1. **Customer Features:**
   - Product catalog with filtering
   - Tokopedia-style product detail modal
   - Shopping cart with CRUD (Create, Update quantity, Delete)
   - User authentication (Login/Register)
   - Checkout flow with shipping form
   - Order creation with Xendit invoice
   - Payment simulation

2. **Admin Features:**
   - Protected admin dashboard
   - CRUD products (Create, Read, Update, Delete)
   - View all products in table format
   - Real-time database management

## Database Schema
- **User:** Customer accounts (id, email, passwordHash, name, role)
- **Admin:** Admin relation (userId, createdAt)
- **Product:** Products (id, name, brand, priceCents, stock, description, imageUrl)
- **Order:** Customer orders (id, userId, totalCents, paymentStatus, invoiceId)
- **OrderItem:** Order items (id, orderId, productId, quantity, priceCents)

## Important Notes
1. **Prisma:** Using v5.14.0 (not v7) to avoid adapter requirements for SQLite
2. **Enums:** String fields instead of native Prisma enums (SQLite limitation)
3. **Authentication:** JWT tokens stored in httpOnly cookies (7-day expiry)
4. **Cart Persistence:** localStorage for client-side cart state
5. **Price Storage:** Despite field name `priceCents`, prices are stored as **whole Rupiah integers** (not cents). This is simpler for Indonesian currency and avoids BIGINT overflow. All formatIDR functions accept rupiah directly.
6. **Admin Access:** Email: admin@anekacitra.com, Password: admin123

## Development Guidelines
- Always use `await` with Prisma operations
- Validate all API inputs with Zod schemas
- Use TypeScript strict mode - no `any` types
- Keep components client-side with `"use client"` when using hooks
- Format prices with `formatIDR(rupiah)` - prices are stored as whole Rupiah, not cents
- Use emerald/green color scheme (brand colors)
- All text in Indonesian language

## Environment Variables
```env
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-secret-key"
```

## Common Commands
```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:seed      # Seed database
npm run prisma:studio    # Open database GUI
```

## Known Issues & Future Work
- Middleware uses deprecated convention (migrate to "proxy")
- Order management UI (coming soon)
- Admin account management (coming soon)
- Product search/filter (coming soon)
- Real Xendit integration (currently mock)
- Shipping integration (coming soon)

## API Endpoints
### Public
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `POST /api/orders` - Create order with items
- `POST /api/orders/payment-status` - Update payment status

### Admin (Protected by Middleware)
- `GET /api/admin/products` - Get all products
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/[id]` - Update product
- `DELETE /api/admin/products/[id]` - Delete product

## Design Patterns
- **Repository Pattern:** Prisma client abstracted in `lib/db.ts`
- **Utility Functions:** Centralized in `lib/` directory
- **Component State:** React hooks with localStorage persistence
- **API Routes:** RESTful conventions with proper HTTP methods
- **Validation:** Zod schemas at API boundary
- **Security:** Password hashing, JWT tokens, protected routes

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
