-- 気になる機能用のテーブルを作成
-- Supabaseで実行してください

-- user_interests テーブル作成
CREATE TABLE IF NOT EXISTS user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    interest_type VARCHAR(20) NOT NULL DEFAULT 'interested',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- 同じユーザーが同じ相手に複数回気になるを送ることを防ぐ
    UNIQUE(user_id, target_user_id, interest_type)
);

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_user_interests_target_user_id ON user_interests(target_user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_user_id ON user_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_user_interests_created_at ON user_interests(created_at DESC);

-- RLS (Row Level Security) 設定
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- ポリシー作成
-- ユーザーは自分が送った気になると、自分に送られた気になるのみ表示可能
CREATE POLICY "Users can view their own interests" ON user_interests
    FOR SELECT USING (
        auth.uid() = user_id OR auth.uid() = target_user_id
    );

-- ユーザーは自分の気になるのみ作成可能
CREATE POLICY "Users can create their own interests" ON user_interests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の気になるのみ削除可能
CREATE POLICY "Users can delete their own interests" ON user_interests
    FOR DELETE USING (auth.uid() = user_id);

-- updated_at自動更新用のトリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_interests_updated_at 
    BEFORE UPDATE ON user_interests 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- フィルタリング機能のためのユーザーテーブル更新
-- 既存のusersテーブルにカラムを追加（もし存在しない場合）
DO $$ 
BEGIN
    -- university列を追加（存在しない場合）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='university') THEN
        ALTER TABLE users ADD COLUMN university TEXT;
    END IF;
    
    -- department列を追加（存在しない場合）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='department') THEN
        ALTER TABLE users ADD COLUMN department TEXT;
    END IF;
    
    -- interests列を追加（存在しない場合）
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='interests') THEN
        ALTER TABLE users ADD COLUMN interests TEXT[];
    END IF;
END $$;

-- usersテーブルのインデックス追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);

COMMENT ON TABLE user_interests IS '気になる機能: ユーザー同士の関心表示';
COMMENT ON COLUMN user_interests.user_id IS '気になるを送信したユーザー';
COMMENT ON COLUMN user_interests.target_user_id IS '気になるを受信したユーザー';
COMMENT ON COLUMN user_interests.interest_type IS '関心の種類（interested等）';
