import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { HandHeart } from "lucide-react";

interface ClapButtonProps {
  targetId: string;
  targetType: "project" | "progress_update" | "comment" | "message";
  initialCount?: number;
  initialUserReacted?: boolean;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "ghost" | "outline";
  showCount?: boolean;
  className?: string;
}

export function ClapButton({
  targetId,
  targetType,
  initialCount = 0,
  initialUserReacted = false,
  size = "sm",
  variant = "ghost",
  showCount = true,
  className,
}: ClapButtonProps) {
  const { toast } = useToast();
  const [isAnimating, setIsAnimating] = useState(false);

  // Get real-time clap status
  const { data: reactionStatus } = useQuery<{ count: number; userReacted: boolean }>({
    queryKey: ['/api/reactions', targetType, targetId],
    queryFn: async () => {
      const response = await fetch(`/api/reactions/${targetType}/${targetId}`, {
        credentials: 'include',
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reaction status');
      }
      return response.json();
    },
    initialData: { count: initialCount, userReacted: initialUserReacted },
  });

  type ReactionStatus = { count: number; userReacted: boolean };
  const clapMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/reactions', {
        targetId,
        targetType,
      });
    },
    onMutate: async () => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['/api/reactions', targetType, targetId] });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData<ReactionStatus>(['/api/reactions', targetType, targetId]);
      
      // Optimistically update
      const currentReacted = previousData?.userReacted ?? initialUserReacted;
      const currentCount = previousData?.count ?? initialCount;
      
      queryClient.setQueryData(['/api/reactions', targetType, targetId], {
        count: currentReacted ? currentCount - 1 : currentCount + 1,
        userReacted: !currentReacted,
      });
      
      return { previousData } as { previousData?: ReactionStatus };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        queryClient.setQueryData<ReactionStatus>(['/api/reactions', targetType, targetId], context.previousData);
      }
      
      toast({
        title: "エラー / Error",
        description: "Failed to clap",
        variant: "destructive",
      });
    },
    onSuccess: async (res: Response) => {
      let payload: any | null = null;
      try {
        payload = await res.json();
        queryClient.setQueryData<ReactionStatus>(
          ['/api/reactions', targetType, targetId],
          { count: payload.count ?? 0, userReacted: payload.userReacted ?? false }
        );
      } catch {
        // ignore JSON parse error and keep optimistic value
      }

      // Trigger animation
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 600);

      // Show feedback based on action
      if (payload && payload.action === 'added') {
        toast({
          title: "拍手しました！ / Clapped!",
          description: "応援の気持ちを送りました / Your support has been sent",
          duration: 2000,
        });
      }
    },
  });

  const handleClap = () => {
    clapMutation.mutate();
  };

  const isReacted = reactionStatus?.userReacted || false;
  const count = reactionStatus?.count || 0;

  return (
    <Button
      variant={isReacted ? "default" : variant}
      size={size}
      onClick={handleClap}
      disabled={clapMutation.isPending}
      className={cn(
        "relative overflow-hidden transition-all duration-200",
        isReacted && "bg-primary hover:bg-primary/90 text-primary-foreground",
        isAnimating && "animate-pulse",
        className
      )}
      data-testid={`clap-button-${targetId}`}
    >
      {/* Clap Icon */}
      <HandHeart 
        className={cn(
          "w-4 h-4 transition-all duration-300",
          isAnimating && "animate-bounce scale-125"
        )}
      />

      {/* Count */}
      {showCount && count > 0 && (
        <span 
          className={cn(
            "ml-2 text-sm font-medium transition-all duration-200",
            isAnimating && "scale-110 font-bold"
          )}
          data-testid={`clap-count-${targetId}`}
        >
          {count}
        </span>
      )}

      {/* Animation overlay */}
      {isAnimating && (
        <span className="absolute inset-0 bg-primary/20 animate-ping rounded" />
      )}
    </Button>
  );
}

// Compact clap button for smaller spaces
export function CompactClapButton({
  targetId,
  targetType,
  initialCount = 0,
  initialUserReacted = false,
}: Pick<ClapButtonProps, "targetId" | "targetType" | "initialCount" | "initialUserReacted">) {
  return (
    <ClapButton
      targetId={targetId}
      targetType={targetType}
      initialCount={initialCount}
      initialUserReacted={initialUserReacted}
      size="sm"
      variant="ghost"
      showCount={true}
      className="h-8 px-2 text-xs"
    />
  );
}

// Large clap button for main content
export function HeroClapButton({
  targetId,
  targetType,
  initialCount = 0,
  initialUserReacted = false,
}: Pick<ClapButtonProps, "targetId" | "targetType" | "initialCount" | "initialUserReacted">) {
  return (
    <ClapButton
      targetId={targetId}
      targetType={targetType}
      initialCount={initialCount}
      initialUserReacted={initialUserReacted}
      size="lg"
      variant="outline"
      showCount={true}
      className="h-12 px-6 text-base font-medium"
    />
  );
}