import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value)
            res.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  const isLoginPage = req.nextUrl.pathname === '/login'
  const isAdminPage = req.nextUrl.pathname.startsWith('/admin')
  const isApiRoute = req.nextUrl.pathname.startsWith('/api')

  if (isApiRoute) return res

  if (!session && !isLoginPage) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (session && isAdminPage) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  if (session && isLoginPage) {
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single()

    const redirect = user?.role === 'admin' ? '/admin/users' : '/dashboard'
    return NextResponse.redirect(new URL(redirect, req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|products).*)'],
}
