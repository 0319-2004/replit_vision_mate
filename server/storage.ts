import {
  users,
  projects,
  participations,
  progressUpdates,
  comments,
  reactions,
  type User,
  type UpsertUser,
  type Project,
  type InsertProject,
  type Participation,
  type InsertParticipation,
  type ProgressUpdate,
  type InsertProgressUpdate,
  type Comment,
  type InsertComment,
  type Reaction,
  type InsertReaction,
  type ProjectWithDetails,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectWithDetails(id: string): Promise<ProjectWithDetails | undefined>;
  getAllProjects(): Promise<Project[]>;
  updateProject(id: string, updates: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: string): Promise<void>;
  
  // Participation operations
  addParticipation(participation: InsertParticipation): Promise<Participation>;
  removeParticipation(projectId: string, userId: string, type: string): Promise<void>;
  getProjectParticipations(projectId: string): Promise<Participation[]>;
  getUserParticipation(projectId: string, userId: string, type: string): Promise<Participation | undefined>;
  
  // Progress update operations
  createProgressUpdate(update: InsertProgressUpdate): Promise<ProgressUpdate>;
  getProjectProgressUpdates(projectId: string): Promise<ProgressUpdate[]>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getProjectComments(projectId: string): Promise<Comment[]>;
  
  // Reaction operations
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  removeReaction(targetId: string, targetType: string, userId: string): Promise<void>;
  getReactions(targetId: string, targetType: string): Promise<Reaction[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (required for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Project operations
  async createProject(projectData: InsertProject): Promise<Project> {
    const [project] = await db
      .insert(projects)
      .values(projectData)
      .returning();
    return project;
  }

  async getProject(id: string): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }

  async getProjectWithDetails(id: string): Promise<ProjectWithDetails | undefined> {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        creator: true,
        participations: {
          with: {
            user: true,
          },
        },
        progressUpdates: {
          with: {
            user: true,
          },
          orderBy: desc(progressUpdates.createdAt),
        },
        comments: {
          with: {
            user: true,
          },
          orderBy: desc(comments.createdAt),
        },
        // Note: reactions are fetched separately due to polymorphic relationship
      },
    });
    
    return project as ProjectWithDetails;
  }

  async getAllProjects(): Promise<Project[]> {
    return await db
      .select()
      .from(projects)
      .where(eq(projects.isActive, true))
      .orderBy(desc(projects.createdAt));
  }

  async updateProject(id: string, updates: Partial<InsertProject>): Promise<Project> {
    const [project] = await db
      .update(projects)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(projects.id, id))
      .returning();
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    await db.update(projects)
      .set({ isActive: false })
      .where(eq(projects.id, id));
  }

  // Participation operations
  async addParticipation(participationData: InsertParticipation): Promise<Participation> {
    const [participation] = await db
      .insert(participations)
      .values(participationData)
      .onConflictDoNothing()
      .returning();
    return participation;
  }

  async removeParticipation(projectId: string, userId: string, type: string): Promise<void> {
    await db.delete(participations)
      .where(
        and(
          eq(participations.projectId, projectId),
          eq(participations.userId, userId),
          eq(participations.type, type)
        )
      );
  }

  async getProjectParticipations(projectId: string): Promise<Participation[]> {
    return await db
      .select()
      .from(participations)
      .where(eq(participations.projectId, projectId));
  }

  async getUserParticipation(projectId: string, userId: string, type: string): Promise<Participation | undefined> {
    const [participation] = await db
      .select()
      .from(participations)
      .where(
        and(
          eq(participations.projectId, projectId),
          eq(participations.userId, userId),
          eq(participations.type, type)
        )
      );
    return participation;
  }

  // Progress update operations
  async createProgressUpdate(updateData: InsertProgressUpdate): Promise<ProgressUpdate> {
    const [update] = await db
      .insert(progressUpdates)
      .values(updateData)
      .returning();
    return update;
  }

  async getProjectProgressUpdates(projectId: string): Promise<ProgressUpdate[]> {
    return await db
      .select()
      .from(progressUpdates)
      .where(eq(progressUpdates.projectId, projectId))
      .orderBy(desc(progressUpdates.createdAt));
  }

  // Comment operations
  async createComment(commentData: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(commentData)
      .returning();
    return comment;
  }

  async getProjectComments(projectId: string): Promise<Comment[]> {
    return await db
      .select()
      .from(comments)
      .where(eq(comments.projectId, projectId))
      .orderBy(desc(comments.createdAt));
  }

  // Reaction operations
  async addReaction(reactionData: InsertReaction): Promise<Reaction> {
    const [reaction] = await db
      .insert(reactions)
      .values(reactionData)
      .onConflictDoNothing()
      .returning();
    return reaction;
  }

  async removeReaction(targetId: string, targetType: string, userId: string): Promise<void> {
    await db.delete(reactions)
      .where(
        and(
          eq(reactions.targetId, targetId),
          eq(reactions.targetType, targetType),
          eq(reactions.userId, userId)
        )
      );
  }

  async getReactions(targetId: string, targetType: string): Promise<Reaction[]> {
    return await db
      .select()
      .from(reactions)
      .where(
        and(
          eq(reactions.targetId, targetId),
          eq(reactions.targetType, targetType)
        )
      );
  }
}

export const storage = new DatabaseStorage();