import { createClient } from '@supabase/supabase-js';

// We will use the network IP so other devices can access it!
const supabaseUrl = 'http://192.168.1.8:54321';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

// Initialize Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
