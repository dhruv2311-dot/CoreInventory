import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yigaxyjcbgzroqqfxoqs.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlpZ2F4eWpjYmd6cm9xcWZ4b3FzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NTI1ODQsImV4cCI6MjA4OTAyODU4NH0.eY9N-fXa12EeYvgG8H3BsMnZ2jLzZs6Thp_XEmflK8E';

export const supabaseClient = createClient(supabaseUrl, supabaseKey);
