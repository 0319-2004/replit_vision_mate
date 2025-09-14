import { Switch, Route, Router } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Pages
import LandingPage from "@/pages/landing";
import HomePage from "@/pages/home";
import DiscoverPage from "@/pages/discover";
import CreateProjectPage from "@/pages/projects/new";
import MyProjectsPage from "@/pages/projects/mine";
import ProjectDetailPage from "@/pages/projects/[id]";
import ProfilePage from "@/pages/profile/index";
import ProfileEditPage from "@/pages/profile/edit";
import PublicProfilePage from "@/pages/profile/[id]";
import MessagesPage from "@/pages/messages/index";
import SettingsPage from "@/pages/settings";
import DebugPage from "@/pages/debug";
import NotFound from "@/pages/not-found";

function AuthenticatedRouter() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/discover" component={DiscoverPage} />
      <Route path="/projects/new" component={CreateProjectPage} />
      <Route path="/projects/mine" component={MyProjectsPage} />
      <Route path="/projects/:id" component={ProjectDetailPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/profile/edit" component={ProfileEditPage} />
      <Route path="/profile/:id" component={PublicProfilePage} />
      <Route path="/messages" component={MessagesPage} />
      <Route path="/settings" component={SettingsPage} />
      <Route path="/debug" component={DebugPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AppRouter() {
  const { isAuthenticated, isLoading, user, session } = useAuth();

  // デバッグ用ログ
  console.log('🏠 AppRouter state:', { isAuthenticated, isLoading, hasUser: !!user, hasSession: !!session });

  // 10秒以上ローディングの場合、強制的にリロード（最後の手段）
  useEffect(() => {
    if (isLoading) {
      console.log('⏳ Starting 10s timeout for page reload...');
      const timeout = setTimeout(() => {
        console.log('🚨 Forcing page reload after 10 seconds as last resort');
        window.location.reload();
      }, 10000);
      return () => {
        console.log('⏹️ Clearing 10s reload timeout');
        clearTimeout(timeout);
      };
    }
  }, [isLoading]);

  if (isLoading) {
    console.log('🔄 Showing loading screen...');
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">読み込み中...</p>
          <p className="text-sm text-gray-500 mt-2">最大5秒で読み込み完了します</p>
          <p className="text-xs text-gray-400 mt-1">User: {!!user ? 'Yes' : 'No'} | Session: {!!session ? 'Yes' : 'No'}</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="*" component={LandingPage} />
      ) : (
        <Route path="*" component={AuthenticatedApp} />
      )}
    </Switch>
  );
}

function AuthenticatedApp() {
  const { user } = useAuth();
  const style = {
    "--sidebar-width": "20rem",
    "--sidebar-width-icon": "4rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <header className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <SidebarTrigger data-testid="button-sidebar-toggle" />
              <div className="font-semibold text-lg">VisionMates</div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Avatar className="h-8 w-8">
                <AvatarImage src={(user as any)?.profileImageUrl} />
                <AvatarFallback>
                  {(user as any)?.firstName?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => {
                  import('@/lib/supabase').then(({ supabase }) => {
                    supabase.auth.signOut();
                  });
                }}
                data-testid="button-logout"
              >
                ログアウト
              </Button>
            </div>
          </header>
          <main className="flex-1 overflow-auto">
            <AuthenticatedRouter />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function App() {
  // GitHub Pagesのベースパスを設定
  const basePath = import.meta.env.PROD ? '/replit_vision_mate' : '';
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <ThemeProvider defaultTheme="light">
            <Router base={basePath}>
              <AppRouter />
            </Router>
            <Toaster />
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;