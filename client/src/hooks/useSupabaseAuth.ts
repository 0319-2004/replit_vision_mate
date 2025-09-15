import { useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // デバッグ用ログ
  console.log('🔐 useSupabaseAuth state:', { 
    user: !!user, 
    session: !!session, 
    isLoading,
    userEmail: user?.email,
    sessionValid: !!session?.access_token 
  })

  useEffect(() => {
    let timeoutId: NodeJS.Timeout
    let isCompleted = false

    // 強制的にローディングを終了（5秒後）
    const forceLoadingComplete = () => {
      if (!isCompleted) {
        console.log('⏰ Session loading timeout - continuing as guest user')
        isCompleted = true
        setIsLoading(false)
        setSession(null)
        setUser(null)
      }
    }

    // 安全装置：15秒後に強制終了（GitHub Pagesでは応答が遅い場合がある）
    timeoutId = setTimeout(forceLoadingComplete, 15000)

    // 初期セッション取得
    const getInitialSession = async () => {
      console.log('🔄 Getting initial session...')
      
      try {
        // まず現在のセッションを確認
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (isCompleted) return // 既に完了済みの場合は何もしない
        
        if (error) {
          console.log('ℹ️ Session error:', error.message)
          setSession(null)
          setUser(null)
        } else if (session) {
          setSession(session)
          setUser(session.user)
          console.log('✅ Session loaded:', { 
            hasSession: !!session, 
            hasUser: !!session.user,
            userEmail: session.user?.email 
          })
        } else {
          console.log('ℹ️ No active session found')
          setSession(null)
          setUser(null)
        }
        
      } catch (err) {
        if (isCompleted) return // 既に完了済みの場合は何もしない
        console.log('ℹ️ Session load failed:', err)
        setSession(null)
        setUser(null)
      } finally {
        if (!isCompleted) {
          isCompleted = true
          clearTimeout(timeoutId)
          setIsLoading(false)
          console.log('🏁 Session initialization complete')
        }
      }
    }

    getInitialSession()

    // 認証状態変更の監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state changed:', event, {
          hasSession: !!session,
          hasUser: !!session?.user,
          userEmail: session?.user?.email
        })
        
        if (!isCompleted) {
          isCompleted = true
          clearTimeout(timeoutId)
        }
        
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)

        // ユーザー情報をデータベースに同期
        if (session?.user && event === 'SIGNED_IN') {
          console.log('🔄 Syncing user to database...')
          await syncUserToDatabase(session.user)
        }
        
        if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out')
        }
      }
    )

    return () => {
      clearTimeout(timeoutId)
      subscription.unsubscribe()
    }
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
