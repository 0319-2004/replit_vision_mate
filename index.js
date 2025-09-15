var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  comments: () => comments,
  commentsRelations: () => commentsRelations,
  conversations: () => conversations,
  conversationsRelations: () => conversationsRelations,
  insertCommentSchema: () => insertCommentSchema,
  insertConversationSchema: () => insertConversationSchema,
  insertMessageSchema: () => insertMessageSchema,
  insertParticipationSchema: () => insertParticipationSchema,
  insertProgressUpdateSchema: () => insertProgressUpdateSchema,
  insertProjectHideSchema: () => insertProjectHideSchema,
  insertProjectLikeSchema: () => insertProjectLikeSchema,
  insertProjectRequiredSkillSchema: () => insertProjectRequiredSkillSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertReactionSchema: () => insertReactionSchema,
  insertUserSchema: () => insertUserSchema,
  insertUserSkillSchema: () => insertUserSkillSchema,
  messageRequestSchema: () => messageRequestSchema,
  messages: () => messages,
  messagesRelations: () => messagesRelations,
  participations: () => participations,
  participationsRelations: () => participationsRelations,
  progressUpdates: () => progressUpdates,
  progressUpdatesRelations: () => progressUpdatesRelations,
  projectHides: () => projectHides,
  projectLikes: () => projectLikes,
  projectRequiredSkills: () => projectRequiredSkills,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  reactionRequestSchema: () => reactionRequestSchema,
  reactions: () => reactions,
  reactionsRelations: () => reactionsRelations,
  sessions: () => sessions,
  userSkills: () => userSkills,
  users: () => users,
  usersRelations: () => usersRelations
});
import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uniqueIndex
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull()
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  // Enhanced profile fields for Aoyama collaboration
  displayName: varchar("display_name", { length: 100 }),
  bio: text("bio"),
  skills: text("skills").array().default(sql`'{}'::text[]`),
  githubUrl: varchar("github_url"),
  portfolioUrl: varchar("portfolio_url"),
  avatarUrl: varchar("avatar_url"),
  // Supabase Storage avatar (separate from Replit profile image)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  creatorId: varchar("creator_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});
