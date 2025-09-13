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
        title: "Project created!",
        description: "Your vision is now live and ready for collaborators.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      navigate(`/projects/${project.id}`);
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create project. Please try again.",
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
            Create Your Vision
          </h1>
          <p className="text-muted-foreground mt-1">
            Share your idea and find collaborators who believe in your vision.
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
              <CardDescription>
                Tell the community about your vision and what you want to accomplish.
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
                        <FormLabel>Project Title *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g., Community Garden Initiative"
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
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe your vision, the problem you're solving, and what kind of help you're looking for..."
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
                          Creating...
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4 mr-2" />
                          Create Project
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={() => navigate("/")}
                      data-testid="button-cancel"
                    >
                      Cancel
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
                Tips for Success
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium mb-1">Be Clear & Specific</h4>
                <p className="text-muted-foreground">
                  Explain exactly what you want to achieve and what success looks like.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Show Your Passion</h4>
                <p className="text-muted-foreground">
                  People are drawn to authentic enthusiasm and genuine care about the cause.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Define the Ask</h4>
                <p className="text-muted-foreground">
                  Be specific about what kind of help, skills, or resources you need.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-green-500" />
                What Happens Next?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</div>
                <p className="text-muted-foreground">Your project goes live and appears in discovery</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</div>
                <p className="text-muted-foreground">People show interest with 👀 Watch, ✋ Raise Hand, or 🚀 Commit</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</div>
                <p className="text-muted-foreground">Connect with collaborators and share progress updates</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}