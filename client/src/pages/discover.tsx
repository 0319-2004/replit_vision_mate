import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  Eye, 
  Hand, 
  Rocket, 
  User,
  Calendar,
  Heart,
  X
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import type { Project, PublicUser } from "@shared/schema";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { projectsApi, projectLikesApi, projectHidesApi } from "@/lib/supabaseApi";

// Extended project type with safe creator info (no private data)
type ProjectWithCreator = Project & {
  creator: PublicUser;
  participations?: Array<{ type: string; userId: string }>;
};

export default function DiscoverPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [allProjects, setAllProjects] = useState<ProjectWithCreator[]>([]);
  const [nextCursor, setNextCursor] = useState<{ lastCreatedAt: string, lastId: string } | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  // Motion values for swipe animation
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  // Initial load
  const { data: initialData, isLoading } = useQuery({
    queryKey: ["projects", "discover", "initial"],
    queryFn: () => projectsApi.getForDiscover(12),
  });

  // Load more projects when needed
  const loadMoreProjects = async () => {
    if (!nextCursor || loadingMore) return;
    
    setLoadingMore(true);
    try {
      const moreData = await projectsApi.getForDiscover(12, nextCursor.lastCreatedAt, nextCursor.lastId);
      setAllProjects(prev => [...prev, ...moreData.projects]);
      setNextCursor(moreData.nextCursor);
    } catch (error) {
      console.error('Failed to load more projects:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  // Initialize projects when initial data loads
  useEffect(() => {
    if (initialData) {
      setAllProjects(initialData.projects);
      setNextCursor(initialData.nextCursor);
    }
  }, [initialData]);

  // Load more projects when approaching end
  useEffect(() => {
    if (currentIndex >= allProjects.length - 2 && nextCursor && !loadingMore) {
      loadMoreProjects();
    }
  }, [currentIndex, allProjects.length, nextCursor, loadingMore]);

  // Like mutation
  const likeMutation = useMutation({
    mutationFn: (projectId: string) => projectLikesApi.toggle(projectId),
    onSuccess: (data, projectId) => {
      toast({
        title: data.action === 'added' ? "プロジェクトをいいねしました！" : "いいねを取り消しました",
        description: data.action === 'added' ? "素晴らしいプロジェクトですね！" : "",
      });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました",
        description: "しばらく待ってからもう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  // Hide mutation
  const hideMutation = useMutation({
    mutationFn: (projectId: string) => projectHidesApi.toggle(projectId),
    onSuccess: () => {
      toast({
        title: "プロジェクトを非表示にしました",
        description: "このプロジェクトは今後表示されません。",
      });
    },
    onError: (error) => {
      toast({
        title: "エラーが発生しました", 
        description: "しばらく待ってからもう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  // Get current project
  const currentProject = allProjects[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    if (!currentProject) return;
    
    setSwipeDirection(direction);
    
    // Trigger action based on swipe direction
    if (direction === 'left') {
      // Hide project (optimistic)
      hideMutation.mutate(currentProject.id);
    } else if (direction === 'right') {
      // Like project (optimistic) 
      likeMutation.mutate(currentProject.id);
    }
    
    // Move to next project after animation
    setTimeout(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= allProjects.length && !nextCursor) {
          // Show completion message and reset
          toast({
            title: "すべてのプロジェクトを見ました！",
            description: "新しいビジョンを発見するために、後でまたチェックしてください。",
          });
          return 0;
        }
        return nextIndex;
      });
      setSwipeDirection(null);
      x.set(0); // Reset position
    }, 300);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const swipeThreshold = 100;
    if (info.offset.x > swipeThreshold) {
      handleSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      handleSwipe('left');
    } else {
      // Snap back to center
      x.set(0);
    }
  };

  const getParticipationCounts = (participations: Array<{ type: string }> = []) => {
    return {
      watch: participations.filter(p => p.type === 'watch').length,
      raiseHand: participations.filter(p => p.type === 'raise_hand').length,
      commit: participations.filter(p => p.type === 'commit').length,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">素晴らしいプロジェクトを探しています...</p>
        </div>
      </div>
    );
  }

  if (!allProjects.length && !isLoading) {
    return (
      <div className="max-w-md mx-auto px-0 py-6">
        <Card>
          <CardContent className="py-10 text-center">
            <h3 className="text-lg font-semibold mb-2">発見するプロジェクトがありません</h3>
            <p className="text-muted-foreground mb-4">
あなたのビジョンをコミュニティと共有してみませんか！
            </p>
            <Link href="/projects/new">
              <Button>最初のプロジェクトを作成</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentProject) {
    return null;
  }

  const participationCounts = getParticipationCounts(currentProject.participations);

  return (
    <div className="max-w-md mx-auto px-0 py-4 md:py-6 flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 md:mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="text-xl md:text-2xl font-semibold">発見</h1>
          <p className="text-xs md:text-sm text-muted-foreground">
            {currentIndex + 1} of {allProjects.length}{nextCursor ? '+' : ''}
            {loadingMore && ' (読み込み中...)'}
          </p>
        </div>
      </div>

      {/* Swipeable Project Card */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          style={{ x, rotate, opacity }}
          onDragEnd={handleDragEnd}
          animate={swipeDirection ? { 
            x: swipeDirection === 'left' ? -300 : 300,
            opacity: 0 
          } : { x: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm cursor-grab active:cursor-grabbing"
          data-testid="project-card"
        >
          <Card className="w-full min-h-[380px] shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-3">
                <Avatar>
                  <AvatarImage src={currentProject.creator.profileImageUrl || undefined} />
                  <AvatarFallback>
                    {currentProject.creator.firstName?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium text-sm">
                    {currentProject.creator.firstName || 'Anonymous Creator'}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    {(() => {
                      try {
                        return formatDistanceToNow(new Date(currentProject.createdAt || Date.now()), { addSuffix: true });
                      } catch (e) {
                        return 'just now';
                      }
                    })()}
                  </div>
                </div>
              </div>
              <CardTitle className="text-lg md:text-xl">{currentProject.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed">
                {currentProject.description}
              </CardDescription>
              
              {/* Participation Stats */}
              <div className="flex gap-4 pt-3 border-t text-sm text-muted-foreground">
                <div className="flex items-center gap-1 text-sm">
                  <Eye className="w-4 h-4 text-blue-500" />
                  <span>{participationCounts.watch}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Hand className="w-4 h-4 text-orange-500" />
                  <span>{participationCounts.raiseHand}</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Rocket className="w-4 h-4 text-green-500" />
                  <span>{participationCounts.commit}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4 mt-4 md:mt-6">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={() => handleSwipe('left')}
          disabled={hideMutation.isPending}
          data-testid="button-hide"
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>

        <Link href={`/projects/${currentProject.id}`}>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full w-12 h-12"
            data-testid="button-view-project"
          >
            <Eye className="w-5 h-5" />
          </Button>
        </Link>
        
        <Button
          size="icon"
          className="rounded-full w-14 h-14 bg-red-500 hover:bg-red-600"
          onClick={() => handleSwipe('right')}
          disabled={likeMutation.isPending}
          data-testid="button-like"
        >
          <Heart className="w-6 h-6 text-white" />
        </Button>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-4 md:mt-6 text-xs md:text-sm text-muted-foreground">
        <p>左にスワイプでスキップ • ❤️タップで表示 • 右にスワイプで続ける</p>
      </div>
    </div>
  );
}