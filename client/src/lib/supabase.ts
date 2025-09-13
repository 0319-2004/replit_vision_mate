import { createClient } from '@supabase/supabase-js'

// Supabase設定
const supabaseUrl = 'https://dyuzdoyzsfeszaxadxhl.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR5dXpkb3l6c2Zlc3pheGFkeGhsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3NzYwMTYsImV4cCI6MjA3MzM1MjAxNn0.p_tDknrJ_dJAr7N6sGUgN-8CFe0tTDPR1FLgI2UEDcQ'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 型定義
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          profile_image_url: string | null
          display_name: string | null
          bio: string | null
          skills: string[] | null
          github_url: string | null
          portfolio_url: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          display_name?: string | null
          bio?: string | null
          skills?: string[] | null
          github_url?: string | null
          portfolio_url?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          profile_image_url?: string | null
          display_name?: string | null
          bio?: string | null
          skills?: string[] | null
          github_url?: string | null
          portfolio_url?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          creator_id: string
          is_active: boolean
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          title: string
          description: string
          creator_id: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          title?: string
          description?: string
          creator_id?: string
          is_active?: boolean
          created_at?: string | null
          updated_at?: string | null
        }
      }
      participations: {
        Row: {
          id: string
          project_id: string
          user_id: string
          type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          type: string
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          type?: string
          created_at?: string | null
        }
      }
      progress_updates: {
        Row: {
          id: string
          project_id: string
          user_id: string
          title: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          title: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          title?: string
          content?: string
          created_at?: string | null
        }
      }
      comments: {
        Row: {
          id: string
          project_id: string
          user_id: string
          content: string
          created_at: string | null
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          content: string
          created_at?: string | null
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          content?: string
          created_at?: string | null
        }
      }
      reactions: {
        Row: {
          id: string
          target_id: string
          target_type: string
          user_id: string
          type: string
          created_at: string | null
        }
        Insert: {
          id?: string
          target_id: string
          target_type: string
          user_id: string
          type?: string
          created_at?: string | null
        }
        Update: {
          id?: string
          target_id?: string
          target_type?: string
          user_id?: string
          type?: string
          created_at?: string | null
        }
      }
      conversations: {
        Row: {
          id: string
          participant1_id: string
          participant2_id: string
          last_message_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          participant1_id: string
          participant2_id: string
          last_message_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          participant1_id?: string
          participant2_id?: string
          last_message_at?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string
          sender_id: string
          content: string
          is_read: boolean
          created_at: string | null
        }
        Insert: {
          id?: string
          conversation_id: string
          sender_id: string
          content: string
          is_read?: boolean
          created_at?: string | null
        }
        Update: {
          id?: string
          conversation_id?: string
          sender_id?: string
          content?: string
          is_read?: boolean
          created_at?: string | null
        }
      }
    }
  }
}
