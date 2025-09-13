import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Eye, Hand, Rocket, Users, Clock, Share, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";

export default function LandingPage() {
  const [domainError, setDomainError] = useState(false);

  useEffect(() => {
    // Check for domain error in URL params
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('error') === 'domain_not_allowed') {
      setDomainError(true);
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">VisionMates</h1>
          </div>
          <Button 
            onClick={() => {
              import('@/hooks/useSupabaseAuth').then(({ useSupabaseAuth }) => {
                // Googleサインインを実行
                import('@/lib/supabase').then(({ supabase }) => {
                  supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: window.location.origin,
                    }
                  });
                });
              });
            }}
            data-testid="button-login"
          >
            始める
          </Button>
        </div>
      </header>

      {/* Domain Error Alert */}
      {domainError && (
        <div className="max-w-4xl mx-auto px-4 pt-8">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>アクセス制限 / Access Restricted</AlertTitle>
            <AlertDescription>
              このアプリケーションは青山学院大学のメールアドレス（@aoyama.ac.jp または @aoyama.jp）でのみご利用いただけます。
              <br /><br />
              This application is only available for Aoyama Gakuin University email addresses (@aoyama.ac.jp or @aoyama.jp).
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            あなたのアイデアを<span className="text-primary">アクション</span>に
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
小さなアイデアから大きな変化へ。VisionMatesは、あなたのビジョンを形にするためのチームを見つけ、進捗を共有し、一緒に行動を起こせるプラットフォームです。
          </p>
          <Button 
            size="lg" 
            onClick={() => {
              import('@/lib/supabase').then(({ supabase }) => {
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin,
                  }
                });
              });
            }}
            className="mr-4"
            data-testid="button-hero-signup"
          >
            あなたのビジョンを始める
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-learn-more"
          >
            詳しく知る
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
                ビジョンを現実にする、すべてのツール
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>ビジョン主導プロジェクト</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  あなたのアイデアや解決したい課題をプロジェクトとして投稿できます。規模の大小は問いません。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="flex gap-1">
                    <Eye className="w-4 h-4 text-primary" />
                    <Hand className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <CardTitle>参加シグナル</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  ウォッチ、手を上げる、コミットで気になるプロジェクトへの参加意思を表明できます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>進捗更新</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  チャットで埋もれがちな進捗も、わかりやすいタイムライン表示で確認できます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>発見モード</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  カード形式でプロジェクトをスワイプして、興味のあるものを素早く発見できます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Share className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>簡単シェア</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  LINE、Instagram、LinkedInなどで簡単に友達を招待できます。
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-primary text-lg">👏</div>
                </div>
                <CardTitle>軽量コラボレーション</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  コメントやリアクションでお互いを応援し、一緒にモチベーションを高めていけます。
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            あなたのビジョンを現実にしませんか？
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            VisionMatesで、今日からあなたのアイデアを行動に変えていきましょう。
          </p>
          <Button 
            size="lg" 
            onClick={() => {
              import('@/lib/supabase').then(({ supabase }) => {
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: window.location.origin,
                  }
                });
              });
            }}
            data-testid="button-cta-signup"
          >
            今すぐ始める
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 VisionMates. アイデアをアクションに。</p>
        </div>
      </footer>
    </div>
  );
}