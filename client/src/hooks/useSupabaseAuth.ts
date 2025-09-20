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

    // 強制的にローディングを終了（10秒後）
    const forceLoadingComplete = () => {
      if (!isCompleted) {
        console.log('⏰ Session loading timeout - continuing as guest user')
        isCompleted = true
        setIsLoading(false)
        setSession(null)
        setUser(null)
      }
    }

    // 安全装置：10秒後に強制終了（GitHub Pagesでは応答が遅い場合がある）
    timeoutId = setTimeout(forceLoadingComplete, 10000)

    // 初期セッション取得
    const getInitialSession = async () => {
      console.log('🔄 Getting initial session...')
      
      try {
        // OAuth(PKCE) リダイレクト後の code を明示的にセッションへ交換
        if (typeof window !== 'undefined') {
          const hasCodeInSearch = window.location.search.includes('code=')
          const hasCodeInHash = window.location.hash.includes('code=')
          
          if (hasCodeInSearch || hasCodeInHash) {
            try {
              console.log('🔁 Exchanging code for session...', { hasCodeInSearch, hasCodeInHash })
              // フルURLを渡す（ライブラリはURL解析してcode/verifierを取得）
              const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href)
              if (error) {
                console.error('❌ exchangeCodeForSession error:', error)
              } else {
                console.log('✅ Code exchanged. Has session:', !!data.session)
                // URLをクリーンアップ（HashRouterの場合はhashも考慮）
                if (hasCodeInHash) {
                  // ハッシュをクリーンアップ
                  window.history.replaceState({}, document.title, window.location.pathname + '#/')
                } else {
                  // 検索パラメータをクリーンアップ
                  const cleaned = new URL(window.location.href)
                  cleaned.search = ''
                  window.history.replaceState({}, document.title, cleaned.toString())
                }
              }
            } catch (ex) {
              console.warn('⚠️ exchangeCodeForSession threw:', ex)
            }
          }
        }
        
        // まず現在のセッションを確認
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (isCompleted) return // 既に完了済みの場合は何もしない
        
        if (error) {
          console.log('ℹ️ Session error:', error.message)
          console.log('ℹ️ Error details:', error)
          setSession(null)
          setUser(null)
        } else if (session) {
          setSession(session)
          setUser(session.user)
          console.log('✅ Session loaded:', { 
            hasSession: !!session, 
            hasUser: !!session.user,
            userEmail: session.user?.email,
            sessionExpires: session.expires_at
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

        // ドメイン制限（クライアント側）: 青学メールのみ許可
        if (session?.user && event === 'SIGNED_IN') {
          const email = session.user.email?.toLowerCase() || ''
          const isAllowed = /(^|\.)aoyama\.ac\.jp$/.test(email.split('@')[1] || '') || /^aoyama\.jp$/.test(email.split('@')[1] || '')
          if (!isAllowed) {
            console.warn('🚫 Domain not allowed. Signing out and redirecting to landing with error.')
            await supabase.auth.signOut()
            const redirectBase = window.location.href.includes('localhost') 
              ? 'http://localhost:5173/' 
              : 'https://0319-2004.github.io/replit_vision_mate/'
            const url = new URL(redirectBase)
            url.searchParams.set('error', 'domain_not_allowed')
            window.location.replace(url.toString())
            return
          }

          // ユーザー情報をデータベースに同期
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
      const redirectUrl = window.location.href.includes('localhost') 
        ? 'http://localhost:5173/#/' 
        : 'https://0319-2004.github.io/replit_vision_mate/#/'
      console.log('🔗 OAuth redirectTo URL:', redirectUrl)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
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
