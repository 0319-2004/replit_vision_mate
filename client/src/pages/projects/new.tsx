import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProjectSchema } from "@shared/schema";
import { ArrowLeft, Rocket, Lightbulb, Target } from "lucide-react";
import { isUnauthorizedError } from "@/lib/authUtils";

type CreateProjectFormData = {
  title: string;
  description: string;
};

const createProjectFormSchema = insertProjectSchema.pick({
  title: true,
  description: true,
});

export default function CreateProjectPage() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateProjectFormData>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: CreateProjectFormData) => {
      const res = await apiRequest("POST", "/api/projects", data);
      return await res.json();
    },
    onSuccess: (project: any) => {
      toast({
        title: "プロジェクトが作成されました！",
        description: "あなたのビジョンがライブになり、コラボレーターを受け入れる準備が整いました。",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/projects/${project.id}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "未認証",
          description: "ログアウトしています。再度ログインしています...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "エラー",
        description: "プロジェクトの作成に失敗しました。もう一度お試しください。",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateProjectFormData) => {
    createProjectMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Rocket className="w-8 h-8 text-primary" />
あなたのビジョンを作成
          </h1>
          <p className="text-muted-foreground mt-1">
あなたのアイデアをシェアし、あなたのビジョンを信じるコラボレーターを見つけましょう。
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>プロジェクト詳細</CardTitle>
              <CardDescription>
                あなたのビジョンと達成したいことをコミュニティに伝えましょう。
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>プロジェクトタイトル *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="例：コミュニティガーデンイニシアチブ"
                            data-testid="input-title"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>説明 *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="あなたのビジョン、解決しようとしている問題、求めているサポートの種類を説明してください..."
                            className="min-h-32"
                            data-testid="textarea-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button 
                      type="submit" 
                      disabled={createProjectMutation.isPending}
                      data-testid="button-create-project"
                      className="flex-1"
                    >
                      {createProjectMutation.isPending ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
作成中...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
プロジェクト作成
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate("/")}
                      data-testid="button-cancel"
                    >
キャンセル
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        {/* Tips Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
成功のためのヒント
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">明確で具体的に</h4>
                <p className="text-muted-foreground">
                  達成したいことと成功がどのような状態かを正確に説明してください。
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">情熱を示す</h4>
                <p className="text-muted-foreground">
                  人々は本物の情熱と原因への真の関心に引かれます。
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">依頼内容を明確にする</h4>
                <p className="text-muted-foreground">
                  必要なサポート、スキル、リソースの種類を具体的に明記してください。
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
次に何が起こるか？
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-muted-foreground">あなたのプロジェクトがライブになり、発見ページに表示されます</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-muted-foreground">人々が👀ウォッチ、✋手を上げる、🚀コミットで関心を示します</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-muted-foreground">コラボレーターと繋がり、進捗更新を共有します</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}