var participations = pgTable("participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  // 'watch', 'raise_hand', 'commit'
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Ensure users can only have one participation of each type per project
  uniqueIndex("participations_unique_idx").on(table.projectId, table.userId, table.type)
]);
var progressUpdates = pgTable("progress_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetId: varchar("target_id").notNull(),
  // can be project, progress update, comment, or message
  targetType: varchar("target_type", { length: 50 }).notNull(),
  // 'project', 'progress_update', 'comment', 'message'
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).default("clap").notNull(),
  // 'clap' for 👏
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Ensure users can only have one reaction of each type per target
  uniqueIndex("reactions_unique_idx").on(table.targetId, table.targetType, table.userId, table.type)
]);
var conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull(),
  participant2Id: varchar("participant2_id").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
}, (table) => [
  // Ensure each pair of users only has one conversation (ordered by user IDs)
  uniqueIndex("conversations_participants_idx").on(table.participant1Id, table.participant2Id)
]);
var messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow()
});
var projectLikes = pgTable("project_likes", {
  userId: varchar("user_id").notNull(),
  projectId: varchar("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Primary key on user and project combination
  uniqueIndex("project_likes_pkey").on(table.userId, table.projectId)
]);
var projectHides = pgTable("project_hides", {
  userId: varchar("user_id").notNull(),
  projectId: varchar("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Primary key on user and project combination
  uniqueIndex("project_hides_pkey").on(table.userId, table.projectId)
]);
var userSkills = pgTable("user_skills", {
  userId: varchar("user_id").notNull(),
  skill: text("skill").notNull(),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Primary key on user and skill combination
  uniqueIndex("user_skills_pkey").on(table.userId, table.skill)
]);
var projectRequiredSkills = pgTable("project_required_skills", {
  projectId: varchar("project_id").notNull(),
  skill: text("skill").notNull(),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow()
}, (table) => [
  // Primary key on project and skill combination
  uniqueIndex("project_required_skills_pkey").on(table.projectId, table.skill)
]);
var usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  participations: many(participations),
  progressUpdates: many(progressUpdates),
  comments: many(comments),
  sentMessages: many(messages)
  // Note: reactions are fetched separately due to polymorphic relationship
  // Note: conversations are fetched separately due to participant1/participant2 relationship
}));
var projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id]
  }),
  participations: many(participations),
  progressUpdates: many(progressUpdates),
  comments: many(comments)
  // Note: reactions are fetched separately due to polymorphic relationship
}));
var participationsRelations = relations(participations, ({ one }) => ({
  project: one(projects, {
    fields: [participations.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [participations.userId],
    references: [users.id]
  })
}));
var progressUpdatesRelations = relations(progressUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [progressUpdates.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [progressUpdates.userId],
    references: [users.id]
  })
  // Note: reactions are fetched separately due to polymorphic relationship
}));
var commentsRelations = relations(comments, ({ one }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id]
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id]
  })
  // Note: reactions are fetched separately due to polymorphic relationship
}));
var reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id]
  })
  // Note: For polymorphic relations, we can't directly define relations to projects/progressUpdates/comments
  // The frontend will need to handle the targetId/targetType logic for fetching related data
}));
var conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id]
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id]
  }),
  messages: many(messages)
}));
var messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id]
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id]
  })
  // Note: reactions are fetched separately due to polymorphic relationship
}));
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertParticipationSchema = createInsertSchema(participations).omit({
  id: true,
  createdAt: true
});
var insertProgressUpdateSchema = createInsertSchema(progressUpdates).omit({
  id: true,
  createdAt: true
});
var insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true
});
var insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true
});
var insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true
});
var insertProjectLikeSchema = createInsertSchema(projectLikes).omit({
  createdAt: true
});
var insertProjectHideSchema = createInsertSchema(projectHides).omit({
  createdAt: true
});
var insertUserSkillSchema = createInsertSchema(userSkills).omit({
  createdAt: true
});
var insertProjectRequiredSkillSchema = createInsertSchema(projectRequiredSkills).omit({
  createdAt: true
});
var reactionRequestSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  targetType: z.enum(["project", "progress_update", "comment", "message"], {
    errorMap: () => ({ message: "Target type must be one of: project, progress_update, comment, message" })
  })
});
var messageRequestSchema = z.object({
  content: z.string().min(1, "Message content is required").max(1e3, "Message too long"),
  recipientId: z.string().min(1, "Recipient ID is required")
});

// server/db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
var db = drizzle(pool, { schema: schema_exports });

