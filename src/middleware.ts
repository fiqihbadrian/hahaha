import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'dev-secret-change-me')


async function verify(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, SECRET)
    const subStr = (payload as any).sub as string | undefined
    const role = (payload as any).role as ('USER'|'ADMIN') | undefined
    const sub = subStr ? Number(subStr) : undefined
    if (!sub) return null
    return { sub, role }
  } catch {
    return null
  }
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const protectedAdmin = pathname.startsWith('/dashboard') || pathname.startsWith('/api/admin')
  if (!protectedAdmin) return NextResponse.next()

  const payload = await verify(req)
  if (!payload || payload.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*','/api/admin/:path*']
}
