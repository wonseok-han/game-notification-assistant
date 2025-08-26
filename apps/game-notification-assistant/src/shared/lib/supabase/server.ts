import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

/**
 * 서버용 Supabase 클라이언트 생성
 * @returns {SupabaseClient} 서버용 Supabase 클라이언트
 */
export async function createClientServer() {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        autoRefreshToken: true, // on
        persistSession: true, // on
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, options, value }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );

  // 이 호출 자체가 만료 시 refresh를 수행하고 쿠키를 갱신합니다
  await supabase.auth.getSession();
  return supabase;
}

/**
 * 관리자용 Supabase 클라이언트 생성
 * @returns {SupabaseClient} 관리자용 Supabase 클라이언트
 */
export async function createAdminServer() {
  console.log(process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log(process.env.SUPABASE_SECRET_KEY);
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!,
    {
      auth: {
        persistSession: false,
      },
    }
  );
  return supabase;
}
