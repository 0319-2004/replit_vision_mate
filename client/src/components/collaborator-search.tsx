import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  Plus, 
  X, 
  Search,
  MessageSquare,
  Star,
  Filter,
  Heart,
  School,
  BookOpen
} from "lucide-react";
import { projectRequiredSkillsApi, messagesApi } from "@/lib/supabaseApi";
import { userInterestApi } from "@/lib/userInterestApi";

interface CollaboratorSearchProps {
  projectId: string;
  isOwner: boolean;
}

interface Candidate {
  user_id: string;
  overlap_count: number;
  total_skills: number;
  overlap_percentage: number;
  user: {
    id: string;
    first_name?: string;
    last_name?: string;
    display_name?: string;
    avatar_url?: string;
    profile_image_url?: string;
  };
}

export function CollaboratorSearch({ projectId, isOwner }: CollaboratorSearchProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");
  const [searchParams, setSearchParams] = useState({
    matchAll: false,
    minOverlap: 1,
    limit: 20,
    offset: 0,
    university: "",
    skillFilter: ""
  });
  const [showSearch, setShowSearch] = useState(false);

  // プロジェクトの必要スキル取得
  const { data: requiredSkills = [], isLoading: skillsLoading } = useQuery({
    queryKey: ["project-required-skills", projectId],
    queryFn: () => projectRequiredSkillsApi.getProjectSkills(projectId),
  });

  // 協力者候補検索
  const { data: candidates = [], isLoading: candidatesLoading, refetch: refetchCandidates } = useQuery({
    queryKey: ["collaborator-candidates", projectId, searchParams],
    queryFn: () => projectRequiredSkillsApi.searchCandidates(
      projectId,
      searchParams.matchAll,
      searchParams.minOverlap,
      searchParams.limit,
      searchParams.offset
    ),
    enabled: showSearch && requiredSkills.length > 0,
  });

  // スキル追加ミューテーション
  const addSkillMutation = useMutation({
    mutationFn: (skill: string) => projectRequiredSkillsApi.upsertSkill(projectId, skill, 1),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-required-skills", projectId] });
      setNewSkill("");
      toast({
        title: "スキルを追加しました",
        description: "協力者検索でこのスキルが使用されます。",
      });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "スキルの追加に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // スキル削除ミューテーション
  const removeSkillMutation = useMutation({
    mutationFn: (skill: string) => projectRequiredSkillsApi.removeSkill(projectId, skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["project-required-skills", projectId] });
      toast({
        title: "スキルを削除しました",
      });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "スキルの削除に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // メッセージ送信ミューテーション
  const sendMessageMutation = useMutation({
    mutationFn: ({ recipientId, content }: { recipientId: string; content: string }) =>
      messagesApi.sendMessage(recipientId, content),
    onSuccess: () => {
      toast({
        title: "招待メッセージを送信しました",
        description: "相手に通知が届きます。",
      });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "メッセージの送信に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // 気になるミューテーション
  const interestMutation = useMutation({
    mutationFn: (targetUserId: string) => userInterestApi.sendInterest(targetUserId),
    onSuccess: () => {
      toast({
        title: "気になるを送信しました",
        description: "相手に通知が届きます。",
      });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "気になるの送信に失敗しました。",
        variant: "destructive",
      });
    },
  });

  const handleAddSkill = () => {
    if (newSkill.trim() && !requiredSkills.some(s => s.skill === newSkill.trim())) {
      addSkillMutation.mutate(newSkill.trim());
    }
  };

  const handleRemoveSkill = (skill: string) => {
    removeSkillMutation.mutate(skill);
  };

  const handleInvite = (candidate: Candidate) => {
    const message = `こんにちは！プロジェクト「${projectId}」であなたのスキルを必要としています。ぜひ一緒に取り組みませんか？詳細はプロジェクトページをご覧ください。`;
    sendMessageMutation.mutate({
      recipientId: candidate.user_id,
      content: message
    });
  };

  const handleSendInterest = (candidate: Candidate) => {
    interestMutation.mutate(candidate.user_id);
  };

  const handleSearch = () => {
    if (requiredSkills.length === 0) {
      toast({
        title: "必要スキルを追加してください",
        description: "協力者検索には少なくとも1つのスキルが必要です。",
        variant: "destructive",
      });
      return;
    }
    setShowSearch(true);
    refetchCandidates();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          協力者検索
        </CardTitle>
        <CardDescription>
          プロジェクトに必要なスキルを設定して、適切な協力者を見つけましょう
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 必要スキル管理 */}
        <div>
          <Label className="text-sm font-medium">必要スキル</Label>
          <div className="flex flex-wrap gap-2 mt-2 mb-3">
            {skillsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="w-20 h-6 rounded-full" />
              ))
            ) : (
              requiredSkills.map((skill) => (
                <Badge
                  key={skill.skill}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {skill.skill}
                  {isOwner && (
                    <X
                      className="w-3 h-3 cursor-pointer hover:text-destructive"
                      onClick={() => handleRemoveSkill(skill.skill)}
                    />
                  )}
                </Badge>
              ))
            )}
          </div>
          
          {isOwner && (
            <div className="flex gap-2">
              <Input
                placeholder="スキルを追加 (例: React, Python, UI/UX)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1"
              />
              <Button
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || addSkillMutation.isPending}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>

        {requiredSkills.length > 0 && (
          <>
            <Separator />
            
            {/* 検索設定 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">検索設定</Label>
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <Switch
                    checked={searchParams.matchAll}
                    onCheckedChange={(checked) =>
                      setSearchParams(prev => ({ ...prev, matchAll: checked }))
                    }
                  />
                  <Label className="text-sm">すべてのスキル必須</Label>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">最小一致数</Label>
                  <Input
                    type="number"
                    min="1"
                    max={requiredSkills.length}
                    value={searchParams.minOverlap}
                    onChange={(e) =>
                      setSearchParams(prev => ({
                        ...prev,
                        minOverlap: parseInt(e.target.value) || 1
                      }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs">結果件数</Label>
                  <Input
                    type="number"
                    min="5"
                    max="50"
                    value={searchParams.limit}
                    onChange={(e) =>
                      setSearchParams(prev => ({
                        ...prev,
                        limit: parseInt(e.target.value) || 20
                      }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              {/* 追加フィルター */}
              <div className="space-y-3">
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <School className="w-3 h-3" />
                    大学フィルター
                  </Label>
                  <Input
                    placeholder="例: 青山学院大学"
                    value={searchParams.university}
                    onChange={(e) =>
                      setSearchParams(prev => ({ ...prev, university: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs flex items-center gap-1">
                    <BookOpen className="w-3 h-3" />
                    スキルキーワード
                  </Label>
                  <Input
                    placeholder="追加検索キーワード"
                    value={searchParams.skillFilter}
                    onChange={(e) =>
                      setSearchParams(prev => ({ ...prev, skillFilter: e.target.value }))
                    }
                    className="mt-1"
                  />
                </div>
              </div>

              <Button onClick={handleSearch} className="w-full" disabled={candidatesLoading}>
                <Search className="w-4 h-4 mr-2" />
                {candidatesLoading ? "検索中..." : "協力者を検索"}
              </Button>
            </div>

            {/* 検索結果 */}
            {showSearch && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-medium">
                    検索結果 ({candidates.length} 名)
                  </Label>
                  <div className="space-y-3 mt-3">
                    {candidatesLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <Card key={i} className="p-4">
                          <div className="flex items-center gap-3">
                            <Skeleton className="w-10 h-10 rounded-full" />
                            <div className="flex-1">
                              <Skeleton className="w-24 h-4 mb-1" />
                              <Skeleton className="w-32 h-3" />
                            </div>
                            <Skeleton className="w-16 h-8" />
                          </div>
                        </Card>
                      ))
                    ) : candidates.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>条件に一致する協力者が見つかりませんでした</p>
                        <p className="text-sm">検索条件を調整してみてください</p>
                      </div>
                    ) : (
                      candidates.map((candidate: Candidate) => (
                        <Card key={candidate.user_id} className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={candidate.user.profile_image_url || candidate.user.avatar_url} />
                              <AvatarFallback>
                                {candidate.user.first_name?.[0] || 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">
                                {candidate.user.display_name || candidate.user.first_name || 'Anonymous'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {candidate.overlap_count} / {requiredSkills.length} スキル一致
                                ({candidate.overlap_percentage}%)
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                <Star className="w-3 h-3 mr-1" />
                                {candidate.overlap_percentage}%
                              </Badge>
                              <div className="flex gap-1">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleSendInterest(candidate)}
                                  disabled={interestMutation.isPending}
                                >
                                  <Heart className="w-4 h-4 mr-1" />
                                  気になる
                                </Button>
                                {isOwner && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleInvite(candidate)}
                                    disabled={sendMessageMutation.isPending}
                                  >
                                    <MessageSquare className="w-4 h-4 mr-1" />
                                    招待
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
