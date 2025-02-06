import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // 基础的中间件逻辑
  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    '/api/:path*',
    '/files/:path*'
  ]
}