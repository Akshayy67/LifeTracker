// =====================================================
// Life Tracker - Supabase Database Types
// Auto-generated TypeScript types for database schema
// =====================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          timezone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          icon: string
          frequency: 'daily' | 'weekly' | 'monthly'
          target_count: number
          active: boolean
          archived_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          frequency: 'daily' | 'weekly' | 'monthly'
          target_count?: number
          active?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          frequency?: 'daily' | 'weekly' | 'monthly'
          target_count?: number
          active?: boolean
          archived_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      habit_completions: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          completed_at: string
          completion_date: string
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          completed_at?: string
          completion_date?: string
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          habit_id?: string
          user_id?: string
          completed_at?: string
          completion_date?: string
          notes?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_completions_habit_id_fkey"
            columns: ["habit_id"]
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "habit_completions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_entries: {
        Row: {
          id: string
          user_id: string
          title: string | null
          content: string
          mood: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
          tags: string[]
          is_favorite: boolean
          entry_date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string | null
          content: string
          mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
          tags?: string[]
          is_favorite?: boolean
          entry_date?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string | null
          content?: string
          mood?: 'great' | 'good' | 'okay' | 'bad' | 'terrible' | null
          tags?: string[]
          is_favorite?: boolean
          entry_date?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      journal_images: {
        Row: {
          id: string
          journal_entry_id: string
          user_id: string
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          display_order: number
          created_at: string
        }
        Insert: {
          id?: string
          journal_entry_id: string
          user_id: string
          storage_path: string
          file_name: string
          file_size: number
          mime_type: string
          display_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          journal_entry_id?: string
          user_id?: string
          storage_path?: string
          file_name?: string
          file_size?: number
          mime_type?: string
          display_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_images_journal_entry_id_fkey"
            columns: ["journal_entry_id"]
            referencedRelation: "journal_entries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journal_images_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      expense_categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          is_default: boolean
          display_order: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color?: string
          icon?: string
          is_default?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          icon?: string
          is_default?: boolean
          display_order?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_categories_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          amount: number
          period: 'monthly' | 'yearly'
          start_date: string
          end_date: string | null
          active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id?: string | null
          amount: number
          period: 'monthly' | 'yearly'
          start_date: string
          end_date?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          amount?: number
          period?: 'monthly' | 'yearly'
          start_date?: string
          end_date?: string | null
          active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "budgets_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budgets_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          description: string | null
          expense_date: string
          payment_method: 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'other' | null
          notes: string | null
          receipt_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          category_id: string
          amount: number
          description?: string | null
          expense_date?: string
          payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'other' | null
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          description?: string | null
          expense_date?: string
          payment_method?: 'cash' | 'credit_card' | 'debit_card' | 'upi' | 'bank_transfer' | 'other' | null
          notes?: string | null
          receipt_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expenses_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "expense_categories"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_streak: {
        Args: {
          p_habit_id: string
        }
        Returns: number
      }
      monthly_expense_summary: {
        Args: {
          p_user_id: string
          p_year: number
          p_month: number
        }
        Returns: {
          category_id: string
          category_name: string
          category_color: string
          total_amount: number
          transaction_count: number
          average_amount: number
          budget_amount: number
          budget_remaining: number
          budget_percentage: number
        }[]
      }
      get_habit_completion_rate: {
        Args: {
          p_habit_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: number
      }
      get_total_expenses_by_period: {
        Args: {
          p_user_id: string
          p_start_date: string
          p_end_date: string
        }
        Returns: number
      }
      generate_journal_image_path: {
        Args: {
          p_user_id: string
          p_journal_entry_id: string
          p_file_name: string
        }
        Returns: string
      }
      get_journal_image_url: {
        Args: {
          p_storage_path: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
