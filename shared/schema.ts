import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  boolean,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table - updated for Replit Auth integration with enhanced profile fields
export const users = pgTable("users", {
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
  avatarUrl: varchar("avatar_url"), // Supabase Storage avatar (separate from Replit profile image)
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Projects table - core VisionMates feature
export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  creatorId: varchar("creator_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Participation signals - Watch, Raise Hand, Commit
export const participations = pgTable("participations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(), // 'watch', 'raise_hand', 'commit'
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Ensure users can only have one participation of each type per project
  uniqueIndex("participations_unique_idx").on(table.projectId, table.userId, table.type),
]);

// Progress updates - timeline feature
export const progressUpdates = pgTable("progress_updates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Comments - social interaction feature
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  projectId: varchar("project_id").notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Reactions - cheer system with 👏 reactions
export const reactions = pgTable("reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  targetId: varchar("target_id").notNull(), // can be project, progress update, comment, or message
  targetType: varchar("target_type", { length: 50 }).notNull(), // 'project', 'progress_update', 'comment', 'message'
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).default("clap").notNull(), // 'clap' for 👏
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Ensure users can only have one reaction of each type per target
  uniqueIndex("reactions_unique_idx").on(table.targetId, table.targetType, table.userId, table.type),
]);

// Conversations - DM/chat system
export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  participant1Id: varchar("participant1_id").notNull(),
  participant2Id: varchar("participant2_id").notNull(),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => [
  // Ensure each pair of users only has one conversation (ordered by user IDs)
  uniqueIndex("conversations_participants_idx").on(table.participant1Id, table.participant2Id),
]);

// Messages - DM/chat messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  conversationId: varchar("conversation_id").notNull(),
  senderId: varchar("sender_id").notNull(),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Project Likes - heart/like functionality
export const projectLikes = pgTable("project_likes", {
  userId: varchar("user_id").notNull(),
  projectId: varchar("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Primary key on user and project combination
  uniqueIndex("project_likes_pkey").on(table.userId, table.projectId),
]);

// Project Hides - cross/hide functionality  
export const projectHides = pgTable("project_hides", {
  userId: varchar("user_id").notNull(),
  projectId: varchar("project_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Primary key on user and project combination
  uniqueIndex("project_hides_pkey").on(table.userId, table.projectId),
]);

// User Skills - for collaborator matching
export const userSkills = pgTable("user_skills", {
  userId: varchar("user_id").notNull(),
  skill: text("skill").notNull(),
  level: integer("level").default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Primary key on user and skill combination
  uniqueIndex("user_skills_pkey").on(table.userId, table.skill),
]);

// Project Required Skills - for collaborator matching
export const projectRequiredSkills = pgTable("project_required_skills", {
  projectId: varchar("project_id").notNull(),
  skill: text("skill").notNull(),
  priority: integer("priority").default(1),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => [
  // Primary key on project and skill combination
  uniqueIndex("project_required_skills_pkey").on(table.projectId, table.skill),
]);

// Define relations
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  participations: many(participations),
  progressUpdates: many(progressUpdates),
  comments: many(comments),
  sentMessages: many(messages),
  // Note: reactions are fetched separately due to polymorphic relationship
  // Note: conversations are fetched separately due to participant1/participant2 relationship
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, {
    fields: [projects.creatorId],
    references: [users.id],
  }),
  participations: many(participations),
  progressUpdates: many(progressUpdates),
  comments: many(comments),
  // Note: reactions are fetched separately due to polymorphic relationship
}));

