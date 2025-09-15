import { Switch, Route, Router } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth } from "./hooks/useSupabaseAuth";

// Pages
import LandingPage from "./pages/landing";
import HomePage from "./pages/home";
import DiscoverPage from "./pages/discover";
import MyProjectsPage from "./pages/projects/mine";

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
          </div>
        </nav>
        
        <main className="py-8">
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/discover" component={DiscoverPage} />
            <Route path="/projects/mine" component={MyProjectsPage} />
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
  const { user, isLoading } = useAuth();

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
      <Router base={window.location.pathname.includes('/replit_vision_mate') ? '/replit_vision_mate' : ''}>
        {user ? <AuthenticatedApp /> : <LandingPage />}
      </Router>
    </QueryClientProvider>
  );
}