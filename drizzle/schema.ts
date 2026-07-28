import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Students table for managing student accounts and quotas
 */
export const students = mysqlTable("students", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  studentName: text("studentName").notNull(),
  username: varchar("username", { length: 128 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 256 }).notNull(),
  initialQuota: int("initialQuota").default(20).notNull(),
  remainingQuota: int("remainingQuota").default(20).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Student = typeof students.$inferSelect;
export type InsertStudent = typeof students.$inferInsert;

/**
 * Usage log table to track which articles each student has viewed
 */
export const usageLog = mysqlTable("usageLog", {
  id: int("id").autoincrement().primaryKey(),
  studentId: int("studentId").notNull(),
  articleId: int("articleId").notNull(),
  articleTitle: text("articleTitle").notNull(),
  viewedAt: timestamp("viewedAt").defaultNow().notNull(),
});

export type UsageLog = typeof usageLog.$inferSelect;
export type InsertUsageLog = typeof usageLog.$inferInsert;