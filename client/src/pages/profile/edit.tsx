import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Plus, X, Github, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";

// Profile update schema
const profileSchema = z.object({
  displayName: z.string().max(100).optional().or(z.literal('')),
  bio: z.string().max(500).optional().or(z.literal('')),
  githubUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  university: z.string().max(100).optional().or(z.literal('')),
  department: z.string().max(100).optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfileEditPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  // Fetch user profile data
  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

  // Update skills when profile loads
  React.useEffect(() => {
    if (profile) {
      setSkills((profile as any).skills || []);
    }
  }, [profile]);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: '',
      bio: '',
      githubUrl: '',
      portfolioUrl: '',
      university: '',
      department: '',
    },
  });

  // Update form when profile data loads
  React.useEffect(() => {
    if (profile) {
      const profileData = profile as any;
      form.reset({
        displayName: profileData.displayName || profileData.display_name || '',
        bio: profileData.bio || '',
        githubUrl: profileData.githubUrl || profileData.github_url || '',
        portfolioUrl: profileData.portfolioUrl || profileData.portfolio_url || '',
        university: profileData.university || '',
        department: profileData.department || '',
      });
    }
  }, [profile, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileFormData & { skills: string[] }) => {
      // Convert to snake_case for Supabase
      const supabaseData = {
        display_name: data.displayName || null,
        bio: data.bio || null,
        github_url: data.githubUrl || null,
        portfolio_url: data.portfolioUrl || null,
        university: data.university || null,
        department: data.department || null,
        skills: data.skills || []
      };
      
      // Use Supabase API directly
      const { usersApi } = await import('@/lib/supabaseApi');
      return await usersApi.updateProfile(supabaseData);
    },
    onSuccess: () => {
      toast({
        title: "プロフィールを更新しました",
        description: "Profile updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
    },
    onError: (error: any) => {
      toast({
        title: "更新に失敗しました",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim()) && skills.length < 10) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove: string) => {
    setSkills(skills.filter(skill => skill !== skillToRemove));
  };

  const onSubmit = (data: ProfileFormData) => {
    updateProfileMutation.mutate({
      ...data,
      skills,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="mb-6">
        <Link href="/profile">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Profile
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">プロフィール編集 / Edit Profile</h1>
        <p className="text-muted-foreground mt-2">
          あなたのプロフィール情報を更新してください / Update your profile information
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={(profile as any)?.avatarUrl || (profile as any)?.profileImageUrl} />
              <AvatarFallback>
                {((profile as any)?.displayName || (profile as any)?.firstName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>プロフィール情報 / Profile Information</CardTitle>
              <CardDescription>
                {(profile as any)?.email} として登録済み / Registered as {(profile as any)?.email}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>表示名 / Display Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Your display name" 
                        {...field}
                        data-testid="input-display-name"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>自己紹介 / Bio</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Tell others about yourself, your interests, and what you're working on..."
                        className="min-h-[100px]"
                        {...field}
                        data-testid="input-bio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Skills Section */}
              <div className="space-y-3">
                <FormLabel>スキル / Skills</FormLabel>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g. React, Python, Design)"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    data-testid="input-skill"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addSkill}
                    disabled={!skillInput.trim() || skills.length >= 10}
                    data-testid="button-add-skill"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {skills.map((skill, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="ml-1 hover:bg-destructive/10 rounded-full p-0.5"
                        data-testid={`button-remove-skill-${skill}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                {skills.length >= 10 && (
                  <p className="text-sm text-muted-foreground">Maximum 10 skills</p>
                )}
              </div>

              <FormField
                control={form.control}
                name="githubUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://github.com/yourusername" 
                        {...field}
                        data-testid="input-github"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="portfolioUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <ExternalLink className="w-4 h-4" />
                      ポートフォリオ URL / Portfolio URL
                    </FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://yourportfolio.com" 
                        {...field}
                        data-testid="input-portfolio"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="university"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>大学 / University</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 東京大学, University of Tokyo" 
                        {...field}
                        data-testid="input-university"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>学部・学科 / Department</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g. 工学部情報工学科, Computer Science" 
                        {...field}
                        data-testid="input-department"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-3">
                <Link href="/profile">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    キャンセル / Cancel
                  </Button>
                </Link>
                <Button 
                  type="submit" 
                  disabled={updateProfileMutation.isPending}
                  data-testid="button-save-profile"
                >
                  {updateProfileMutation.isPending ? 'Saving...' : '保存 / Save'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}