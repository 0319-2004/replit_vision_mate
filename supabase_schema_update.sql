-- Supabase usersテーブルに新しいカラムを追加するSQL
-- 以下をSupabaseダッシュボードのSQL Editorで実行してください

-- 1. universityカラムを追加（存在しない場合のみ）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='university') THEN
        ALTER TABLE users ADD COLUMN university VARCHAR(100);
    END IF;
END $$;

-- 2. departmentカラムを追加（存在しない場合のみ）
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='users' AND column_name='department') THEN
        ALTER TABLE users ADD COLUMN department VARCHAR(100);
    END IF;
END $$;

-- 3. 現在のusersテーブル構造を確認
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

