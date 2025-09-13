import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Edit, Github, ExternalLink, Settings } from "lucide-react";
import { Link } from "wouter";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user } = useAuth();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['/api/auth/user'],
  });

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

  if (!profile || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md text-center">
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-2">プロフィールが見つかりません</h3>
            <p className="text-muted-foreground">Profile not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profileData = profile as any;
  const displayName = profileData.displayName || `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim();
  const joinedDate = new Date(profileData.createdAt);

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-3xl font-bold">マイプロフィール / My Profile</h1>
        <Link href="/profile/edit">
          <Button data-testid="button-edit-profile">
            <Edit className="w-4 h-4 mr-2" />
            編集 / Edit
          </Button>
        </Link>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profileData.avatarUrl || profileData.profileImageUrl} />
              <AvatarFallback className="text-2xl">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">
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

              {/* External Links */}
              <div className="flex gap-3">
                {profileData.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={profileData.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-github"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {profileData.portfolioUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={profileData.portfolioUrl} 
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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