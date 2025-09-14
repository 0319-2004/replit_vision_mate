-- 現在のユーザーIDを取得するSQL
-- Supabase SQL Editorで実行してください

-- 1. 認証されたユーザーの一覧を確認
SELECT id, email, created_at 
FROM auth.users 
ORDER BY created_at DESC;

-- 2. usersテーブルの内容を確認
SELECT id, email, first_name, last_name 
FROM users 
ORDER BY created_at DESC;

-- 上記の結果からあなたのユーザーIDをコピーして、
-- 以下のサンプルプロジェクトデータのSQLで 'YOUR_ACTUAL_USER_ID' を置き換えてください

