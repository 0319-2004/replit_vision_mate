import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProjectSchema,
  insertProgressUpdateSchema,
  insertCommentSchema,
  insertReactionSchema,
  reactionRequestSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Project routes
  app.get('/api/projects', async (req, res) => {
    try {
      const projects = await storage.getAllProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Discover projects with creator info for discover mode (safe public data only)
  app.get('/api/projects/discover', async (req, res) => {
    try {
      const projects = await storage.getAllProjectsForDiscover();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects for discover:", error);
      res.status(500).json({ message: "Failed to fetch projects for discover mode" });
    }
  });

  app.get('/api/projects/:id', async (req, res) => {
    try {
      const project = await storage.getProjectWithDetails(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  app.post('/api/projects', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        creatorId: userId,
      });
      
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error: any) {
      console.error("Error creating project:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  app.put('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.creatorId !== userId) {
        return res.status(403).json({ message: "Not authorized to edit this project" });
      }

      const updates = insertProjectSchema.pick({ title: true, description: true, isActive: true }).partial().parse(req.body);
      const updatedProject = await storage.updateProject(req.params.id, updates);
      res.json(updatedProject);
    } catch (error: any) {
      console.error("Error updating project:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  app.delete('/api/projects/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const project = await storage.getProject(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.creatorId !== userId) {
        return res.status(403).json({ message: "Not authorized to delete this project" });
      }

      await storage.deleteProject(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting project:", error);
      res.status(500).json({ message: "Failed to delete project" });
    }
  });

  // Participation routes
  app.post('/api/projects/:id/participate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.body; // 'watch', 'raise_hand', 'commit'
      
      if (!['watch', 'raise_hand', 'commit'].includes(type)) {
        return res.status(400).json({ message: "Invalid participation type" });
      }

      // Check if participation already exists
      const existing = await storage.getUserParticipation(req.params.id, userId, type);
      if (existing) {
        return res.status(409).json({ message: "Participation already exists" });
      }

      const participation = await storage.addParticipation({
        projectId: req.params.id,
        userId,
        type,
      });
      res.status(201).json(participation);
    } catch (error) {
      console.error("Error adding participation:", error);
      res.status(500).json({ message: "Failed to add participation" });
    }
  });

  app.delete('/api/projects/:id/participate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.body;
      
      if (!['watch', 'raise_hand', 'commit'].includes(type)) {
        return res.status(400).json({ message: "Invalid participation type" });
      }
      
      await storage.removeParticipation(req.params.id, userId, type);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing participation:", error);
      res.status(500).json({ message: "Failed to remove participation" });
    }
  });

  // Progress update routes
  app.post('/api/projects/:id/progress', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // SECURITY: Check if user is the project creator
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      if (project.creatorId !== userId) {
        return res.status(403).json({ message: "Only the project creator can add progress updates" });
      }
      
      const updateData = insertProgressUpdateSchema.parse({
        ...req.body,
        projectId: req.params.id,
        userId,
      });
      
      const progressUpdate = await storage.createProgressUpdate(updateData);
      res.status(201).json(progressUpdate);
    } catch (error: any) {
      console.error("Error creating progress update:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid progress update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress update" });
    }
  });

  // Comment routes
  app.post('/api/projects/:id/comments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        projectId: req.params.id,
        userId,
      });
      
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error: any) {
      console.error("Error creating comment:", error);
      if (error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  // Reaction routes
  app.get('/api/reactions', async (req, res) => {
    try {
      const { targetId, targetType } = req.query;
      
      if (!targetId || !targetType) {
        return res.status(400).json({ message: "targetId and targetType are required" });
      }
      
      // Validate targetType using the same enum validation
      if (!['project', 'progress_update', 'comment'].includes(targetType as string)) {
        return res.status(400).json({ message: "Target type must be one of: project, progress_update, comment" });
      }
      
      const reactions = await storage.getReactions(targetId as string, targetType as string);
      res.json({
        reactions,
        count: reactions.length
      });
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });

  app.post('/api/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // SECURITY: Validate request body with Zod schema
      const requestData = reactionRequestSchema.parse(req.body);
      const { targetId, targetType } = requestData;
      
      // SECURITY: Verify target exists before allowing reactions
      let targetExists = false;
      switch (targetType) {
        case 'project':
          const project = await storage.getProject(targetId);
          targetExists = !!project;
          break;
        case 'progress_update':
          const progressUpdate = await storage.getProgressUpdate(targetId);
          targetExists = !!progressUpdate;
          break;
        case 'comment':
          const comment = await storage.getComment(targetId);
          targetExists = !!comment;
          break;
      }
      
      if (!targetExists) {
        return res.status(404).json({ 
          message: `${targetType.replace('_', ' ')} not found` 
        });
      }
      
      // Check if reaction already exists and get current reactions
      const existingReactions = await storage.getReactions(targetId, targetType);
      const hasUserReacted = existingReactions.some(r => r.userId === userId && r.type === 'clap');
      
      let action: 'added' | 'removed';
      if (hasUserReacted) {
        await storage.removeReaction(targetId, targetType, userId);
        action = 'removed';
      } else {
        await storage.addReaction({
          targetId,
          targetType,
          userId,
          type: 'clap',
        });
        action = 'added';
      }
      
      // Get updated reaction count and user status
      const updatedReactions = await storage.getReactions(targetId, targetType);
      const totalCount = updatedReactions.length;
      const userReacted = action === 'added';
      
      res.json({ 
        action,
        count: totalCount,
        userReacted
      });
    } catch (error: any) {
      console.error("Error toggling reaction:", error);
      
      if (error.name === 'ZodError') {
        return res.status(400).json({ 
          message: "Invalid reaction data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}