// server/storage.ts
import { eq, desc, and, inArray, or, lt } from "drizzle-orm";
var DatabaseStorage = class {
  // User operations (required for Replit Auth)
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async upsertUser(userData) {
    const [user] = await db.insert(users).values(userData).onConflictDoUpdate({
      target: users.id,
      set: {
        ...userData,
        updatedAt: /* @__PURE__ */ new Date()
      }
    }).returning();
    return user;
  }
  async getPublicProfile(id) {
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
      updatedAt: users.updatedAt
    }).from(users).where(eq(users.id, id));
    return user;
  }
  async updateUserProfile(id, updates) {
    const [user] = await db.update(users).set({
      ...updates,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(users.id, id)).returning();
    return user;
  }
  // Project operations
  async createProject(projectData) {
    const [project] = await db.insert(projects).values(projectData).returning();
    return project;
  }
  async getProject(id) {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  async getProjectWithDetails(id) {
    const project = await db.query.projects.findFirst({
      where: eq(projects.id, id),
      with: {
        creator: true,
        participations: {
          with: {
            user: true
          }
        },
        progressUpdates: {
          with: {
            user: true
          },
          orderBy: desc(progressUpdates.createdAt)
        },
        comments: {
          with: {
            user: true
          },
          orderBy: desc(comments.createdAt)
        }
        // Note: reactions are fetched separately due to polymorphic relationship
      }
    });
    return project;
  }
  async getAllProjects() {
    return await db.select().from(projects).where(eq(projects.isActive, true)).orderBy(desc(projects.createdAt));
  }
  async getAllProjectsWithCreators() {
    const result = await db.query.projects.findMany({
      where: eq(projects.isActive, true),
      with: {
        creator: true,
        participations: true
      },
      orderBy: desc(projects.createdAt)
    });
    return result;
  }
  async getAllProjectsForDiscover() {
    const projectsData = await db.select({
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
        profileImageUrl: users.profileImageUrl
      }
    }).from(projects).innerJoin(users, eq(projects.creatorId, users.id)).where(eq(projects.isActive, true)).orderBy(desc(projects.createdAt)).limit(20);
    const projectIds = projectsData.map((p) => p.id);
    const participationsData = projectIds.length > 0 ? await db.select().from(participations).where(
      inArray(participations.projectId, projectIds)
    ) : [];
    const result = projectsData.map((projectData) => ({
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      creatorId: projectData.creatorId,
      isActive: projectData.isActive,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      creator: projectData.creatorPublic,
      participations: participationsData.filter((p) => p.projectId === projectData.id)
    }));
    return result;
  }
  // New paginated method for better performance
  async getProjectsForDiscoverPaginated(limit = 12, lastCreatedAt, lastId) {
    let query = db.select({
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
        profileImageUrl: users.profileImageUrl
      }
    }).from(projects).innerJoin(users, eq(projects.creatorId, users.id)).where(eq(projects.isActive, true));
    if (lastCreatedAt && lastId) {
      query = query.where(
        or(
          lt(projects.createdAt, new Date(lastCreatedAt)),
          and(
            eq(projects.createdAt, new Date(lastCreatedAt)),
            lt(projects.id, lastId)
          )
        )
      );
    }
    const projectsData = await query.orderBy(desc(projects.createdAt), desc(projects.id)).limit(limit);
    const projectIds = projectsData.map((p) => p.id);
    const participationsData = projectIds.length > 0 ? await db.select().from(participations).where(
      inArray(participations.projectId, projectIds)
    ) : [];
    return projectsData.map((projectData) => ({
      id: projectData.id,
      title: projectData.title,
      description: projectData.description,
      creatorId: projectData.creatorId,
      isActive: projectData.isActive,
      createdAt: projectData.createdAt,
      updatedAt: projectData.updatedAt,
      creator: projectData.creatorPublic,
      participations: participationsData.filter((p) => p.projectId === projectData.id)
    }));
  }
  async updateProject(id, updates) {
    const [project] = await db.update(projects).set({ ...updates, updatedAt: /* @__PURE__ */ new Date() }).where(eq(projects.id, id)).returning();
    return project;
  }
  async deleteProject(id) {
    await db.update(projects).set({ isActive: false }).where(eq(projects.id, id));
  }
  // Participation operations
  async addParticipation(participationData) {
    const [participation] = await db.insert(participations).values(participationData).onConflictDoNothing().returning();
    return participation;
  }
  async removeParticipation(projectId, userId, type) {
    await db.delete(participations).where(
      and(
        eq(participations.projectId, projectId),
        eq(participations.userId, userId),
        eq(participations.type, type)
      )
    );
  }
  async getProjectParticipations(projectId) {
    return await db.select().from(participations).where(eq(participations.projectId, projectId));
  }
  async getUserParticipation(projectId, userId, type) {
    const [participation] = await db.select().from(participations).where(
      and(
        eq(participations.projectId, projectId),
        eq(participations.userId, userId),
        eq(participations.type, type)
      )
    );
    return participation;
  }
  // Progress update operations
  async createProgressUpdate(updateData) {
    const [update] = await db.insert(progressUpdates).values(updateData).returning();
    return update;
  }
  async getProjectProgressUpdates(projectId) {
    return await db.select().from(progressUpdates).where(eq(progressUpdates.projectId, projectId)).orderBy(desc(progressUpdates.createdAt));
  }
  async getProgressUpdate(id) {
    const [update] = await db.select().from(progressUpdates).where(eq(progressUpdates.id, id));
    return update;
  }
  // Comment operations
  async createComment(commentData) {
    const [comment] = await db.insert(comments).values(commentData).returning();
    return comment;
  }
  async getProjectComments(projectId) {
    return await db.select().from(comments).where(eq(comments.projectId, projectId)).orderBy(desc(comments.createdAt));
  }
  async getComment(id) {
    const [comment] = await db.select().from(comments).where(eq(comments.id, id));
    return comment;
  }
  // Reaction operations
  async addReaction(reactionData) {
    const [reaction] = await db.insert(reactions).values(reactionData).onConflictDoNothing().returning();
    return reaction;
  }
  async removeReaction(targetId, targetType, userId) {
    await db.delete(reactions).where(
      and(
        eq(reactions.targetId, targetId),
        eq(reactions.targetType, targetType),
        eq(reactions.userId, userId)
      )
    );
  }
  async getReactions(targetId, targetType) {
    return await db.select().from(reactions).where(
      and(
        eq(reactions.targetId, targetId),
        eq(reactions.targetType, targetType)
      )
    );
  }
  // Messaging/DM operations
  async createOrGetConversation(participant1Id, participant2Id) {
    const [orderedId1, orderedId2] = participant1Id < participant2Id ? [participant1Id, participant2Id] : [participant2Id, participant1Id];
    let [conversation] = await db.select().from(conversations).where(
      and(
        eq(conversations.participant1Id, orderedId1),
        eq(conversations.participant2Id, orderedId2)
      )
    );
    if (!conversation) {
      [conversation] = await db.insert(conversations).values({
        participant1Id: orderedId1,
        participant2Id: orderedId2
      }).returning();
    }
    return conversation;
  }
  async getUserConversations(userId) {
    const userConversations = await db.query.conversations.findMany({
      where: (conversations2, { or: or2, eq: eq2 }) => or2(
        eq2(conversations2.participant1Id, userId),
        eq2(conversations2.participant2Id, userId)
      ),
      with: {
        participant1: true,
        participant2: true,
        messages: {
          with: {
            sender: true
          },
          orderBy: desc(messages.createdAt),
          limit: 1
          // Just get the latest message for conversation list
        }
      },
      orderBy: desc(conversations.lastMessageAt)
    });
    return userConversations;
  }
  async getConversation(conversationId, userId) {
    const conversation = await db.query.conversations.findFirst({
      where: (conversations2, { and: and2, eq: eq2, or: or2 }) => and2(
        eq2(conversations2.id, conversationId),
        or2(
          eq2(conversations2.participant1Id, userId),
          eq2(conversations2.participant2Id, userId)
        )
      ),
      with: {
        participant1: true,
        participant2: true,
        messages: {
          with: {
            sender: true
          },
          orderBy: desc(messages.createdAt),
          limit: 50
          // Get last 50 messages
        }
      }
    });
    return conversation;
  }
  async sendMessage(messageData) {
    const [message] = await db.insert(messages).values(messageData).returning();
    await db.update(conversations).set({ lastMessageAt: /* @__PURE__ */ new Date() }).where(eq(conversations.id, messageData.conversationId));
    const messageWithSender = await db.query.messages.findFirst({
      where: eq(messages.id, message.id),
      with: {
        sender: true
      }
    });
    return messageWithSender;
  }
  async markMessagesAsRead(conversationId, userId) {
    await db.update(messages).set({ isRead: true }).where(
      and(
        eq(messages.conversationId, conversationId),
        eq(messages.isRead, false)
      )
    );
  }
};
var storage = new DatabaseStorage();

