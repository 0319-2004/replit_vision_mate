import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Eye, Hand, Rocket, Plus, Calendar, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { CollaboratorSearch } from "@/components/collaborator-search";
import type { Project } from "@shared/schema";

type ProjectWithStats = Project & {
  participationCounts: {
    watch: number;
    raiseHand: number; 
    commit: number;
  };
};

export default function MyProjectsPage() {
  const { user } = useAuth();
  const [selectedProjectForSearch, setSelectedProjectForSearch] = useState<string | null>(null);
  
  const { data: projects = [], isLoading, error } = useQuery<ProjectWithStats[]>({
    queryKey: ["/api/projects"],
    select: (data: any[]) => {
      console.log('Projects data in select:', data);
      console.log('Current user in mine.tsx:', user);
      
      if (!data || !Array.isArray(data)) {
        console.log('No valid data array found');
        return [];
      }
      
      // Filter to only show user's own projects (try both creatorId and creator_id)
      const userProjects = data.filter(project => {
        const projectCreatorId = project.creatorId || project.creator_id;
        const currentUserId = (user as any)?.id;
        console.log('Comparing project creator:', projectCreatorId, 'with user:', currentUserId);
        return projectCreatorId === currentUserId;
      });
      
      console.log('Filtered user projects:', userProjects);
      return userProjects;
    }
  });

  // デバッグ用ログ（select関数の外で実行）
  console.log('Projects loading:', isLoading);
  console.log('Projects data:', projects);
  console.log('Projects error:', error);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">あなたのプロジェクトを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('❌ マイプロジェクト取得エラー:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 14.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">プロジェクトの読み込みに失敗しました</h3>
          <p className="text-muted-foreground mb-4">
            {error instanceof Error ? error.message : 'ネットワークエラーまたは認証の問題が発生しました'}
          </p>
          <Button onClick={() => window.location.reload()} variant="outline">
            再読み込み
          </Button>
        </div>
      </div>
    );
  }

  if (!projects || projects.length === 0) {
    return (
      <div className="px-0 md:px-0 py-4 md:py-6">
        <div className="flex justify-between items-center mb-4 md:mb-6 px-4">
          <h1 className="text-2xl md:text-3xl font-bold">マイプロジェクト</h1>
          <Link href="/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              新規作成
            </Button>
          </Link>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-muted-foreground mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-2-2m0 0l-2 2m2-2v6m-13 4l2 2m0 0l2-2m-2 2v-6" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">まだプロジェクトがありません</h3>
            <p className="text-muted-foreground mb-4">最初のプロジェクトを作成して始めましょう</p>
            <Link href="/projects/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                プロジェクト作成
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-0 md:px-0 py-4 md:py-6">
      <div className="flex justify-between items-center mb-4 md:mb-6 px-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">マイプロジェクト</h1>
          <p className="text-sm text-muted-foreground mt-1">
            あなたのビジョンを現実に変えるために作成したプロジェクト
          </p>
        </div>
        <Link href="/projects/new">
          <Button data-testid="button-create-project">
            <Plus className="w-4 h-4 mr-2" />
プロジェクト作成
          </Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <Card className="text-center">
          <CardContent className="py-8 md:py-12">
            <div className="max-w-md mx-auto">
              <h3 className="text-lg font-medium mb-2">まだプロジェクトがありません</h3>
              <p className="text-muted-foreground mb-6">
あなたのビジョンを現実にしませんか？最初のプロジェクトを作成して、コミュニティを築いていきましょう。
              </p>
              <Link href="/projects/new">
                <Button data-testid="button-create-first-project">
                  <Plus className="w-4 h-4 mr-2" />
最初のプロジェクトを作成
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project.id} className="hover-elevate">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant={project.isActive ? "default" : "secondary"}>
                    {project.isActive ? "アクティブ" : "非アクティブ"}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {(() => {
                      try {
                        return formatDistanceToNow(new Date(project.createdAt || Date.now()), { addSuffix: true });
                      } catch (e) {
                        return '';
                      }
                    })()}
                  </div>
                </div>
                <CardTitle className="line-clamp-2">
                  <Link 
                    href={`/projects/${project.id}`}
                    className="hover:text-primary transition-colors"
                    data-testid={`link-project-${project.id}`}
                  >
                    {project.title}
                  </Link>
                </CardTitle>
                <CardDescription className="line-clamp-3">
                  {project.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {/* Participation Stats */}
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-blue-500" />
                    <span>{project.participationCounts?.watch || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Hand className="w-4 h-4 text-orange-500" />
                    <span>{project.participationCounts?.raiseHand || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Rocket className="w-4 h-4 text-green-500" />
                    <span>{project.participationCounts?.commit || 0}</span>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t space-y-2">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" className="w-full" data-testid={`button-view-project-${project.id}`}>
  プロジェクトを表示
                    </Button>
                  </Link>
                  
                  <Dialog 
                    open={selectedProjectForSearch === project.id}
                    onOpenChange={(open) => setSelectedProjectForSearch(open ? project.id : null)}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        variant="secondary" 
                        className="w-full" 
                        data-testid={`button-find-collaborators-${project.id}`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        協力者を探す
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>協力者検索 - {project.title}</DialogTitle>
                        <DialogDescription>
                          プロジェクトに最適な協力者を見つけましょう
                        </DialogDescription>
                      </DialogHeader>
                      <CollaboratorSearch 
                        projectId={project.id}
                        isOwner={true}
                      />
                    </DialogContent>
                  </Dialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}