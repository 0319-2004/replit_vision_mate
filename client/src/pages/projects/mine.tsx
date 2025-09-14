import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Eye, Hand, Rocket, Plus, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
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
  
  const { data: projects = [], isLoading } = useQuery<ProjectWithStats[]>({
    queryKey: ["/api/projects"],
    select: (data: any[]) => {
      // Filter to only show user's own projects
      return data.filter(project => project.creatorId === (user as any)?.id);
    }
  });

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">マイプロジェクト</h1>
          <p className="text-muted-foreground mt-2">
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
        <Card className="text-center py-12">
          <CardContent>
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                
                <div className="mt-4 pt-4 border-t">
                  <Link href={`/projects/${project.id}`}>
                    <Button variant="outline" className="w-full" data-testid={`button-view-project-${project.id}`}>
  プロジェクトを表示
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}