import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Send, Search, Heart } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { userInterestApi } from "@/lib/userInterestApi";

type ConversationWithMessages = {
  id: string;
  participant1: any;
  participant2: any;
  lastMessageAt: string;
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: string;
    sender: any;
  }>;
};

type MessageWithSender = {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  sender: any;
};

export default function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');

  const { data: conversations = [], isLoading } = useQuery<ConversationWithMessages[]>({
    queryKey: ['/api/conversations'],
  });

  // 受信した気になるを取得
  const { data: receivedInterests = [], isLoading: interestsLoading } = useQuery({
    queryKey: ['received-interests'],
    queryFn: () => userInterestApi.getReceivedInterests(),
  });

  const { data: currentConversation, isLoading: conversationLoading } = useQuery<ConversationWithMessages>({
    queryKey: ['/api/conversations', selectedConversation],
    enabled: !!selectedConversation,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, recipientId }: { content: string; recipientId: string }) => {
      return apiRequest('POST', '/api/messages', { content, recipientId });
    },
    onSuccess: () => {
      setMessageInput('');
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (selectedConversation) {
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', selectedConversation] });
      }
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentConversation || !user) return;

    // Determine recipient (the other participant)
    const currentUserId = (user as any).id;
    const recipientId = currentConversation.participant1.id === currentUserId 
      ? currentConversation.participant2.id 
      : currentConversation.participant1.id;

    sendMessageMutation.mutate({
      content: messageInput,
      recipientId: recipientId,
    });
  };

  const getConversationPartner = (conversation: ConversationWithMessages) => {
    if (!user) return conversation.participant1;
    const currentUserId = (user as any).id;
    return conversation.participant1.id === currentUserId 
      ? conversation.participant2 
      : conversation.participant1;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">メッセージ / Messages</h1>
        <p className="text-muted-foreground">プロジェクトメンバーと直接やり取りができます / Chat directly with project members</p>
      </div>

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4" />
            メッセージ
          </TabsTrigger>
          <TabsTrigger value="interests" className="flex items-center gap-2">
            <Heart className="w-4 h-4" />
            気になる ({receivedInterests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="messages">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              会話 / Conversations
            </CardTitle>
            {/* Future: Add search functionality */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input 
                placeholder="Search conversations..." 
                className="pl-10"
                data-testid="input-search-conversations"
                disabled
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[450px]">
              {conversations.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="mb-2">メッセージがありません</p>
                  <p className="text-sm">No conversations yet</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {conversations.map((conversation) => {
                    const partner = getConversationPartner(conversation);
                    const lastMessage = conversation.messages?.[0];
                    const isSelected = selectedConversation === conversation.id;

                    return (
                      <div
                        key={conversation.id}
                        className={`p-4 cursor-pointer hover-elevate transition-colors border-b ${
                          isSelected ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedConversation(conversation.id)}
                        data-testid={`conversation-${conversation.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={partner?.avatarUrl || partner?.profileImageUrl} />
                            <AvatarFallback>
                              {(partner?.displayName || partner?.firstName || 'U').charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium truncate">
                                {partner?.displayName || `${partner?.firstName || ''} ${partner?.lastName || ''}`.trim() || 'Unknown User'}
                              </h4>
                              {lastMessage && (
                                <span className="text-xs text-muted-foreground">
                                  {formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            {lastMessage && (
                              <p className="text-sm text-muted-foreground truncate">
                                {lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedConversation ? (
            <>
              <CardHeader className="border-b">
                {currentConversation && (
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={getConversationPartner(currentConversation)?.avatarUrl} />
                      <AvatarFallback>
                        {(getConversationPartner(currentConversation)?.displayName || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">
                        {getConversationPartner(currentConversation)?.displayName || 'Unknown User'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {getConversationPartner(currentConversation)?.email}
                      </p>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 flex flex-col h-[500px]">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {conversationLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentConversation?.messages?.slice().reverse().map((message) => {
                        const isOwnMessage = message.senderId === (user as any)?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            data-testid={`message-${message.id}`}
                          >
                            <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                              <div
                                className={`rounded-lg px-4 py-2 ${
                                  isOwnMessage
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted'
                                }`}
                              >
                                <p>{message.content}</p>
                              </div>
                              <p className={`text-xs text-muted-foreground mt-1 ${
                                isOwnMessage ? 'text-right' : 'text-left'
                              }`}>
                                {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="border-t p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message... / メッセージを入力..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                      disabled={sendMessageMutation.isPending}
                      data-testid="input-message"
                    />
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!messageInput.trim() || sendMessageMutation.isPending}
                      size="icon"
                      data-testid="button-send-message"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">会話を選択 / Select a conversation</h3>
                <p>左側から会話を選んでメッセージを開始しましょう</p>
                <p className="text-sm">Choose a conversation from the left to start messaging</p>
              </div>
            </div>
          )}
        </Card>
          </div>
        </TabsContent>

        <TabsContent value="interests">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5" />
                あなたに気になるを送った人
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                {interestsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : receivedInterests.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">まだ気になるが届いていません</p>
                    <p className="text-sm">プロジェクトの協力者検索で見つけてもらいましょう！</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {receivedInterests.map((interest: any) => (
                      <Card key={interest.id} className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={interest.sender.profile_image_url || interest.sender.avatar_url} />
                            <AvatarFallback>
                              {interest.sender.first_name?.[0] || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="font-medium">
                              {interest.sender.display_name || 
                               `${interest.sender.first_name || ''} ${interest.sender.last_name || ''}`.trim() || 
                               'Anonymous User'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatDistanceToNow(new Date(interest.created_at), { addSuffix: true })}に気になるを送信
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                // メッセージタブに切り替え、相手との会話を開く
                                const conversationWithSender = conversations.find(conv => {
                                  const partner = getConversationPartner(conv);
                                  return partner.id === interest.sender.id;
                                });
                                
                                if (conversationWithSender) {
                                  setSelectedConversation(conversationWithSender.id);
                                  // タブを切り替え
                                  const messagesTab = document.querySelector('[value="messages"]') as HTMLElement;
                                  messagesTab?.click();
                                }
                              }}
                            >
                              <MessageCircle className="w-4 h-4 mr-1" />
                              返信
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}