export const participationsRelations = relations(participations, ({ one }) => ({
  project: one(projects, {
    fields: [participations.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [participations.userId],
    references: [users.id],
  }),
}));

export const progressUpdatesRelations = relations(progressUpdates, ({ one }) => ({
  project: one(projects, {
    fields: [progressUpdates.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [progressUpdates.userId],
    references: [users.id],
  }),
  // Note: reactions are fetched separately due to polymorphic relationship
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  project: one(projects, {
    fields: [comments.projectId],
    references: [projects.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  // Note: reactions are fetched separately due to polymorphic relationship
}));

export const reactionsRelations = relations(reactions, ({ one }) => ({
  user: one(users, {
    fields: [reactions.userId],
    references: [users.id],
  }),
  // Note: For polymorphic relations, we can't directly define relations to projects/progressUpdates/comments
  // The frontend will need to handle the targetId/targetType logic for fetching related data
}));

export const conversationsRelations = relations(conversations, ({ one, many }) => ({
  participant1: one(users, {
    fields: [conversations.participant1Id],
    references: [users.id],
  }),
  participant2: one(users, {
    fields: [conversations.participant2Id],
    references: [users.id],
  }),
  messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
  conversation: one(conversations, {
    fields: [messages.conversationId],
    references: [conversations.id],
  }),
  sender: one(users, {
    fields: [messages.senderId],
    references: [users.id],
  }),
  // Note: reactions are fetched separately due to polymorphic relationship
}));

// Zod schemas for validation
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertParticipationSchema = createInsertSchema(participations).omit({
  id: true,
  createdAt: true,
});

export const insertProgressUpdateSchema = createInsertSchema(progressUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertReactionSchema = createInsertSchema(reactions).omit({
  id: true,
  createdAt: true,
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertProjectLikeSchema = createInsertSchema(projectLikes).omit({
  createdAt: true,
});

export const insertProjectHideSchema = createInsertSchema(projectHides).omit({
  createdAt: true,
});

export const insertUserSkillSchema = createInsertSchema(userSkills).omit({
  createdAt: true,
});

export const insertProjectRequiredSkillSchema = createInsertSchema(projectRequiredSkills).omit({
  createdAt: true,
});

// Validation schema for reaction API requests
export const reactionRequestSchema = z.object({
  targetId: z.string().min(1, "Target ID is required"),
  targetType: z.enum(["project", "progress_update", "comment", "message"], {
    errorMap: () => ({ message: "Target type must be one of: project, progress_update, comment, message" })
  }),
});

// Validation schema for message API requests
export const messageRequestSchema = z.object({
  content: z.string().min(1, "Message content is required").max(1000, "Message too long"),
  recipientId: z.string().min(1, "Recipient ID is required"),
});

// Type exports
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

// Safe public user type for discover/public endpoints - excludes sensitive data
export type PublicUser = {
  id: string;
  firstName: string | null;
  profileImageUrl: string | null;
};

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Participation = typeof participations.$inferSelect;
export type InsertParticipation = z.infer<typeof insertParticipationSchema>;

export type ProgressUpdate = typeof progressUpdates.$inferSelect;
export type InsertProgressUpdate = z.infer<typeof insertProgressUpdateSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Reaction = typeof reactions.$inferSelect;
export type InsertReaction = z.infer<typeof insertReactionSchema>;

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export type ProjectLike = typeof projectLikes.$inferSelect;
export type InsertProjectLike = z.infer<typeof insertProjectLikeSchema>;

export type ProjectHide = typeof projectHides.$inferSelect;
export type InsertProjectHide = z.infer<typeof insertProjectHideSchema>;

export type UserSkill = typeof userSkills.$inferSelect;
export type InsertUserSkill = z.infer<typeof insertUserSkillSchema>;

export type ProjectRequiredSkill = typeof projectRequiredSkills.$inferSelect;
export type InsertProjectRequiredSkill = z.infer<typeof insertProjectRequiredSkillSchema>;

// Extended types with relations for frontend use
export type ProjectWithDetails = Project & {
  creator: User;
  participations: (Participation & { user: User })[];
  progressUpdates: (ProgressUpdate & { user: User })[];
  comments: (Comment & { user: User })[];
  // Note: reactions will be fetched separately when needed
};

export type ConversationWithMessages = Conversation & {
  participant1: User;
  participant2: User;
  messages: (Message & { sender: User })[];
};

export type MessageWithSender = Message & {
  sender: User;
};

// ProjectWithCreator type for frontend use
export type ProjectWithCreator = Project & {
  creator: PublicUser;
  participations: Participation[];
};