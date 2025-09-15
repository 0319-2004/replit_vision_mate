import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Eye, Hand, Rocket, Users, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";
import type { Project, User } from "@shared/schema";

export default function HomePage() {
  const { user } = useAuth();
  
  // デバッグ用：認証状態をログ出力
  console.log('Current user:', user);
  console.log('Is user logged in:', !!user);
  const { data: projects = [], isLoading, error } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // デバッグ用：プロジェクトクエリの状態をログ出力
  console.log('Projects loading:', isLoading);
  console.log('Projects data:', projects);
  console.log('Projects error:', error);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">プロジェクト読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 md:px-0 py-0 md:py-0">
      {/* Welcome Header */}
      <div className="flex justify-between items-center mb-4 md:mb-6 px-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold mb-1">
おかえりなさい、{(user as User)?.firstName || 'ビジョナリー'}さん！👋
          </h1>
          <p className="text-sm text-muted-foreground">
新しいプロジェクトを発見したり、あなたのビジョンをコミュニティと共有しましょう。
          </p>
        </div>
        <div className="flex gap-2 px-1">
          <Link href="/discover">
            <Button variant="outline" data-testid="button-discover">
              <Users className="w-4 h-4 mr-2" />
発見
            </Button>
          </Link>
          <Link href="/projects/new">
            <Button data-testid="button-create-project">
              <Plus className="w-4 h-4 mr-2" />
プロジェクト作成
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-4 md:mb-6 px-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Rocket className="w-5 h-5 text-primary mr-2" />
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
                <p className="text-xs text-muted-foreground">アクティブプロジェクト</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Eye className="w-5 h-5 text-blue-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">👀</p>
                <p className="text-xs text-muted-foreground">ウォッチ中</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Hand className="w-5 h-5 text-yellow-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">✋</p>
                <p className="text-xs text-muted-foreground">手を上げた</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center">
              <Rocket className="w-5 h-5 text-green-500 mr-2" />
              <div>
                <p className="text-2xl font-bold">🚀</p>
                <p className="text-xs text-muted-foreground">コミット済み</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Projects */}
      <section>
        <div className="flex justify-between items-center mb-4 md:mb-6 px-4">
          <h2 className="text-lg md:text-xl font-semibold">最近のプロジェクト</h2>
          <Link href="/projects">
            <Button variant="ghost" data-testid="button-view-all-projects">
すべて表示
            </Button>
          </Link>
        </div>

        {projects.length === 0 ? (
          <Card>
            <CardContent className="py-8 md:py-12 text-center">
              <Rocket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">まだプロジェクトがありません</h3>
              <p className="text-muted-foreground mb-4">
あなたのビジョンをシェアして、みんなで行動を起こしてみませんか！
              </p>
              <Link href="/projects/new">
                <Button data-testid="button-first-project">
                  <Plus className="w-4 h-4 mr-2" />
最初のプロジェクトを作成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:gap-6 px-0 md:px-0">
            {projects.slice(0, 6).map((project: Project) => (
              <Card key={project.id} className="hover-elevate">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-base md:text-lg mb-2">
                        <Link href={`/projects/${project.id}`} className="hover:text-primary">
                          {project.title}
                        </Link>
                      </CardTitle>
                      <p className="text-muted-foreground text-sm line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        0
                      </span>
                      <span className="flex items-center gap-1">
                        <Hand className="w-4 h-4" />
                        0
                      </span>
                      <span className="flex items-center gap-1">
                        <Rocket className="w-4 h-4" />
                        0
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        0
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {(() => {
                        try {
                          return project.createdAt ? formatDistanceToNow(new Date(project.createdAt), { addSuffix: true }) : '';
                        } catch (e) {
                          return '';
                        }
                      })()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}