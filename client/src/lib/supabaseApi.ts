import { supabase } from './supabase'
import type { 
  Project, 
  PublicUser, 
  Participation, 
  Message,
  MessageWithSender,
  ConversationWithMessages,
  Conversation,
  User,
  ProjectLike,
  UserSkill,
  ProjectRequiredSkill,
  ProjectWithCreator
} from "@shared/schema";


// Project API
export const projectsApi = {
  // 全プロジェクト取得
  async getAll(): Promise<Project[]> {
    try {
      console.log('🔍 Fetching projects from Supabase...');
      
      // まず基本的な接続テスト（count取得：head=trueでボディを返さず件数のみ）
      const { count: testCount, error: testError } = await supabase
        .from('projects')
        .select('*', { count: 'exact', head: true });
      
      if (testError) {
        console.error('❌ Supabase connection test failed:', testError);
        console.error('❌ Error details:', {
          message: testError.message,
          details: testError.details,
          hint: testError.hint,
          code: testError.code
        });
        throw testError;
      }
      
      console.log('✅ Supabase connection test passed', typeof testCount === 'number' ? `(rows: ${testCount})` : '');
      
      // プロジェクトデータを取得
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          creator:users!projects_creator_id_fkey (
            id,
            first_name,
            last_name,
            display_name,
            avatar_url,
            profile_image_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('❌ Supabase error fetching projects:', error)
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        throw error
      }
      
      // 0件の場合は、データ存在確認のためフィルタ無しでもう一度確認（デバッグ目的）
      let rows = data || [];
      if (!rows || rows.length === 0) {
        console.warn('⚠️ No active projects found. Retrying without is_active filter to diagnose data state...');
        const { data: allProjects, error: allError } = await supabase
          .from('projects')
          .select(`
            *,
            creator:users!projects_creator_id_fkey (
              id,
              first_name,
              last_name,
              display_name,
              avatar_url,
              profile_image_url
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20);
        if (allError) {
          console.error('❌ Supabase secondary fetch error:', allError);
        } else {
          console.log('🔎 Secondary fetch (no filter) rows:', allProjects?.length || 0);
          rows = allProjects || [];
        }
      }

      const formatted = (rows || []).map((project: any) => ({
        id: project.id,
        title: project.title,
        description: project.description,
        creatorId: project.creator_id,
        isActive: project.is_active,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        creator: {
          id: project.creator?.id,
          firstName: project.creator?.first_name,
          lastName: project.creator?.last_name,
          displayName: project.creator?.display_name,
          avatarUrl: project.creator?.avatar_url,
          profileImageUrl: project.creator?.profile_image_url,
        },
      }));

      console.log('✅ Projects fetched successfully:', formatted.length, 'projects');
      console.log('📊 Sample project data:', formatted[0] || 'No projects found');
      return formatted
    } catch (error) {
      console.error('❌ Error in getAll:', error)
      console.error('❌ Full error object:', error);
      return []
    }
  },

  // 発見用プロジェクト取得（ページネーション対応）
  async getForDiscover(limit: number = 12, lastCreatedAt?: string, lastId?: string): Promise<{
    projects: any[],
    hasMore: boolean,
    nextCursor: { lastCreatedAt: string, lastId: string } | null
  }> {
    try {
      // Supabaseから直接データを取得
      let query = supabase
        .from('projects')
        .select(`
          *,
          creator:users!projects_creator_id_fkey (
            id,
            first_name,
            profile_image_url
          ),
          participations (
            type,
            user_id
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(limit);

      // カーソルベースのページネーション
      if (lastCreatedAt && lastId) {
        query = query.or(`created_at.lt.${lastCreatedAt},and(created_at.eq.${lastCreatedAt},id.lt.${lastId})`);
      }

      const { data: projects, error } = await query;

      if (error) {
        console.error('Supabase error in getForDiscover:', error);
        throw error;
      }

      // フォーマットを適応  
      const formattedProjects = (projects || []).map(project => ({
        id: project.id,
        title: project.title,
        description: project.description,
        // camelCaseに正規化（UIはcamelCaseを参照）
        creatorId: project.creator_id,
        isActive: project.is_active,
        createdAt: project.created_at,
        updatedAt: project.updated_at,
        creator: {
          id: project.creator?.id,
          firstName: project.creator?.first_name,
          profileImageUrl: project.creator?.profile_image_url,
        },
        participations: (project.participations || []).map((p: any) => ({
          type: p.type,
          userId: p.user_id,
        })),
      }));

      const hasMore = formattedProjects.length === limit;
      const nextCursor = formattedProjects.length > 0 ? {
        lastCreatedAt: formattedProjects[formattedProjects.length - 1].createdAt || '',
        lastId: formattedProjects[formattedProjects.length - 1].id
      } : null;

      return {
        projects: formattedProjects,
        hasMore,
        nextCursor
      };
    } catch (error) {
      console.error('Error in getForDiscover:', error)
      return {
        projects: [],
        hasMore: false,
        nextCursor: null
      }
    }
  },

  // 旧バージョン（互換性のため）
  async getForDiscoverLegacy(): Promise<ProjectWithCreator[]> {
    const result = await this.getForDiscover(20);
    return result.projects;
  },

  // プロジェクト詳細取得
  async getById(id: string) {
    try {
      // まず基本的なプロジェクト情報と作成者情報を取得
      const { data: project, error: projectError } = await supabase
        .from('projects')
        .select(`
          *,
          creator:users!creator_id (
            id,
            first_name,
            last_name,
            display_name,
            avatar_url,
            profile_image_url
          )
        `)
        .eq('id', id)
        .single()

      if (projectError) {
        console.error('Error fetching project:', projectError)
        throw projectError
      }

      // 参加情報を取得（エラーが発生しても続行）
      let participations = []
      try {
        const { data: participationData } = await supabase
          .from('participations')
          .select(`
            *,
            user:users!user_id (
              id,
              first_name,
              last_name,
              display_name,
              avatar_url,
              profile_image_url
            )
          `)
          .eq('project_id', id)
        
        participations = participationData || []
      } catch (error) {
        console.warn('Could not fetch participations:', error)
      }

      // 進捗更新を取得（エラーが発生しても続行）
      let progressUpdates = []
      try {
        const { data: progressData } = await supabase
          .from('progress_updates')
          .select(`
            *,
            user:users!user_id (
              id,
              first_name,
              last_name,
              display_name,
              avatar_url,
              profile_image_url
            )
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: false })
        
        progressUpdates = progressData || []
      } catch (error) {
        console.warn('Could not fetch progress updates:', error)
      }

      // コメントを取得（エラーが発生しても続行）
      let comments = []
      try {
        const { data: commentData } = await supabase
          .from('comments')
          .select(`
            *,
            user:users!user_id (
              id,
              first_name,
              last_name,
              display_name,
              avatar_url,
              profile_image_url
            )
          `)
          .eq('project_id', id)
          .order('created_at', { ascending: false })
        
        comments = commentData || []
      } catch (error) {
        console.warn('Could not fetch comments:', error)
      }

      // データの正規化とクリーンアップ
      const cleanProject = {
        ...project,
        participations: participations || [],
        progressUpdates: (progressUpdates || []).map(update => ({
          ...update,
          createdAt: update.created_at || update.createdAt || new Date().toISOString()
        })),
        comments: (comments || []).map(comment => ({
          ...comment,
          createdAt: comment.created_at || comment.createdAt || new Date().toISOString()
        })),
        createdAt: project.created_at || project.createdAt || new Date().toISOString()
      }

      return cleanProject
    } catch (error) {
      console.error('Error in getById:', error)
      throw error
    }
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
  async update(id: string, updates: any) {
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

  // 排他的な参加設定（既存の参加を削除してから新しい参加を追加）
  async setExclusive(projectId: string, type: 'watch' | 'raise_hand' | 'commit') {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // トランザクション的に処理：まず既存の参加をすべて削除
    const { error: deleteError } = await supabase
      .from('participations')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id)

    if (deleteError) {
      console.warn('Failed to delete existing participations:', deleteError)
      // 削除エラーは無視して続行（存在しない可能性）
    }

    // 新しい参加を追加
    const { data, error: insertError } = await supabase
      .from('participations')
      .insert({
        project_id: projectId,
        user_id: user.id,
        type,
      })
      .select()
      .single()

    if (insertError) throw insertError
    return data
  },

  // ユーザーの全参加を削除
  async removeAll(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('participations')
      .delete()
      .eq('project_id', projectId)
      .eq('user_id', user.id)

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

// Project Likes API
export const projectLikesApi = {
  // いいね切り替え
  async toggle(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 既存のいいねをチェック
    const { data: existingLike, error: checkError } = await supabase
      .from('project_likes')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existingLike) {
      // いいね削除
      const { error } = await supabase
        .from('project_likes')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (error) throw error
      return { action: 'removed' as const }
    } else {
      // いいね追加
      const { data, error } = await supabase
        .from('project_likes')
        .insert({
          project_id: projectId,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return { action: 'added' as const, data }
    }
  },

  // ユーザーがいいねしたプロジェクト一覧取得
  async getUserLikes(limit: number = 12, lastCreatedAt?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    let query = supabase
      .from('project_likes')
      .select(`
        created_at,
        project:projects!project_id (
          *,
          creator:users!creator_id (
            id,
            first_name,
            profile_image_url
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (lastCreatedAt) {
      query = query.lt('created_at', lastCreatedAt)
    }

    const { data, error } = await query.limit(limit)

    if (error) throw error
    return data || []
  },
}

// Project Hides API
export const projectHidesApi = {
  // 非表示切り替え
  async toggle(projectId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // 既存の非表示をチェック
    const { data: existingHide, error: checkError } = await supabase
      .from('project_hides')
      .select('*')
      .eq('project_id', projectId)
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') throw checkError

    if (existingHide) {
      // 非表示削除（再表示）
      const { error } = await supabase
        .from('project_hides')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', user.id)

      if (error) throw error
      return { action: 'removed' as const }
    } else {
      // 非表示追加
      const { data, error } = await supabase
        .from('project_hides')
        .insert({
          project_id: projectId,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error
      return { action: 'added' as const, data }
    }
  },
}

// User Skills API
export const userSkillsApi = {
  // ユーザーのスキル取得
  async getUserSkills(userId?: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const targetUserId = userId || user.id;

    const { data, error } = await supabase
      .from('user_skills')
      .select('*')
      .eq('user_id', targetUserId)
      .order('skill')

    if (error) throw error
    return data || []
  },

  // スキル追加/更新
  async upsertSkill(skill: string, level: number = 1) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_skills')
      .upsert({
        user_id: user.id,
        skill,
        level,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // スキル削除
  async removeSkill(skill: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_skills')
      .delete()
      .eq('user_id', user.id)
      .eq('skill', skill)

    if (error) throw error
  },
}

// Project Required Skills API  
export const projectRequiredSkillsApi = {
  // プロジェクトの必要スキル取得
  async getProjectSkills(projectId: string) {
    const { data, error } = await supabase
      .from('project_required_skills')
      .select('*')
      .eq('project_id', projectId)
      .order('priority', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 必要スキル追加/更新
  async upsertSkill(projectId: string, skill: string, priority: number = 1) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('project_required_skills')
      .upsert({
        project_id: projectId,
        skill,
        priority,
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 必要スキル削除
  async removeSkill(projectId: string, skill: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('project_required_skills')
      .delete()
      .eq('project_id', projectId)
      .eq('skill', skill)

    if (error) throw error
  },

  // 協力者候補検索（RPCファンクション使用）
  async searchCandidates(
    projectId: string, 
    matchAll: boolean = false,
    minOverlap: number = 1,
    limit: number = 20,
    offset: number = 0
  ) {
    const { data, error } = await supabase
      .rpc('search_candidates_for_project', {
        pid: projectId,
        match_all: matchAll,
        min_overlap: minOverlap,
        limit_n: limit,
        offset_n: offset
      })

    if (error) throw error

    // ユーザー情報を別途取得
    if (data && data.length > 0) {
      const userIds = data.map((candidate: any) => candidate.user_id);
      
      const { data: users, error: usersError } = await supabase
        .from('users')
        .select('id, first_name, last_name, display_name, avatar_url, profile_image_url')
        .in('id', userIds)

      if (usersError) throw usersError

      // データを結合
      return data.map((candidate: any) => ({
        ...candidate,
        user: users?.find((u: any) => u.id === candidate.user_id)
      }))
    }

    return data || []
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
      
      // ユーザーが存在しない場合は自動作成を試行
      if (error.code === 'PGRST116') { // No rows found
        console.log('User not found in users table, creating...')
        
        const newUserData = {
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
        }
        
        const { data: createdUser, error: createError } = await supabase
          .from('users')
          .insert(newUserData)
          .select()
          .single()
          
        if (createError) {
          console.error('Error creating user:', createError)
          // 作成に失敗した場合は基本情報を返す
          return {
            ...newUserData,
            created_at: user.created_at,
            updated_at: new Date().toISOString()
          }
        }
        
        return createdUser
      }
      
      // その他のエラーの場合は基本情報を返す
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
