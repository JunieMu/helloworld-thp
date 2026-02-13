import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        async get(name: string) {
          return (await cookies()).get(name)?.value
        },
        async set(name: string, value: string, options: any) {
          try {
            (await cookies()).set({ name, value, ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler.
            // This error is typically caused by an attempt to set a cookie from a Client Component
            // that rendered on the server. If you need to set cookies in a Client Component,
            // consider using a Server Action or an Route Handler.
          }
        },
        async remove(name: string, options: any) {
          try {
            (await cookies()).set({ name, value: '', ...options })
          } catch (error) {
            // The `cookies().set()` method can only be called in a Server Component or Route Handler.
            // This error is typically caused by an attempt to set a cookie from a Client Component
            // that rendered on the server. If you need to set cookies in a Client Component,
            // consider using a Server Action or an Route Handler.
          }
        },
      },
    }
  )
}
