import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Github, ExternalLink, Mail } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type PublicProfile = {
  id: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  portfolioUrl?: string;
  avatarUrl?: string;
  profileImageUrl?: string;
  createdAt: string;
  // Don't include email for privacy
};

export default function PublicProfilePage() {
  const params = useParams();
  const userId = params.id;

  const { data: profile, isLoading, error } = useQuery<PublicProfile>({
    queryKey: ['/api/profile', userId],
    enabled: !!userId,
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

  if (error || !profile) {
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

  const displayName = profile.displayName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim();
  const joinedDate = new Date(profile.createdAt);

  return (
    <div className="max-w-4xl mx-auto px-0 py-4 md:py-6">
      <Card className="mb-6 md:mb-8">
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={profile.avatarUrl || profile.profileImageUrl} />
              <AvatarFallback className="text-2xl">
                {(displayName || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <CardTitle className="text-xl md:text-2xl mb-2">
                {displayName || '名前未設定 / Name not set'}
              </CardTitle>
              
              <p className="text-muted-foreground mb-4">
                {formatDistanceToNow(joinedDate, { addSuffix: true })} に参加 / Joined {formatDistanceToNow(joinedDate, { addSuffix: true })}
              </p>

              {profile.bio && (
                <p className="text-base leading-relaxed mb-4">
                  {profile.bio}
                </p>
              )}

              {/* External Links */}
              <div className="flex gap-3">
                {profile.githubUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={profile.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      data-testid="link-github"
                    >
                      <Github className="w-4 h-4 mr-2" />
                      GitHub
                    </a>
                  </Button>
                )}
                {profile.portfolioUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a 
                      href={profile.portfolioUrl} 
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
        {profile.skills && profile.skills.length > 0 && (
          <CardContent>
            <h3 className="font-medium mb-3">スキル / Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" data-testid={`skill-${skill}`}>
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Future: Recent Projects/Activities could go here */}
      <Card>
        <CardHeader>
          <CardTitle>最近のアクティビティ / Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            プロジェクトアクティビティは今後実装予定です。
            <br />
            Project activities will be implemented in future updates.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}