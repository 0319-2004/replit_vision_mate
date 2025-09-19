-- サンプルプロジェクトデータを作成するSQL
-- 実行前に get_user_id.sql でユーザーIDを確認し、YOUR_ACTUAL_USER_ID を置き換えてください

-- サンプルプロジェクトを挿入
INSERT INTO projects (title, description, creator_id, is_active) VALUES 
('アプリ開発プロジェクト', '私のモバイルアプリ開発を手伝ってくれる方を募集しています。React NativeとFirebaseを使用予定です。', '59223da0-1933-403c-9d95-760e08577c8e', true),
('ウェブサイト制作', 'ポートフォリオサイトを一緒に作りませんか？デザインからコーディングまで一緒に学びましょう。', '59223da0-1933-403c-9d95-760e08577c8e', true),
('AIチャットボット開発', 'OpenAI APIを使ったチャットボットを開発します。Python、FastAPI経験者歓迎！', '59223da0-1933-403c-9d95-760e08577c8e', true),
('Eコマースサイト構築', 'Next.jsとStripeを使ったオンラインショップを作成します。フルスタック開発に興味のある方募集中。', '59223da0-1933-403c-9d95-760e08577c8e', true);

-- 作成されたプロジェクトを確認
SELECT id, title, description, creator_id, is_active, created_at 
FROM projects 
ORDER BY created_at DESC;

