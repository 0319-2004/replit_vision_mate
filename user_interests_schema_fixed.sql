-- 気になる機能用のテーブルを作成
-- Supabaseで実行してください（エラー対策版）

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view their own interests" ON user_interests;
DROP POLICY IF EXISTS "Users can insert their own interests" ON user_interests;
DROP POLICY IF EXISTS "Users can delete their own interests" ON user_interests;

-- 既存のテーブルを削除（存在する場合）
DROP TABLE IF EXISTS user_interests;

-- user_interests テーブル作成
CREATE TABLE user_interests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- RLS (Row Level Security) 有効化
ALTER TABLE user_interests ENABLE ROW LEVEL SECURITY;

-- RLSポリシー作成
CREATE POLICY "Users can view their own interests" ON user_interests
    FOR SELECT USING (auth.uid() = user_id OR auth.uid() = target_user_id);

CREATE POLICY "Users can insert their own interests" ON user_interests
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interests" ON user_interests
    FOR DELETE USING (auth.uid() = user_id);

-- usersテーブルに大学・学部・興味関心フィールドを追加（存在しない場合）
DO $$ 
BEGIN
    -- 大学フィールド
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'university') THEN
        ALTER TABLE users ADD COLUMN university VARCHAR(255);
    END IF;
    
    -- 学部フィールド
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(255);
    END IF;
    
    -- 興味関心フィールド
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'interests') THEN
        ALTER TABLE users ADD COLUMN interests TEXT[];
    END IF;
END $$;

-- usersテーブルのインデックス追加（検索性能向上のため）
CREATE INDEX IF NOT EXISTS idx_users_university ON users(university);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN(interests);

-- コメント追加
COMMENT ON TABLE user_interests IS '気になる機能: ユーザー同士の関心表示';
COMMENT ON COLUMN user_interests.user_id IS '気になるを送信したユーザー';
COMMENT ON COLUMN user_interests.target_user_id IS '気になるを受信したユーザー';
COMMENT ON COLUMN user_interests.interest_type IS '関心の種類 (interested等)';
