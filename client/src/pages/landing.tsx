import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Hand, Rocket, Users, Clock, Share } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
              <Rocket className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">VisionMates</h1>
          </div>
          <Button 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Turn Your Ideas Into{" "}
            <span className="text-primary">Action</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            VisionMates is where anyone can turn their ideas into action by forming teams, 
            sharing progress, and finding collaborators — starting from small, personal visions.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            className="mr-4"
            data-testid="button-hero-signup"
          >
            Start Your Vision
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
            data-testid="button-learn-more"
          >
            Learn More
          </Button>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Build Your Vision
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Vision-Driven Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Post a project based on your idea, challenge, or social issue — big or small.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="flex gap-1">
                    <Eye className="w-4 h-4 text-primary" />
                    <Hand className="w-4 h-4 text-primary" />
                  </div>
                </div>
                <CardTitle>Participation Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Express interest with Watch, Raise Hand, or Commit to join projects that inspire you.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Progress Updates</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Keep a visible timeline of milestones instead of losing updates in chat threads.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Discover Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Swipe through projects like a card deck to find inspiring ones quickly.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Share className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>Easy Sharing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Invite friends with shareable links for LINE, Instagram, LinkedIn, and more.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <div className="text-primary text-lg">👏</div>
                </div>
                <CardTitle>Lightweight Collaboration</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Comment, cheer each other on with reactions, and stay motivated together.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Turn Your Vision Into Reality?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join VisionMates and start building momentum around your ideas today.
          </p>
          <Button 
            size="lg" 
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-cta-signup"
          >
            Get Started Now
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center text-muted-foreground">
          <p>&copy; 2024 VisionMates. Turn ideas into action.</p>
        </div>
      </footer>
    </div>
  );
}