// server/replitAuth.ts
import * as client from "openid-client";
import { Strategy } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";

// server/utils/domainValidation.ts
var ALLOWED_DOMAIN_PATTERNS = [
  /^aoyama\.jp$/i,
  /(^|\.)aoyama\.ac\.jp$/i
];
function isAllowedDomain(email) {
  if (!email || typeof email !== "string") {
    return false;
  }
  const domain = email.split("@")[1]?.toLowerCase();
  if (!domain) {
    return false;
  }
  return ALLOWED_DOMAIN_PATTERNS.some((pattern) => pattern.test(domain));
}
function getDomainErrorMessage() {
  return "\u3053\u306E\u30A2\u30D7\u30EA\u30B1\u30FC\u30B7\u30E7\u30F3\u306F\u9752\u5C71\u5B66\u9662\u5927\u5B66\u306E\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9(@aoyama.ac.jp \u307E\u305F\u306F @aoyama.jp)\u3067\u306E\u307F\u3054\u5229\u7528\u3044\u305F\u3060\u3051\u307E\u3059\u3002\n\nThis application is only available for Aoyama Gakuin University email addresses (@aoyama.ac.jp or @aoyama.jp).";
}
function validateDomainMiddleware(req, res, next) {
  const user = req.user;
  if (!user || !user.claims?.email) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  if (!isAllowedDomain(user.claims.email)) {
    return res.status(403).json({
      message: getDomainErrorMessage(),
      code: "DOMAIN_NOT_ALLOWED"
    });
  }
  next();
}

