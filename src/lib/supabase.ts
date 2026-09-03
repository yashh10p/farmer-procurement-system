import { createClient } from '@supabase/supabase-js';

// We dynamically use the Next.js API route proxy (port 3000) for cross-device support 
// without needing to modify Windows Firewall rules for Docker ports
const isBrowser = typeof window !== 'undefined';
const supabaseUrl = isBrowser ? `${window.location.origin}/supabase` : 'http://127.0.0.1:54321';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
