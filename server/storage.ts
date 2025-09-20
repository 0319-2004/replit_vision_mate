import {
  users,
  projects,
  participations,
  progressUpdates,
  comments,
  reactions,
  conversations,
  messages,
  type User,
  type UpsertUser,
  type PublicUser,
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
  type Conversation,
  type InsertConversation,
  type Message,
  type InsertMessage,
  type ProjectWithDetails,
  type ConversationWithMessages,
  type MessageWithSender,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, inArray, or, lt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  getPublicProfile(id: string): Promise<Omit<User, 'email'> | undefined>;
  updateUserProfile(id: string, updates: { displayName?: string | null; bio?: string | null; skills?: string[]; githubUrl?: string | null; portfolioUrl?: string | null }): Promise<User>;
  
  // Project operations
  createProject(project: InsertProject): Promise<Project>;
  getProject(id: string): Promise<Project | undefined>;
  getProjectWithDetails(id: string): Promise<ProjectWithDetails | undefined>;
  getAllProjects(): Promise<Project[]>;
  getAllProjectsWithCreators(): Promise<Array<Project & { creator: User; participations: Participation[] }>>;
  getAllProjectsForDiscover(): Promise<Array<Project & { creator: PublicUser; participations: Participation[] }>>;
  getProjectsForDiscoverPaginated(limit?: number, lastCreatedAt?: string, lastId?: string): Promise<Array<Project & { creator: PublicUser; participations: Participation[] }>>;
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
  getProgressUpdate(id: string): Promise<ProgressUpdate | undefined>;
  
  // Comment operations
  createComment(comment: InsertComment): Promise<Comment>;
  getProjectComments(projectId: string): Promise<Comment[]>;
  getComment(id: string): Promise<Comment | undefined>;
  
  // Reaction operations
  addReaction(reaction: InsertReaction): Promise<Reaction>;
  removeReaction(targetId: string, targetType: string, userId: string): Promise<void>;
  getReactions(targetId: string, targetType: string): Promise<Reaction[]>;
  
  // Messaging/DM operations
  createOrGetConversation(participant1Id: string, participant2Id: string): Promise<Conversation>;
  getUserConversations(userId: string): Promise<ConversationWithMessages[]>;
  getConversation(conversationId: string, userId: string): Promise<ConversationWithMessages | undefined>;
  sendMessage(message: InsertMessage): Promise<MessageWithSender>;
  markMessagesAsRead(conversationId: string, userId: string): Promise<void>;
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

  async getPublicProfile(id: string): Promise<Omit<User, 'email'> | undefined> {
    const [user] = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      displayName: users.displayName,
      bio: users.bio,
      skills: users.skills,
      githubUrl: users.githubUrl,
      portfolioUrl: users.portfolioUrl,
      avatarUrl: users.avatarUrl,
      profileImageUrl: users.profileImageUrl,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    }).from(users).where(eq(users.id, id));
    return user;
  }

  async updateUserProfile(id: string, updates: { displayName?: string | null; bio?: string | null; skills?: string[]; githubUrl?: string | null; portfolioUrl?: string | null }): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
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

  async getAllProjectsWithCreators(): Promise<Array<Project & { creator: User; participations: Participation[] }>> {
    const result = await db.query.projects.findMany({
      where: eq(projects.isActive, true),
      with: {
        creator: true,
        participations: true,
      },
      orderBy: desc(projects.createdAt),
    });
    
    return result as Array<Project & { creator: User; participations: Participation[] }>;
  }

  async getAllProjectsForDiscover(): Promise<Array<Project & { creator: PublicUser; participations: Participation[] }>> {
    // Use raw select query to ensure we only get safe public fields
    const projectsData = await db
      .select({
        // Project fields
        id: projects.id,
        title: projects.title,
        description: projects.description,
        creatorId: projects.creatorId,
        isActive: projects.isActive,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        // Safe creator fields only (NO email)
        creatorPublic: {
          id: users.id,
          firstName: users.firstName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(projects)
      .innerJoin(users, eq(projects.creatorId, users.id))
      .where(eq(projects.isActive, true))
      .orderBy(desc(projects.createdAt))
      .limit(20); // Limit for performance

    // Get participations separately
    const projectIds = projectsData.map(p => p.id);
    const participationsData = projectIds.length > 0 
      ? await db.select().from(participations).where(
          inArray(participations.projectId, projectIds)
        )
      : [];

    // Combine the data into the expected format
    const result = projectsData.map(projectData => ({
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      creatorId: projectData.creatorId,
      isActive: projectData.isActive,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      creator: projectData.creatorPublic,
      participations: participationsData.filter(p => p.projectId === projectData.id),
    }));

    return result as Array<Project & { creator: PublicUser; participations: Participation[] }>;
  }

  // New paginated method for better performance
  async getProjectsForDiscoverPaginated(limit: number = 12, lastCreatedAt?: string, lastId?: string): Promise<Array<Project & { creator: PublicUser; participations: Participation[] }>> {
    const baseSelect = db
      .select({
        id: projects.id,
        title: projects.title,
        description: projects.description,
        creatorId: projects.creatorId,
        isActive: projects.isActive,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
        creatorPublic: {
          id: users.id,
          firstName: users.firstName,
          profileImageUrl: users.profileImageUrl,
        },
      })
      .from(projects)
      .innerJoin(users, eq(projects.creatorId, users.id));

    // Build where expression once
    const isActiveExpr = eq(projects.isActive, true);
    const cursorExpr = (lastCreatedAt && lastId)
      ? or(
          lt(projects.createdAt, new Date(lastCreatedAt)),
          and(
            eq(projects.createdAt, new Date(lastCreatedAt)),
            lt(projects.id, lastId)
          )
        )
      : undefined;
    const whereExpr = cursorExpr ? and(isActiveExpr, cursorExpr) : isActiveExpr;

    const projectsData = await baseSelect
      .where(whereExpr)
      .orderBy(desc(projects.createdAt), desc(projects.id))
      .limit(limit);

    // Get participations separately for better performance
    const projectIds = projectsData.map(p => p.id);
    const participationsData = projectIds.length > 0 
      ? await db.select().from(participations).where(
          inArray(participations.projectId, projectIds)
        )
      : [];

    return projectsData.map(projectData => ({
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      creatorId: projectData.creatorId,
      isActive: projectData.isActive,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      creator: projectData.creatorPublic,
      participations: participationsData.filter(p => p.projectId === projectData.id),
    })) as Array<Project & { creator: PublicUser; participations: Participation[] }>;
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

  async getProgressUpdate(id: string): Promise<ProgressUpdate | undefined> {
    const [update] = await db.select().from(progressUpdates).where(eq(progressUpdates.id, id));
    return update;
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

  async getComment(id: string): Promise<Comment | undefined> {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
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

  // Messaging/DM operations
  async createOrGetConversation(participant1Id: string, participant2Id: string): Promise<Conversation> {
    // Ensure consistent ordering: smaller ID comes first
    const [orderedId1, orderedId2] = participant1Id < participant2Id 
      ? [participant1Id, participant2Id] 
      : [participant2Id, participant1Id];

    // Try to find existing conversation
    let [conversation] = await db
      .select()
      .from(conversations)
      .where(
        and(
          eq(conversations.participant1Id, orderedId1),
          eq(conversations.participant2Id, orderedId2)
        )
      );

    // Create new conversation if none exists
    if (!conversation) {
      [conversation] = await db
        .insert(conversations)
        .values({
          participant1Id: orderedId1,
          participant2Id: orderedId2,
        })
        .returning();
    }

    return conversation;
  }

  async getUserConversations(userId: string): Promise<ConversationWithMessages[]> {
    const userConversations = await db.query.conversations.findMany({
      where: (conversations, { or, eq }) => 
        or(
          eq(conversations.participant1Id, userId),
          eq(conversations.participant2Id, userId)
        ),
      with: {
        participant1: true,
        participant2: true,
        messages: {
          with: {
            sender: true,
          },
          orderBy: desc(messages.createdAt),
          limit: 1, // Just get the latest message for conversation list
        },
      },
      orderBy: desc(conversations.lastMessageAt),
    });

    return userConversations;
  }

  async getConversation(conversationId: string, userId: string): Promise<ConversationWithMessages | undefined> {
    const conversation = await db.query.conversations.findFirst({
      where: (conversations, { and, eq, or }) =>
        and(
          eq(conversations.id, conversationId),
          or(
            eq(conversations.participant1Id, userId),
            eq(conversations.participant2Id, userId)
          )
        ),
      with: {
        participant1: true,
        participant2: true,
        messages: {
          with: {
            sender: true,
          },
          orderBy: desc(messages.createdAt),
          limit: 50, // Get last 50 messages
        },
      },
    });

    return conversation;
  }

  async sendMessage(messageData: InsertMessage): Promise<MessageWithSender> {
    // Send the message
    const [message] = await db
      .insert(messages)
      .values(messageData)
      .returning();

    // Update conversation last message timestamp
    await db
      .update(conversations)
      .set({ lastMessageAt: new Date() })
      .where(eq(conversations.id, messageData.conversationId));

    // Fetch message with sender info
    const messageWithSender = await db.query.messages.findFirst({
      where: eq(messages.id, message.id),
      with: {
        sender: true,
      },
    });

    return messageWithSender!;
  }

  async markMessagesAsRead(conversationId: string, userId: string): Promise<void> {
    await db
      .update(messages)
      .set({ isRead: true })
      .where(
        and(
          eq(messages.conversationId, conversationId),
          eq(messages.isRead, false)
        )
      );
  }
}

export const storage = new DatabaseStorage();