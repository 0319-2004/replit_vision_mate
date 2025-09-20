import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({});

  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 Debug: Starting auth check...');
      
      try {
        // 1. Supabase接続テスト
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log('📋 Session check:', { session: !!session, error: sessionError });

        // 2. ユーザー情報取得テスト
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        console.log('👤 User check:', { user: !!user, error: userError });

        // 3. データベース接続テスト
        const { data: projects, error: projectsError } = await supabase
          .from('projects')
          .select('*')
          .limit(1);
        console.log('🗃️ Database check:', { projects, error: projectsError });

        setDebugInfo({
          session: !!session,
          sessionError,
          user: !!user,
          userError,
          projects: projects?.length || 0,
          projectsError,
          timestamp: new Date().toISOString()
        });

      } catch (error) {
        console.error('💥 Debug check failed:', error);
        const message = error instanceof Error ? error.message : String(error);
        setDebugInfo({
          error: message,
          timestamp: new Date().toISOString()
        });
      }
    };

    checkAuth();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">🔍 デバッグ情報</h1>
      <div className="bg-gray-100 p-4 rounded-lg">
        <pre className="text-sm overflow-auto">
          {JSON.stringify(debugInfo, null, 2)}
        </pre>
      </div>
      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Console（F12）も確認してください。
        </p>
      </div>
    </div>
  );
}
