import { Switch, Route, Router, Link } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useSupabaseAuth } from "./hooks/useSupabaseAuth";
import LinkedInShell from "@/components/linkedin-shell";

// Pages
import LandingPage from "./pages/landing";
import HomePage from "./pages/home";
import DiscoverPage from "./pages/discover";
import MyProjectsPage from "./pages/projects/mine";
import DebugPage from "./pages/debug";

// App with authentication
function AuthenticatedApp() {
  return (
    <LinkedInShell>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/discover" component={DiscoverPage} />
        <Route path="/projects/mine" component={MyProjectsPage} />
        <Route path="/debug" component={DebugPage} />
        <Route path="*">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold mb-4">ページが見つかりません</h2>
            <Link href="/" className="text-blue-600 hover:underline">ホームに戻る</Link>
          </div>
        </Route>
      </Switch>
    </LinkedInShell>
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
        const newUrl = l.pathname.slice(0, -1) + decoded + l.hash;
        window.history.replaceState({}, '', newUrl);
      }
    };
    
    handleSPARouting();
    
    // OAuth認証後のハッシュ処理
    const handleAuthCallback = () => {
      const hash = window.location.hash;
      const search = window.location.search;
      
      console.log('🔐 Checking for auth callback:', { hash, search });
      
      if (hash && (hash.includes('access_token') || hash.includes('error'))) {
        console.log('🔐 OAuth callback detected in hash:', hash);
        // ハッシュをクエリパラメータに変換してSupabaseが処理できるようにする
        const params = new URLSearchParams(hash.substring(1));
        const newUrl = new URL(window.location.href);
        newUrl.hash = '';
        params.forEach((value, key) => {
          newUrl.searchParams.set(key, value);
        });
        window.history.replaceState({}, '', newUrl.toString());
        console.log('🔐 Converted hash to query params:', newUrl.toString());
      } else if (search && (search.includes('access_token') || search.includes('error'))) {
        console.log('🔐 OAuth callback detected in search params:', search);
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

  return (
    <QueryClientProvider client={queryClient}>
      <Router hook={useHashLocation}>
        {user ? <AuthenticatedApp /> : <LandingPage />}
      </Router>
    </QueryClientProvider>
  );
}