import { Switch, Route, Router } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";

// Pages
import LandingPage from "./pages/landing";
import HomePage from "./pages/home";
import DiscoverPage from "./pages/discover";
import MyProjectsPage from "./pages/projects/mine";
import DebugPage from "./pages/debug";

// App with authentication
function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4 border-b">
          <h1 className="text-2xl font-bold text-blue-600">VisionMates</h1>
          <div className="flex gap-4">
            <a href="/" className="text-gray-700 hover:text-blue-600">ホーム</a>
            <a href="/discover" className="text-gray-700 hover:text-blue-600">発見</a>
            <a href="/projects/mine" className="text-gray-700 hover:text-blue-600">マイプロジェクト</a>
            <a href="/debug" className="text-gray-700 hover:text-blue-600">デバッグ</a>
          </div>
        </nav>
        
        <main className="py-8">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/discover" component={DiscoverPage} />
            <Route path="/projects/mine" component={MyProjectsPage} />
            <Route path="/debug" component={DebugPage} />
            <Route path="*">
              <div className="text-center py-12">
                <h2 className="text-2xl font-bold mb-4">ページが見つかりません</h2>
                <a href="/" className="text-blue-600 hover:underline">ホームに戻る</a>
              </div>
            </Route>
          </Switch>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  const { user, isLoading } = useSupabaseAuth();

  // GitHub Pages SPA routing support
  useEffect(() => {
    const handleSPARouting = () => {
      const l = window.location;
      if (l.search[1] === '/') {
        const decoded = l.search.slice(1).split('&').map(function(s) { 
          return s.replace(/~and~/g, '&')
        }).join('?');
        window.history.replaceState(null, null,
            l.pathname.slice(0, -1) + decoded + l.hash
        );
      }
    };
    
    handleSPARouting();
    
    // OAuth認証後のハッシュ処理
    const handleAuthCallback = () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        console.log('🔐 OAuth callback detected:', hash);
        // ハッシュをクエリパラメータに変換してSupabaseが処理できるようにする
        const params = new URLSearchParams(hash.substring(1));
        const newUrl = new URL(window.location.href);
        newUrl.hash = '';
        params.forEach((value, key) => {
          newUrl.searchParams.set(key, value);
        });
        window.history.replaceState({}, '', newUrl.toString());
      }
    };
    
    handleAuthCallback();
  }, []);

  // デバッグ用ログ
  console.log('Current user:', user);
  console.log('Is user logged in:', !!user);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>読み込み中...</p>
        </div>
      </div>
    );
  }

  // ベースパスの決定
  const basePath = import.meta.env.PROD ? '/replit_vision_mate' : '';

  return (
    <QueryClientProvider client={queryClient}>
      <Router base={basePath}>
        {user ? <AuthenticatedApp /> : <LandingPage />}
      </Router>
    </QueryClientProvider>
  );
}