import { createBrowserClient } from '@supabase/ssr';

/**
 * Supabase 클라이언트 생성
 * @returns {SupabaseClient} Supabase 클라이언트
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
