import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { insertProgressUpdateSchema, insertCommentSchema } from "@shared/schema";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  ArrowLeft, 
  Eye, 
  Hand, 
  Rocket, 
  MessageCircle, 
  Share,
  Calendar,
  User,
  Users,
  Heart,
  Plus
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { ProjectWithDetails, User as UserType } from "@shared/schema";

// Form schema for progress updates
const progressUpdateFormSchema = insertProgressUpdateSchema.omit({ projectId: true, userId: true });
type ProgressUpdateFormData = z.infer<typeof progressUpdateFormSchema>;

// Form schema for comments
const commentFormSchema = insertCommentSchema.omit({ projectId: true, userId: true });
type CommentFormData = z.infer<typeof commentFormSchema>;

// Progress Update Card Component with Reactions
function ProgressUpdateCard({ 
  update, 
  onToggleReaction, 
  user, 
  toggleReactionMutation 
}: { 
  update: any, 
  onToggleReaction: (targetId: string, targetType: string) => void,
  user: any,
  toggleReactionMutation: any
}) {
  const { data: updateReactions = [] } = useQuery({
    queryKey: ["/api/reactions", update.id, "progress_update"],
    queryFn: async () => {
      const res = await fetch(`/api/reactions?targetId=${update.id}&targetType=progress_update`);
      if (!res.ok) throw new Error('Failed to fetch reactions');
      return await res.json();
    },
  });

  const userHasReacted = updateReactions.some((r: any) => r.userId === (user as UserType)?.id);

  return (
    <div className="border-l-2 border-primary pl-4 pb-4">
      <div className="flex items-center gap-2 mb-2">
        <Avatar className="h-6 w-6">
          <AvatarImage src={update.user.profileImageUrl || undefined} />
          <AvatarFallback>
            {update.user.firstName?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{update.title}</span>
        <span className="text-sm text-muted-foreground">
          {formatDistanceToNow(new Date(update.createdAt), { addSuffix: true })}
        </span>
      </div>
      <p className="text-muted-foreground mb-3">{update.content}</p>
      {user && (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={userHasReacted ? "default" : "outline"}
            onClick={() => onToggleReaction(update.id, "progress_update")}
            disabled={toggleReactionMutation.isPending}
            data-testid={`button-reaction-update-${update.id}`}
            className="h-7 px-2 text-xs"
          >
            👏 {updateReactions.length}
          </Button>
        </div>
      )}
    </div>
  );
}

export default function ProjectDetailPage() {
  const [match, params] = useRoute("/projects/:id");
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const projectId = params?.id;
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isCommentFormVisible, setIsCommentFormVisible] = useState(false);

  const { data: project, isLoading } = useQuery<ProjectWithDetails>({
    queryKey: ["/api/projects", projectId],
    enabled: !!projectId,
  });

  // Query for reactions
  const { data: projectReactions = [] } = useQuery({
    queryKey: ["/api/reactions", projectId, "project"],
    queryFn: async () => {
      const res = await fetch(`/api/reactions?targetId=${projectId}&targetType=project`);
      if (!res.ok) throw new Error('Failed to fetch reactions');
      return await res.json();
    },
    enabled: !!projectId,
  });

  const participateMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/participate`, { type });
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update participation. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeParticipationMutation = useMutation({
    mutationFn: async ({ type }: { type: string }) => {
      const res = await apiRequest("DELETE", `/api/projects/${projectId}/participate`, { type });
      // 204 No Content response has no body to parse
      if (res.status === 204) {
        return { success: true };
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const createProgressUpdateMutation = useMutation({
    mutationFn: async (data: ProgressUpdateFormData) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/progress`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      setIsUpdateModalOpen(false);
      progressUpdateForm.reset(); // Clear form state after successful submission
      toast({
        title: "Progress update created!",
        description: "Your progress update has been shared with the community.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create progress update. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CommentFormData) => {
      const res = await apiRequest("POST", `/api/projects/${projectId}/comments`, data);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      commentForm.reset();
      setIsCommentFormVisible(false);
      toast({
        title: "Comment added!",
        description: "Your comment has been posted.",
      });
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to post comment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleReactionMutation = useMutation({
    mutationFn: async ({ targetId, targetType }: { targetId: string; targetType: string }) => {
      const res = await apiRequest("POST", `/api/reactions`, { targetId, targetType });
      return await res.json();
    },
    onSuccess: (_, { targetId, targetType }) => {
      // Invalidate specific reaction queries based on target type
      queryClient.invalidateQueries({ queryKey: ["/api/reactions", targetId, targetType] });
      // Also invalidate project reactions if this was a project reaction
      if (targetType === "project") {
        queryClient.invalidateQueries({ queryKey: ["/api/reactions", projectId, "project"] });
      }
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to toggle reaction. Please try again.",
        variant: "destructive",
      });
    },
  });

  const progressUpdateForm = useForm<ProgressUpdateFormData>({
    resolver: zodResolver(progressUpdateFormSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const commentForm = useForm<CommentFormData>({
    resolver: zodResolver(commentFormSchema),
    defaultValues: {
      content: "",
    },
  });

  const handleCreateProgressUpdate = (data: ProgressUpdateFormData) => {
    createProgressUpdateMutation.mutate(data);
  };

  const handleCreateComment = (data: CommentFormData) => {
    createCommentMutation.mutate(data);
  };

  const handleToggleReaction = (targetId: string, targetType: string) => {
    toggleReactionMutation.mutate({ targetId, targetType });
  };

  const handleParticipate = (type: string) => {
    const existingParticipation = project?.participations?.find(
      p => p.userId === (user as UserType)?.id && p.type === type
    );

    if (existingParticipation) {
      removeParticipationMutation.mutate({ type });
    } else {
      participateMutation.mutate({ type });
    }
  };

  const shareProject = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: project?.title,
        text: project?.description,
        url: url,
      });
    } else {
      navigator.clipboard.writeText(url);
      toast({
        title: "Link copied!",
        description: "Project link copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-semibold mb-2">Project not found</h3>
            <p className="text-muted-foreground mb-4">
              This project doesn't exist or may have been removed.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCreator = (user as UserType)?.id === project.creatorId;
  const watchCount = project.participations?.filter(p => p.type === 'watch').length || 0;
  const raiseHandCount = project.participations?.filter(p => p.type === 'raise_hand').length || 0;
  const commitCount = project.participations?.filter(p => p.type === 'commit').length || 0;

  const userWatching = project.participations?.some(p => p.userId === (user as UserType)?.id && p.type === 'watch');
  const userRaisedHand = project.participations?.some(p => p.userId === (user as UserType)?.id && p.type === 'raise_hand');
  const userCommitted = project.participations?.some(p => p.userId === (user as UserType)?.id && p.type === 'commit');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => window.history.back()}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarImage src={project.creator.profileImageUrl || undefined} />
                <AvatarFallback>
                  {project.creator.firstName?.[0] || project.creator.email?.[0] || 'U'}
                </AvatarFallback>
              </Avatar>
              <span>by {project.creator.firstName || project.creator.email}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(project.createdAt!), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Reactions Button */}
          {user && (
            <Button
              variant={projectReactions.some((r: any) => r.userId === (user as UserType)?.id) ? "default" : "outline"}
              onClick={() => handleToggleReaction(projectId!, "project")}
              disabled={toggleReactionMutation.isPending}
              data-testid="button-toggle-reaction"
            >
              <Hand className="w-4 h-4 mr-2" />
              👏 {projectReactions.length}
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={shareProject}
            data-testid="button-share"
          >
            <Share className="w-4 h-4 mr-2" />
            Share
          </Button>
          {isCreator && (
            <Button data-testid="button-edit">
              Edit Project
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Project</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </CardContent>
          </Card>

          {/* Progress Updates */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Progress Updates</CardTitle>
                {isCreator && (
                  <Dialog open={isUpdateModalOpen} onOpenChange={setIsUpdateModalOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" data-testid="button-add-update">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Update
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Progress Update</DialogTitle>
                        <DialogDescription>
                          Share your latest progress with the community. This will help keep everyone engaged and motivated!
                        </DialogDescription>
                      </DialogHeader>
                      <Form {...progressUpdateForm}>
                        <form onSubmit={progressUpdateForm.handleSubmit(handleCreateProgressUpdate)} className="space-y-4">
                          <FormField
                            control={progressUpdateForm.control}
                            name="title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Update Title</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="e.g., Completed user interface design"
                                    data-testid="input-update-title"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={progressUpdateForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                  <Textarea
                                    placeholder="Describe what you've accomplished, any challenges you faced, and next steps..."
                                    rows={4}
                                    data-testid="input-update-content"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              onClick={() => setIsUpdateModalOpen(false)}
                              data-testid="button-cancel-update"
                            >
                              Cancel
                            </Button>
                            <Button 
                              type="submit" 
                              disabled={createProgressUpdateMutation.isPending}
                              data-testid="button-submit-update"
                            >
                              {createProgressUpdateMutation.isPending ? "Creating..." : "Create Update"}
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {project.progressUpdates?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No progress updates yet. {isCreator ? "Share your first milestone!" : "Stay tuned for updates!"}
                </p>
              ) : (
                <div className="space-y-4">
                  {project.progressUpdates?.map((update) => (
                    <ProgressUpdateCard 
                      key={update.id} 
                      update={update} 
                      onToggleReaction={handleToggleReaction}
                      user={user}
                      toggleReactionMutation={toggleReactionMutation}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Comments</CardTitle>
                {user && (
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setIsCommentFormVisible(!isCommentFormVisible)}
                    data-testid="button-toggle-comment-form"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    {isCommentFormVisible ? 'Cancel' : 'Add Comment'}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {/* Comment Form */}
              {user && isCommentFormVisible && (
                <div className="mb-6 p-4 border rounded-lg bg-muted/30">
                  <Form {...commentForm}>
                    <form onSubmit={commentForm.handleSubmit(handleCreateComment)} className="space-y-4">
                      <FormField
                        control={commentForm.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Your Comment</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your thoughts about this project..."
                                rows={3}
                                data-testid="input-comment-content"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end gap-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setIsCommentFormVisible(false)}
                          data-testid="button-cancel-comment"
                        >
                          Cancel
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={createCommentMutation.isPending}
                          data-testid="button-submit-comment"
                        >
                          {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </div>
              )}

              {/* Comments List */}
              {project.comments?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No comments yet. Be the first to share your thoughts!
                </p>
              ) : (
                <div className="space-y-4">
                  {project.comments?.map((comment) => (
                    <div key={comment.id} className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {comment.user.firstName?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.user.firstName || 'Anonymous User'}</span>
                          <span className="text-sm text-muted-foreground">
                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-muted-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Participation */}
          <Card>
            <CardHeader>
              <CardTitle>Show Your Interest</CardTitle>
              <CardDescription>
                Let the creator know you're interested in this vision
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                variant={userWatching ? "default" : "outline"}
                onClick={() => handleParticipate('watch')}
                disabled={participateMutation.isPending || removeParticipationMutation.isPending}
                data-testid="button-watch"
                className="w-full justify-start"
              >
                <Eye className="w-4 h-4 mr-2" />
                👀 Watch ({watchCount})
              </Button>
              
              <Button
                variant={userRaisedHand ? "default" : "outline"}
                onClick={() => handleParticipate('raise_hand')}
                disabled={participateMutation.isPending || removeParticipationMutation.isPending}
                data-testid="button-raise-hand"
                className="w-full justify-start"
              >
                <Hand className="w-4 h-4 mr-2" />
                ✋ Raise Hand ({raiseHandCount})
              </Button>
              
              <Button
                variant={userCommitted ? "default" : "outline"}
                onClick={() => handleParticipate('commit')}
                disabled={participateMutation.isPending || removeParticipationMutation.isPending}
                data-testid="button-commit"
                className="w-full justify-start"
              >
                <Rocket className="w-4 h-4 mr-2" />
                🚀 Commit ({commitCount})
              </Button>
            </CardContent>
          </Card>

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Project Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  Total Interest
                </span>
                <span className="font-medium">{watchCount + raiseHandCount + commitCount}</span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-muted-foreground" />
                  Comments
                </span>
                <span className="font-medium">{project.comments?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  Updates
                </span>
                <span className="font-medium">{project.progressUpdates?.length || 0}</span>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          {(project.participations && project.participations.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Interested People</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {project.participations.map((participation) => (
                    <div key={participation.id} className="flex items-center gap-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={participation.user.profileImageUrl || undefined} />
                        <AvatarFallback>
                          {participation.user.firstName?.[0] || participation.user.email?.[0] || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {participation.user.firstName || participation.user.email}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {participation.type === 'watch' && '👀'}
                        {participation.type === 'raise_hand' && '✋'}
                        {participation.type === 'commit' && '🚀'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}