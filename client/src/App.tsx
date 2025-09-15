import { Switch, Route, Router } from "wouter";
import { useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";

// Pages
import LandingPage from "./pages/landing";
import HomePage from "./pages/home";
import DiscoverPage from "./pages/discover";

// 最小限のApp.tsx（段階的にコンポーネントを追加）
export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Router base={window.location.pathname.includes('/replit_vision_mate') ? '/replit_vision_mate' : ''}>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/discover" component={DiscoverPage} />
            <Route path="*" component={LandingPage} />
          </Switch>
        </Router>
      </div>
    </QueryClientProvider>
  );
}