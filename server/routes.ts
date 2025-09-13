import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertProjectSchema,
  insertProgressUpdateSchema,
  insertCommentSchema,
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
  app.post('/api/reactions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { targetId, targetType } = req.body;
      
      // Check if reaction already exists
      const existing = await storage.getReactions(targetId, targetType);
      const hasUserReacted = existing.some(r => r.userId === userId && r.type === 'clap');
      
      if (hasUserReacted) {
        await storage.removeReaction(targetId, targetType, userId);
        res.json({ action: 'removed' });
      } else {
        await storage.addReaction({
          targetId,
          targetType,
          userId,
          type: 'clap',
        });
        res.json({ action: 'added' });
      }
    } catch (error) {
      console.error("Error toggling reaction:", error);
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}