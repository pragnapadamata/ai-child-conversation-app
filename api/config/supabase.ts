import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string;
          image_url: string;
          start_time: string;
          end_time: string | null;
          status: 'active' | 'completed' | 'expired';
          created_at: string;
        };
        Insert: {
          id: string;
          image_url: string;
          start_time: string;
          end_time?: string | null;
          status?: 'active' | 'completed' | 'expired';
        };
        Update: {
          image_url?: string;
          end_time?: string | null;
          status?: 'active' | 'completed' | 'expired';
        };
      };
      messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          audio_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          conversation_id: string;
          role: 'user' | 'assistant';
          content: string;
          audio_url?: string | null;
        };
        Update: {
          role?: 'user' | 'assistant';
          content?: string;
          audio_url?: string | null;
        };
      };
    };
  };
}
