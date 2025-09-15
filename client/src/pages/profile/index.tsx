import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Github, ExternalLink, Settings, GraduationCap, Building } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: 1,
  });

  // デバッグ用ログ
  console.log('Profile page - user:', user);
  console.log('Profile page - profile:', profile);
  console.log('Profile page - error:', error);

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

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">認証が必要です</h3>
            <p className="text-muted-foreground">Authentication required</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">プロフィールを読み込めません</h3>
            <p className="text-muted-foreground mb-4">Profile could not be loaded</p>
            <Link href="/profile/edit">
              <Button>プロフィールを作成 / Create Profile</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileData = profile as any;
  const displayName = profileData.display_name || profileData.displayName || `${profileData.first_name || profileData.firstName || ''} ${profileData.last_name || profileData.lastName || ''}`.trim();
  const joinedDate = new Date(profileData.created_at || profileData.createdAt);

  return (
    <div className="max-w-4xl mx-auto px-0 py-4 md:py-6">
      <div className="flex justify-between items-start mb-4 md:mb-6 px-4">
        <h1 className="text-xl md:text-2xl font-semibold">マイプロフィール / My Profile</h1>
        <Link href="/profile/edit">
          <Button data-testid="button-edit-profile">
            <Edit className="w-4 h-4 mr-2" />
            編集 / Edit
          </Button>
        </Link>
      </div>

      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.avatar_url || profileData.avatarUrl || profileData.profile_image_url || profileData.profileImageUrl} />
              <AvatarFallback className="text-2xl">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl mb-2">
                {displayName || '名前未設定 / Name not set'}
              </CardTitle>
              
              <p className="text-muted-foreground mb-4">
                {profileData.email}
              </p>

              <p className="text-muted-foreground mb-4">
                {formatDistanceToNow(joinedDate, { addSuffix: true })} に参加 / Joined {formatDistanceToNow(joinedDate, { addSuffix: true })}
              </p>

              {profileData.bio && (
                <p className="text-base leading-relaxed mb-4">
                  {profileData.bio}
                </p>
              )}

              {/* Education Info */}
              {(profileData.university || profileData.department) && (
                <div className="mb-4">
                  {profileData.university && (
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.university}</span>
                    </div>
                  )}
                  {profileData.department && (
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{profileData.department}</span>
                    </div>
                  )}
                </div>
              )}

              {/* External Links */}
              <div className="flex gap-3">
                {(profileData.github_url || profileData.githubUrl) && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={profileData.github_url || profileData.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-github"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {(profileData.portfolio_url || profileData.portfolioUrl) && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={profileData.portfolio_url || profileData.portfolioUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-portfolio"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Portfolio
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        {/* Skills Section */}
        {profileData.skills && profileData.skills.length > 0 && (
          <CardContent>
            <h3 className="font-medium mb-3">スキル / Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profileData.skills.map((skill: string, index: number) => (
                <Badge key={index} variant="secondary" data-testid={`skill-${skill}`}>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Profile Stats (Future enhancement) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              プロジェクト / Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">参加中のプロジェクト</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              コントリビューション / Contributions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">今月のコントリビューション</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              拍手 / Claps Received
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">受け取った拍手数</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ / Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            プロジェクトに参加すると、ここにアクティビティが表示されます。
            <br />
            Your project activities will appear here once you join projects.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}