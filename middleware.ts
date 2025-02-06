import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 如果用户未登录且访问需要认证的页面，重定向到登录页
  if (!session && req.nextUrl.pathname === '/dashboard') {
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }

  // 如果用户已登录且访问登录/注册页面，重定向到仪表板
  if (session && req.nextUrl.pathname.startsWith('/auth/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};