// server/replitAuth.ts
if (!process.env.REPLIT_DOMAINS) {
  throw new Error("Environment variable REPLIT_DOMAINS not provided");
}
var getOidcConfig = memoize(
  async () => {
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1e3 }
);
function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1e3;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions"
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: sessionTtl
    }
  });
}
function updateUserSession(user, tokens) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}
async function upsertUser(claims) {
  if (!isAllowedDomain(claims["email"])) {
    throw new Error(`DOMAIN_NOT_ALLOWED: ${getDomainErrorMessage()}`);
  }
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"]
  });
}
async function setupAuth(app2) {
  app2.set("trust proxy", 1);
  app2.use(getSession());
  app2.use(passport.initialize());
  app2.use(passport.session());
  const config = await getOidcConfig();
  const verify = async (tokens, verified) => {
    try {
      const user = {};
      updateUserSession(user, tokens);
      await upsertUser(tokens.claims());
      verified(null, user);
    } catch (error) {
      if (error.message.startsWith("DOMAIN_NOT_ALLOWED:")) {
        verified(new Error("DOMAIN_NOT_ALLOWED"), null);
      } else {
        verified(error, null);
      }
    }
  };
  for (const domain of process.env.REPLIT_DOMAINS.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`
      },
      verify
    );
    passport.use(strategy);
  }
  passport.serializeUser((user, cb) => cb(null, user));
  passport.deserializeUser((user, cb) => cb(null, user));
  app2.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"]
    })(req, res, next);
  });
  app2.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, (err, user) => {
      if (err) {
        if (err.message === "DOMAIN_NOT_ALLOWED") {
          return res.redirect("/?error=domain_not_allowed");
        }
        return res.redirect("/api/login");
      }
      if (!user) {
        return res.redirect("/api/login");
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) {
          return res.redirect("/api/login");
        }
        return res.redirect("/");
      });
    })(req, res, next);
  });
  app2.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`
        }).href
      );
    });
  });
}
var isAuthenticated = async (req, res, next) => {
  const user = req.user;
  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const now = Math.floor(Date.now() / 1e3);
  if (now <= user.expires_at) {
    return next();
  }
  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};

