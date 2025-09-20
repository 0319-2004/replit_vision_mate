-- RLSポリシー確認用SQL
-- GitHub Pagesでの認証・データ取得問題の診断用

-- 1. 現在のRLSポリシー状況を確認
SELECT 
    schemaname,
    tablename, 
    rowsecurity as rls_enabled,
    hasoids
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('projects', 'users', 'participations');

-- 2. projectsテーブルのポリシー一覧
SELECT 
    polname as policy_name,
    polcmd as command,
    polroles as roles,
    polqual as using_expression,
    polwithcheck as with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.projects'::regclass;

-- 3. usersテーブルのポリシー一覧  
SELECT 
    polname as policy_name,
    polcmd as command,
    polroles as roles,
    polqual as using_expression,
    polwithcheck as with_check_expression
FROM pg_policy 
WHERE polrelid = 'public.users'::regclass;

-- 4. anonユーザーでのprojects読み取りテスト
-- (注意: このクエリはSupabase Studioで実行してください)
SET role anon;
SELECT count(*) as anon_accessible_projects FROM public.projects;
RESET role;

-- 5. authenticatedユーザーでのprojects読み取りテスト  
-- (注意: このクエリはSupabase Studioで実行してください)
SET role authenticated;
SELECT count(*) as authenticated_accessible_projects FROM public.projects;
RESET role;

-- 6. RPC関数の権限確認
SELECT 
    p.proname as function_name,
    p.proacl as access_privileges,
    array_to_string(p.proargnames, ', ') as argument_names,
    pg_get_function_identity_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public' 
AND p.proname LIKE '%project%';

-- 7. サンプルプロジェクトデータの確認（デバッグ用）
SELECT 
    id,
    title,
    creator_id,
    is_active,
    created_at
FROM public.projects 
ORDER BY created_at DESC 
LIMIT 5;

-- 8. ユーザーテーブルのサンプルデータ確認
SELECT 
    id,
    email,
    first_name,
    last_name,
    created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 3;

-- 推奨対応策:
-- RLSが厳しすぎる場合の修正例

-- 【案1】 anonユーザーにprojectsテーブルの読み取り権限を追加
-- CREATE POLICY "Allow anon read projects" ON public.projects
--     FOR SELECT USING (true);

-- 【案2】 authenticatedユーザー向けのより寛容なポリシー
-- CREATE POLICY "Allow authenticated read all projects" ON public.projects
--     FOR SELECT TO authenticated USING (true);

-- 【案3】 特定の条件下でのアクセス許可（is_activeなプロジェクトのみ）
-- CREATE POLICY "Allow read active projects" ON public.projects
--     FOR SELECT USING (is_active = true);
