import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // デバッグ用ログ
  console.log('🔐 useSupabaseAuth state:', { user: !!user, session: !!session, isLoading })

  useEffect(() => {
    // 初期セッション取得
    const getInitialSession = async () => {
      console.log('🔄 Getting initial session...')
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        console.log('📝 Initial session result:', { session: !!session, error })
        if (error) {
          console.error('❌ Error getting session:', error)
        } else {
          setSession(session)
          setUser(session?.user ?? null)
          console.log('✅ Session set successfully:', { user: !!session?.user })
        }
        setIsLoading(false)
        console.log('🏁 Initial session loading complete')
      } catch (err) {
        console.error('💥 Unexpected error in getInitialSession:', err)
        setIsLoading(false)
      }
    }

    getInitialSession()

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session)
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // ユーザー情報をデータベースに同期
        if (session?.user && event === 'SIGNED_IN') {
          await syncUserToDatabase(session.user)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // ユーザー情報をデータベースに同期
  const syncUserToDatabase = async (authUser: User) => {
    try {
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Error fetching user:', fetchError)
        return
      }

      if (!existingUser) {
        // 新規ユーザーの場合、データベースに登録
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            first_name: authUser.user_metadata?.first_name,
            last_name: authUser.user_metadata?.last_name,
            profile_image_url: authUser.user_metadata?.avatar_url,
          })

        if (insertError) {
          console.error('Error creating user profile:', insertError)
        }
      }
    } catch (error) {
      console.error('Error syncing user to database:', error)
    }
  }

  // Googleサインイン
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/`,
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  // メールサインイン
  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in with email:', error)
      throw error
    }
  }

  // メールサインアップ
  const signUpWithEmail = async (email: string, password: string, metadata?: any) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing up:', error)
      throw error
    }
  }

  // サインアウト
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  return {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    signOut,
  }
}
