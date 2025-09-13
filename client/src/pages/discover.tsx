import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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

// Extended project type with safe creator info (no private data)
type ProjectWithCreator = Project & {
  creator: PublicUser;
  participations?: Array<{ type: string; userId: string }>;
};

export default function DiscoverPage() {
  const { toast } = useToast();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // Motion values for swipe animation
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const { data: projects = [], isLoading } = useQuery<ProjectWithCreator[]>({
    queryKey: ["/api/projects/discover"],
  });

  // Get current project
  const currentProject = projects[currentIndex];

  const handleSwipe = (direction: 'left' | 'right') => {
    setSwipeDirection(direction);
    
    // Move to next project after animation
    setTimeout(() => {
      setCurrentIndex(prev => {
        const nextIndex = prev + 1;
        if (nextIndex >= projects.length) {
          // Show completion message and reset
          toast({
            title: "You've seen all projects!",
            description: "Check back later for new visions to discover.",
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
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Finding amazing projects...</p>
        </div>
      </div>
    );
  }

  if (!projects.length) {
    return (
      <div className="max-w-md mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">No projects to discover</h3>
            <p className="text-muted-foreground mb-4">
              Be the first to share your vision with the community!
            </p>
            <Link href="/projects/new">
              <Button>Create First Project</Button>
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
    <div className="max-w-md mx-auto px-4 py-8 min-h-screen flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link href="/">
          <Button variant="ghost" size="icon" data-testid="button-back">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex-1 text-center">
          <h1 className="text-2xl font-bold">Discover</h1>
          <p className="text-sm text-muted-foreground">
            {currentIndex + 1} of {projects.length}
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
          <Card className="w-full min-h-[400px] shadow-lg">
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
                    {formatDistanceToNow(new Date(currentProject.createdAt!), { addSuffix: true })}
                  </div>
                </div>
              </div>
              <CardTitle className="text-xl">{currentProject.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription className="text-base leading-relaxed">
                {currentProject.description}
              </CardDescription>
              
              {/* Participation Stats */}
              <div className="flex gap-4 pt-4 border-t">
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
      <div className="flex justify-center gap-4 mt-6">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full w-14 h-14"
          onClick={() => handleSwipe('left')}
          data-testid="button-pass"
        >
          <X className="w-6 h-6 text-red-500" />
        </Button>
        
        <Link href={`/projects/${currentProject.id}`}>
          <Button
            size="icon"
            className="rounded-full w-14 h-14 bg-primary hover:bg-primary/90"
            data-testid="button-view-project"
          >
            <Heart className="w-6 h-6" />
          </Button>
        </Link>
      </div>

      {/* Swipe Instructions */}
      <div className="text-center mt-6 text-sm text-muted-foreground">
        <p>Swipe left to pass • Tap ❤️ to view • Swipe right to continue</p>
      </div>
    </div>
  );
}