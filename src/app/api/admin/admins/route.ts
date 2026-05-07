import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/auth";
import { z } from "zod";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me');

async function checkSuperAdmin() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      console.log('[checkSuperAdmin] No token found');
      return false;
    }
    
    const { payload } = await jwtVerify(token, SECRET);
    const email = (payload as any).email as string | undefined;
    console.log('[checkSuperAdmin] Token email:', email);
    
    if (!email) {
      console.log('[checkSuperAdmin] No email in token - user needs to re-login');
      return false;
    }
    
    const isSuperAdmin = email === "admin@anekacitra.com";
    console.log('[checkSuperAdmin] Is super admin:', isSuperAdmin);
    return isSuperAdmin;
  } catch (error) {
    console.error('[checkSuperAdmin] Error:', error);
    return false;
  }
}

export async function GET() {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json(
      { 
        error: "Akses ditolak: Hanya Super Admin yang bisa mengelola admin",
        hint: "Silakan logout dan login kembali dengan akun admin@anekacitra.com"
      },
      { status: 403 }
    );
  }

  try {
    const admins = await prisma.user.findMany({
      where: { role: "ADMIN" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json(admins);
  } catch (error) {
    console.error("Error fetching admins:", error);
    return NextResponse.json(
      { error: "Gagal memuat admin" },
      { status: 500 }
    );
  }
}

const createAdminSchema = z.object({
  email: z.string().email("Email tidak valid"),
  name: z.string().optional(),
  password: z.string().min(6, "Password minimal 6 karakter"),
});

export async function POST(request: Request) {
  const isSuperAdmin = await checkSuperAdmin();
  if (!isSuperAdmin) {
    return NextResponse.json(
      { error: "Akses ditolak: Hanya Super Admin yang bisa menambah admin" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const validated = createAdminSchema.parse(body);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email sudah terdaftar" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validated.password);

    // Create user with ADMIN role
    const user = await prisma.user.create({
      data: {
        email: validated.email,
        name: validated.name,
        passwordHash,
        role: "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    // Create admin record
    await prisma.admin.create({
      data: {
        userId: user.id,
      },
    });

    return NextResponse.json(
      { message: "Admin berhasil dibuat", user },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    console.error("Error creating admin:", error);
    return NextResponse.json(
      { error: "Gagal membuat admin" },
      { status: 500 }
    );
  }
}
