import { supabase } from "./supabase";

// User Interest/Like API
export const userInterestApi = {
  // ユーザーに気になるを送る
  async sendInterest(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_interests')
      .insert({
        user_id: user.id,
        target_user_id: targetUserId,
        interest_type: 'interested'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 気になるを取り消す
  async removeInterest(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('user_interests')
      .delete()
      .eq('user_id', user.id)
      .eq('target_user_id', targetUserId)

    if (error) throw error
  },

  // 自分に送られた気になるを取得
  async getReceivedInterests() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_interests')
      .select(`
        *,
        sender:users!user_interests_user_id_fkey (
          id,
          first_name,
          last_name,
          display_name,
          profile_image_url,
          avatar_url
        )
      `)
      .eq('target_user_id', user.id)
      .eq('interest_type', 'interested')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 自分が送った気になるを取得
  async getSentInterests() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_interests')
      .select(`
        *,
        target:users!user_interests_target_user_id_fkey (
          id,
          first_name,
          last_name,
          display_name,
          profile_image_url,
          avatar_url
        )
      `)
      .eq('user_id', user.id)
      .eq('interest_type', 'interested')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 特定ユーザーに気になるを送ったかチェック
  async checkInterestStatus(targetUserId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('user_interests')
      .select('*')
      .eq('user_id', user.id)
      .eq('target_user_id', targetUserId)
      .eq('interest_type', 'interested')
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return !!data
  }
};
