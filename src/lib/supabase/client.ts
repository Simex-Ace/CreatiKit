import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      `Missing Supabase environment variables!\n` +
      `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✓' : '✗'}\n` +
      `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseAnonKey ? '✓' : '✗'}\n` +
      `Please check your .env.local file in the project root.`
    );
  }

  // 检查 ANON_KEY 格式（应该是 JWT token，以 eyJ 开头）
  if (supabaseAnonKey && !supabaseAnonKey.startsWith('eyJ')) {
    console.warn(
      '[Supabase Client] Warning: ANON_KEY format may be incorrect.\n' +
      'Expected JWT token (starts with "eyJ"), but got: ' + 
      supabaseAnonKey.substring(0, 20) + '...\n' +
      'Please check if you are using the correct "anon public" key from Supabase Dashboard.'
    );
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

