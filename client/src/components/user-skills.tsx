import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  Plus, 
  X, 
  Code,
  Edit
} from "lucide-react";
import { userSkillsApi } from "@/lib/supabaseApi";

interface UserSkillsProps {
  userId?: string;
  isEditable?: boolean;
}

interface UserSkill {
  user_id: string;
  skill: string;
  level: number;
  created_at?: string;
}

const skillLevels = [
  { value: 1, label: "初級 - 基本的な理解" },
  { value: 2, label: "中級 - 実用的なスキル" },
  { value: 3, label: "上級 - 高度な技術" },
  { value: 4, label: "エキスパート - 専門知識" },
  { value: 5, label: "マスター - 業界リーダー" },
];

const skillLevelColors = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-blue-100 text-blue-700", 
  3: "bg-green-100 text-green-700",
  4: "bg-orange-100 text-orange-700",
  5: "bg-purple-100 text-purple-700",
};

const skillLevelEmojis = {
  1: "🌱",
  2: "🌿", 
  3: "🌳",
  4: "⭐",
  5: "👑",
};

export function UserSkills({ userId, isEditable = false }: UserSkillsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSkill, setNewSkill] = useState("");
  const [newSkillLevel, setNewSkillLevel] = useState(1);
  const [editingSkill, setEditingSkill] = useState<string | null>(null);

  // ユーザーのスキル取得
  const { data: userSkills = [], isLoading } = useQuery<UserSkill[]>({
    queryKey: ["user-skills", userId],
    queryFn: () => userSkillsApi.getUserSkills(userId),
  });

  // スキル追加/更新ミューテーション
  const upsertSkillMutation = useMutation({
    mutationFn: ({ skill, level }: { skill: string; level: number }) =>
      userSkillsApi.upsertSkill(skill, level),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", userId] });
      setNewSkill("");
      setNewSkillLevel(1);
      setEditingSkill(null);
      toast({
        title: "スキルを更新しました",
        description: "あなたのスキルプロフィールが更新されました。",
      });
    },
    onError: () => {
      toast({
        title: "エラーが発生しました",
        description: "スキルの更新に失敗しました。",
        variant: "destructive",
      });
    },
  });

  // スキル削除ミューテーション
  const removeSkillMutation = useMutation({
    mutationFn: (skill: string) => userSkillsApi.removeSkill(skill),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-skills", userId] });
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

  const handleAddSkill = () => {
    if (newSkill.trim() && !userSkills.some(s => s.skill === newSkill.trim())) {
      upsertSkillMutation.mutate({ skill: newSkill.trim(), level: newSkillLevel });
    }
  };

  const handleUpdateSkill = (skill: string, level: number) => {
    upsertSkillMutation.mutate({ skill, level });
  };

  const handleRemoveSkill = (skill: string) => {
    removeSkillMutation.mutate(skill);
  };

  const getSkillLevelText = (level: number) => {
    const skillLevel = skillLevels.find(sl => sl.value === level);
    return skillLevel ? skillLevel.label : `レベル ${level}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          スキル
        </CardTitle>
        <CardDescription>
          {isEditable 
            ? "あなたのスキルを管理して、適切なプロジェクトとマッチングしましょう"
            : "このユーザーのスキルセット"
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* スキル一覧 */}
        <div>
          <Label className="text-sm font-medium">現在のスキル</Label>
          <div className="flex flex-wrap gap-2 mt-2 mb-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="w-24 h-8 rounded-full" />
              ))
            ) : userSkills.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground w-full">
                <Code className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>まだスキルが登録されていません</p>
                {isEditable && <p className="text-sm">最初のスキルを追加しましょう！</p>}
              </div>
            ) : (
              userSkills.map((userSkill) => (
                <div key={userSkill.skill} className="group relative">
                  <Badge
                    variant="secondary"
                    className={`flex items-center gap-2 pr-1 ${skillLevelColors[userSkill.level as keyof typeof skillLevelColors]}`}
                  >
                    <span>{skillLevelEmojis[userSkill.level as keyof typeof skillLevelEmojis]}</span>
                    <span>{userSkill.skill}</span>
                    <div className="flex items-center gap-1 ml-1">
                      {editingSkill === userSkill.skill ? (
                        <Select
                          value={userSkill.level.toString()}
                          onValueChange={(value) => {
                            handleUpdateSkill(userSkill.skill, parseInt(value));
                          }}
                        >
                          <SelectTrigger className="w-8 h-6 p-0">
                            <Star className="w-3 h-3" />
                          </SelectTrigger>
                          <SelectContent>
                            {skillLevels.map((level) => (
                              <SelectItem key={level.value} value={level.value.toString()}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <>
                          {isEditable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => setEditingSkill(userSkill.skill)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                          )}
                          <span className="text-xs bg-white/50 px-1 rounded">
                            {userSkill.level}
                          </span>
                        </>
                      )}
                      {isEditable && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                          onClick={() => handleRemoveSkill(userSkill.skill)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  </Badge>
                </div>
              ))
            )}
          </div>
        </div>

        {/* スキル追加 */}
        {isEditable && (
          <div className="space-y-3">
            <Label className="text-sm font-medium">新しいスキルを追加</Label>
            <div className="flex gap-2">
              <Input
                placeholder="スキル名 (例: React, Python, UI/UX Design)"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill()}
                className="flex-1"
              />
              <Select
                value={newSkillLevel.toString()}
                onValueChange={(value) => setNewSkillLevel(parseInt(value))}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {skillLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value.toString()}>
                      レベル {level.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddSkill}
                disabled={!newSkill.trim() || userSkills.some(s => s.skill === newSkill.trim()) || upsertSkillMutation.isPending}
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            
            {/* スキルレベルの説明 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">スキルレベルの目安:</p>
              {skillLevels.map((level) => (
                <div key={level.value} className="flex items-center gap-2">
                  <span className={`inline-flex items-center justify-center w-6 h-6 text-xs rounded-full ${skillLevelColors[level.value as keyof typeof skillLevelColors]}`}>
                    {level.value}
                  </span>
                  <span>{level.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