// server/routes.ts
async function registerRoutes(app2) {
  await setupAuth(app2);
  app2.get("/api/auth/user", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  app2.get("/api/profile/:id", async (req, res) => {
    try {
      const user = await storage.getPublicProfile(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "Profile not found" });
      }
      res.json(user);
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ message: "Failed to fetch profile" });
    }
  });
  app2.put("/api/profile", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { displayName, bio, skills, githubUrl, portfolioUrl } = req.body;
      if (displayName && displayName.length > 100) {
        return res.status(400).json({ message: "Display name too long" });
      }
      if (bio && bio.length > 500) {
        return res.status(400).json({ message: "Bio too long" });
      }
      if (skills && (!Array.isArray(skills) || skills.length > 10)) {
        return res.status(400).json({ message: "Invalid skills format or too many skills" });
      }
      const updatedProfile = await storage.updateUserProfile(userId, {
        displayName: displayName || null,
        bio: bio || null,
        skills: skills || [],
        githubUrl: githubUrl || null,
        portfolioUrl: portfolioUrl || null
      });
      res.json(updatedProfile);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
  app2.get("/api/projects", async (req, res) => {
    try {
      const projects2 = await storage.getAllProjects();
      res.json(projects2);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });
  app2.get("/api/projects/discover", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 12;
      const lastCreatedAt = req.query.lastCreatedAt;
      const lastId = req.query.lastId;
      const projects2 = await storage.getProjectsForDiscoverPaginated(limit, lastCreatedAt, lastId);
      res.json({
        projects: projects2,
        hasMore: projects2.length === limit,
        nextCursor: projects2.length > 0 ? {
          lastCreatedAt: projects2[projects2.length - 1].createdAt,
          lastId: projects2[projects2.length - 1].id
        } : null
      });
    } catch (error) {
      console.error("Error fetching projects for discover:", error);
      res.status(500).json({ message: "Failed to fetch projects for discover mode" });
    }
  });
  app2.get("/api/projects/:id", async (req, res) => {
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
  app2.post("/api/projects", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const projectData = insertProjectSchema.parse({
        ...req.body,
        creatorId: userId
      });
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  app2.put("/api/projects/:id", isAuthenticated, validateDomainMiddleware, async (req, res) => {
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
    } catch (error) {
      console.error("Error updating project:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });
  app2.delete("/api/projects/:id", isAuthenticated, validateDomainMiddleware, async (req, res) => {
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
  app2.post("/api/projects/:id/participate", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.body;
      if (!["watch", "raise_hand", "commit"].includes(type)) {
        return res.status(400).json({ message: "Invalid participation type" });
      }
      const existing = await storage.getUserParticipation(req.params.id, userId, type);
      if (existing) {
        return res.status(409).json({ message: "Participation already exists" });
      }
      const participation = await storage.addParticipation({
        projectId: req.params.id,
        userId,
        type
      });
      res.status(201).json(participation);
    } catch (error) {
      console.error("Error adding participation:", error);
      res.status(500).json({ message: "Failed to add participation" });
    }
  });
  app2.delete("/api/projects/:id/participate", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { type } = req.body;
      if (!["watch", "raise_hand", "commit"].includes(type)) {
        return res.status(400).json({ message: "Invalid participation type" });
      }
      await storage.removeParticipation(req.params.id, userId, type);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing participation:", error);
      res.status(500).json({ message: "Failed to remove participation" });
    }
  });
  app2.post("/api/projects/:id/progress", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
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
        userId
      });
      const progressUpdate = await storage.createProgressUpdate(updateData);
      res.status(201).json(progressUpdate);
    } catch (error) {
      console.error("Error creating progress update:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid progress update data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create progress update" });
    }
  });
  app2.post("/api/projects/:id/comments", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        projectId: req.params.id,
        userId
      });
      const comment = await storage.createComment(commentData);
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error creating comment:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({ message: "Invalid comment data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });
  app2.get("/api/reactions/:targetType/:targetId", async (req, res) => {
    try {
      const { targetId, targetType } = req.params;
      if (!["project", "progress_update", "comment", "message"].includes(targetType)) {
        return res.status(400).json({ message: "Target type must be one of: project, progress_update, comment, message" });
      }
      const reactions2 = await storage.getReactions(targetId, targetType);
      const totalCount = reactions2.length;
      let userReacted = false;
      if (req.user) {
        const userId = req.user.claims.sub;
        userReacted = reactions2.some((r) => r.userId === userId);
      }
      res.json({ count: totalCount, userReacted });
    } catch (error) {
      console.error("Error fetching reaction status:", error);
      res.status(500).json({ message: "Failed to fetch reaction status" });
    }
  });
  app2.get("/api/reactions", async (req, res) => {
    try {
      const { targetId, targetType } = req.query;
      if (!targetId || !targetType) {
        return res.status(400).json({ message: "targetId and targetType are required" });
      }
      if (!["project", "progress_update", "comment"].includes(targetType)) {
        return res.status(400).json({ message: "Target type must be one of: project, progress_update, comment" });
      }
      const reactions2 = await storage.getReactions(targetId, targetType);
      res.json({
        reactions: reactions2,
        count: reactions2.length
      });
    } catch (error) {
      console.error("Error fetching reactions:", error);
      res.status(500).json({ message: "Failed to fetch reactions" });
    }
  });
  app2.post("/api/reactions", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const requestData = reactionRequestSchema.parse(req.body);
      const { targetId, targetType } = requestData;
      let targetExists = false;
      switch (targetType) {
        case "project":
          const project = await storage.getProject(targetId);
          targetExists = !!project;
          break;
        case "progress_update":
          const progressUpdate = await storage.getProgressUpdate(targetId);
          targetExists = !!progressUpdate;
          break;
        case "comment":
          const comment = await storage.getComment(targetId);
          targetExists = !!comment;
          break;
      }
      if (!targetExists) {
        return res.status(404).json({
          message: `${targetType.replace("_", " ")} not found`
        });
      }
      const existingReactions = await storage.getReactions(targetId, targetType);
      const hasUserReacted = existingReactions.some((r) => r.userId === userId && r.type === "clap");
      let action;
      if (hasUserReacted) {
        await storage.removeReaction(targetId, targetType, userId);
        action = "removed";
      } else {
        await storage.addReaction({
          targetId,
          targetType,
          userId,
          type: "clap"
        });
        action = "added";
      }
      const updatedReactions = await storage.getReactions(targetId, targetType);
      const totalCount = updatedReactions.length;
      const userReacted = action === "added";
      res.json({
        action,
        count: totalCount,
        userReacted
      });
    } catch (error) {
      console.error("Error toggling reaction:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid reaction data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to toggle reaction" });
    }
  });
  app2.get("/api/conversations", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversations2 = await storage.getUserConversations(userId);
      res.json(conversations2);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });
  app2.get("/api/conversations/:id", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const conversation = await storage.getConversation(req.params.id, userId);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      await storage.markMessagesAsRead(req.params.id, userId);
      res.json(conversation);
    } catch (error) {
      console.error("Error fetching conversation:", error);
      res.status(500).json({ message: "Failed to fetch conversation" });
    }
  });
  app2.post("/api/messages", isAuthenticated, validateDomainMiddleware, async (req, res) => {
    try {
      const userId = req.user.claims.sub;
      const { content, recipientId } = messageRequestSchema.parse(req.body);
      if (userId === recipientId) {
        return res.status(400).json({ message: "Cannot send message to yourself" });
      }
      const recipient = await storage.getUser(recipientId);
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      const conversation = await storage.createOrGetConversation(userId, recipientId);
      const message = await storage.sendMessage({
        conversationId: conversation.id,
        senderId: userId,
        content
      });
      res.status(201).json(message);
    } catch (error) {
      console.error("Error sending message:", error);
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Invalid message data",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to send message" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  base: process.env.NODE_ENV === "production" ? "/replit_vision_mate/" : "/",
  plugins: [
    react(),
    // Replit用のプラグインは本番環境では無効化
    ...process.env.NODE_ENV !== "production" ? [runtimeErrorOverlay()] : [],
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
    // GitHub Pages用の最適化
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          supabase: ["@supabase/supabase-js"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"]
        }
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  },
  // GitHub Pages用の追加設定
  define: {
    global: "globalThis"
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
