import { supabase } from './supabase'

// Types
export interface Project {
  id: string
  title: string
  description: string
  creator_id: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProjectWithCreator extends Project {
  creator: {
    id: string
    first_name: string | null
    profile_image_url: string | null
  }
  participations?: Participation[]
}

export interface Participation {
  id: string
  project_id: string
  user_id: string
  type: 'watch' | 'raise_hand' | 'commit'
  created_at: string
}

export interface ProgressUpdate {
  id: string
  project_id: string
  user_id: string
  title: string
  content: string
  created_at: string
}

export interface Comment {
  id: string
  project_id: string
  user_id: string
  content: string
  created_at: string
}

export interface Reaction {
  id: string
  target_id: string
  target_type: 'project' | 'progress_update' | 'comment' | 'message'
  user_id: string
  type: string
  created_at: string
}

// Project API
export const projectsApi = {
  // 全プロジェクト取得
  async getAll(): Promise<Project[]> {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 発見用プロジェクト取得（作成者情報込み）
  async getForDiscover(): Promise<ProjectWithCreator[]> {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:users!creator_id (
          id,
          first_name,
          profile_image_url
        ),
        participations (
          id,
          user_id,
          type
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // プロジェクト詳細取得
  async getById(id: string) {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        creator:users!creator_id (*),
        participations (*),
        progress_updates (*),
        comments (*)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // プロジェクト作成
  async create(projectData: { title: string; description: string }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('projects')
      .insert({
        ...projectData,
        creator_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // プロジェクト更新
  async update(id: string, updates: Partial<Pick<Project, 'title' | 'description' | 'is_active'>>) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // プロジェクト削除
  async delete(id: string) {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', id)

    if (error) throw error
  },
}

// Participation API
export const participationsApi = {
  // 参加追加
  async add(projectId: string, type: 'watch' | 'raise_hand' | 'commit') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('participations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        type,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 参加削除
  async remove(projectId: string, type: 'watch' | 'raise_hand' | 'commit') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('participations')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .eq('type', type)

    if (error) throw error
  },

  // ユーザーの参加状況取得
  async getUserParticipation(projectId: string, userId: string, type: string) {
    const { data, error } = await supabase
      .from('participations')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', userId)
      .eq('type', type)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  },
}

// Progress Updates API
export const progressUpdatesApi = {
  // 進捗更新作成
  async create(projectId: string, updateData: { title: string; content: string }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('progress_updates')
      .insert({
        ...updateData,
        project_id: projectId,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Comments API
export const commentsApi = {
  // コメント作成
  async create(projectId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('comments')
      .insert({
        project_id: projectId,
        user_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },
}

// Reactions API
export const reactionsApi = {
  // リアクション状況取得
  async getStatus(targetId: string, targetType: string) {
    const { data: reactions, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('target_id', targetId)
      .eq('target_type', targetType)

    if (error) throw error

    const count = reactions?.length || 0
    
    // ユーザーがリアクション済みかチェック
    const { data: { user } } = await supabase.auth.getUser()
    const userReacted = user ? reactions?.some(r => r.user_id === user.id) || false : false

    return { count, userReacted }
  },

  // リアクション切り替え
  async toggle(targetId: string, targetType: 'project' | 'progress_update' | 'comment' | 'message') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 既存のリアクションをチェック
    const { data: existingReaction, error: checkError } = await supabase
      .from('reactions')
      .select('*')
      .eq('target_id', targetId)
      .eq('target_type', targetType)
      .eq('user_id', user.id)
      .eq('type', 'clap')
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existingReaction) {
      // リアクション削除
      const { error } = await supabase
        .from('reactions')
        .delete()
        .eq('id', existingReaction.id)

      if (error) throw error
      return { action: 'removed' as const }
    } else {
      // リアクション追加
      const { data, error } = await supabase
        .from('reactions')
        .insert({
          target_id: targetId,
          target_type: targetType,
          user_id: user.id,
          type: 'clap',
        })
        .select()
        .single()

      if (error) throw error
      return { action: 'added' as const, data }
    }
  },
}

// Messages API
export const messagesApi = {
  // 会話一覧取得
  async getConversations() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!participant1_id (*),
        participant2:users!participant2_id (*),
        messages (
          *,
          sender:users!sender_id (*)
        )
      `)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .order('last_message_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 特定の会話取得
  async getConversation(conversationId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        participant1:users!participant1_id (*),
        participant2:users!participant2_id (*),
        messages (
          *,
          sender:users!sender_id (*)
        )
      `)
      .eq('id', conversationId)
      .or(`participant1_id.eq.${user.id},participant2_id.eq.${user.id}`)
      .single()

    if (error) throw error
    return data
  },

  // メッセージ送信
  async sendMessage(recipientId: string, content: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 会話を取得または作成
    let conversationId: string

    const { data: existingConversation, error: conversationError } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(participant1_id.eq.${user.id},participant2_id.eq.${recipientId}),and(participant1_id.eq.${recipientId},participant2_id.eq.${user.id})`)
      .single()

    if (conversationError && conversationError.code !== 'PGRST116') throw conversationError

    if (existingConversation) {
      conversationId = existingConversation.id
    } else {
      // 新しい会話を作成
      const { data: newConversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant1_id: user.id,
          participant2_id: recipientId,
        })
        .select()
        .single()

      if (createError) throw createError
      conversationId = newConversation.id
    }

    // メッセージを送信
    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        content,
      })
      .select()
      .single()

    if (error) throw error

    // 会話の最終メッセージ時間を更新
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString() })
      .eq('id', conversationId)

    return data
  },
}

// Users API
export const usersApi = {
  // 現在のユーザー取得
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching current user:', error)
      // ユーザーが存在しない場合は基本情報を返す
      return {
        id: user.id,
        email: user.email,
        first_name: user.user_metadata?.first_name || null,
        last_name: user.user_metadata?.last_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        display_name: null,
        bio: null,
        skills: [],
        github_url: null,
        portfolio_url: null,
        university: null,
        department: null,
        created_at: user.created_at,
        updated_at: new Date().toISOString()
      }
    }
    return data
  },

  // プロフィール取得
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    return data
  },

  // プロフィール更新
  async updateProfile(updates: {
    display_name?: string | null
    bio?: string | null
    skills?: string[] | null
    github_url?: string | null
    portfolio_url?: string | null
    university?: string | null
    department?: string | null
    avatar_url?: string | null
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single()

    if (error) throw error
    return data
  },
}
