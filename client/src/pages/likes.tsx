import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowLeft, 
  Heart,
  Calendar,
  Eye,
  Hand,
  Rocket
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { projectLikesApi } from "@/lib/supabaseApi";

export default function LikesPage() {
  const [lastCreatedAt, setLastCreatedAt] = useState<string>();

  const { data: likes = [], isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useQuery({
    queryKey: ["project-likes", "user"],
    queryFn: () => projectLikesApi.getUserLikes(12, lastCreatedAt),
  });

  const loadMore = () => {
    if (likes.length > 0) {
      setLastCreatedAt(likes[likes.length - 1].created_at);
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="w-10 h-10 rounded" />
          <div>
            <Skeleton className="w-48 h-8 mb-2" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <CardHeader className="space-y-3">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="w-24 h-4 mb-1" />
                    <Skeleton className="w-16 h-3" />
                  </div>
                </div>
                <Skeleton className="w-full h-6" />
              </CardHeader>
              <CardContent>
                <Skeleton className="w-full h-16 mb-4" />
                <div className="flex gap-4">
                  <Skeleton className="w-12 h-4" />
                  <Skeleton className="w-12 h-4" />
                  <Skeleton className="w-12 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-0 py-4 md:py-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6 px-4">
        <Link href="/discover">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl md:text-2xl font-semibold flex items-center gap-2">
            <Heart className="w-6 h-6 text-red-500" />
            いいねしたプロジェクト
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {likes.length} 件のプロジェクト
          </p>
        </div>
      </div>

      {likes.length === 0 ? (
        <Card>
          <CardContent className="py-10 md:py-12 text-center">
            <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">いいねしたプロジェクトがありません</h3>
            <p className="text-muted-foreground mb-4">
              気になるプロジェクトを見つけて、いいねしてみましょう！
            </p>
            <Link href="/discover">
              <Button>プロジェクトを探す</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Projects Grid */}
          <div className="grid gap-4 md:gap-6 md:grid-cols-2">
            {likes.map((like: any) => {
              const project = like.project;
              return (
                <Card key={project.id} className="overflow-hidden hover-elevate">
                  <CardHeader>
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={project.creator?.profile_image_url} />
                        <AvatarFallback>
                          {project.creator?.first_name?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {project.creator?.first_name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    <CardTitle className="text-base md:text-lg leading-tight">
                      {project.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-sm leading-relaxed line-clamp-3">
                      {project.description}
                    </CardDescription>
                    
                    {/* Stats */}
                    <div className="flex gap-4 pt-2 border-t text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Hand className="w-4 h-4 text-orange-500" />
                        <span>0</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Rocket className="w-4 h-4 text-green-500" />
                        <span>0</span>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="pt-2">
                      <Link href={`/projects/${project.id}`}>
                        <Button className="w-full" size="sm">
                          プロジェクトを見る
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="text-center mt-8">
              <Button 
                onClick={loadMore}
                disabled={isFetchingNextPage}
                variant="outline"
              >
                {isFetchingNextPage ? "読み込み中..." : "もっと見る"}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
