import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface StartConversationButtonProps {
  recipientId: string;
  recipientName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function StartConversationButton({
  recipientId,
  recipientName,
  variant = "outline",
  size = "sm",
  className,
}: StartConversationButtonProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const startConversationMutation = useMutation({
    mutationFn: async ({ content, recipientId }: { content: string; recipientId: string }) => {
      return apiRequest('POST', '/api/messages', { content, recipientId });
    },
    onSuccess: () => {
      toast({
        title: "会話を開始しました",
        description: `Started conversation with ${recipientName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      // Navigate to messages page
      setLocation('/messages');
    },
    onError: (error: any) => {
      toast({
        title: "エラー / Error",
        description: error.message || "Failed to start conversation",
        variant: "destructive",
      });
    },
  });

  const handleStartConversation = () => {
    // Send an initial greeting message to create the conversation
    startConversationMutation.mutate({
      content: `こんにちは！プロジェクトについてお話ししませんか？ / Hello! Would you like to discuss the project?`,
      recipientId,
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleStartConversation}
      disabled={startConversationMutation.isPending}
      className={className}
      data-testid="button-start-conversation"
    >
      <MessageCircle className="w-4 h-4 mr-2" />
      {startConversationMutation.isPending ? 'Starting...' : 'メッセージ / Message'}
    </Button>
  );
}