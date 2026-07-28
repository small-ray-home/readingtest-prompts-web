import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getDb } from "./db";
import { students, usageLog } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import * as bcrypt from "bcrypt";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    
    // Admin login with hardcoded credentials
    adminLogin: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const ADMIN_USERNAME = "admin";
        const ADMIN_PASSWORD = "readingadmin";
        
        if (input.username === ADMIN_USERNAME && input.password === ADMIN_PASSWORD) {
          return {
            success: true,
            role: "admin",
            message: "Admin login successful",
          };
        }
        
        throw new Error("Invalid admin credentials");
      }),
    
    // Student login
    studentLogin: publicProcedure
      .input(z.object({
        username: z.string(),
        password: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db
          .select()
          .from(students)
          .where(eq(students.username, input.username))
          .limit(1);
        
        if (result.length === 0) {
          throw new Error("Student not found");
        }
        
        const student = result[0];
        const passwordMatch = await bcrypt.compare(input.password, student.passwordHash);
        
        if (!passwordMatch) {
          throw new Error("Invalid password");
        }
        
        return {
          success: true,
          role: "student",
          studentId: student.id,
          studentName: student.studentName,
          remainingQuota: student.remainingQuota,
          message: "Student login successful",
        };
      }),
  }),

  // Admin procedures
  admin: router({
    // Get all students
    getStudents: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return await db.select().from(students);
      }),
    
    // Create new student
    createStudent: protectedProcedure
      .input(z.object({
        studentName: z.string(),
        username: z.string(),
        password: z.string(),
        quota: z.number().default(20),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const hashedPassword = await bcrypt.hash(input.password, 10);
        
        await db.insert(students).values({
          userId: ctx.user.id,
          studentName: input.studentName,
          username: input.username,
          passwordHash: hashedPassword,
          initialQuota: input.quota,
          remainingQuota: input.quota,
        });
        
        return { success: true };
      }),
    
    // Update student quota
    updateStudentQuota: protectedProcedure
      .input(z.object({
        studentId: z.number(),
        newQuota: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        await db
          .update(students)
          .set({ remainingQuota: input.newQuota })
          .where(eq(students.id, input.studentId));
        
        return { success: true };
      }),
    
    // Delete student
    deleteStudent: protectedProcedure
      .input(z.object({
        studentId: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Unauthorized");
        }
        
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Delete usage logs first
        await db.delete(usageLog).where(eq(usageLog.studentId, input.studentId));
        
        // Then delete student
        await db.delete(students).where(eq(students.id, input.studentId));
        
        return { success: true };
      }),
  }),

  // Student procedures
  student: router({
    // Get student info
    getInfo: publicProcedure
      .input(z.object({
        studentId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        const result = await db
          .select()
          .from(students)
          .where(eq(students.id, input.studentId))
          .limit(1);
        
        if (result.length === 0) {
          throw new Error("Student not found");
        }
        
        return result[0];
      }),
    
    // View article (deduct quota)
    viewArticle: publicProcedure
      .input(z.object({
        studentId: z.number(),
        articleId: z.number(),
        articleTitle: z.string(),
      }))
      .mutation(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        // Get student
        const studentResult = await db
          .select()
          .from(students)
          .where(eq(students.id, input.studentId))
          .limit(1);
        
        if (studentResult.length === 0) {
          throw new Error("Student not found");
        }
        
        const student = studentResult[0];
        
        // Check if quota available
        if (student.remainingQuota <= 0) {
          throw new Error("No remaining quota");
        }
        
        // Deduct quota
        const newQuota = student.remainingQuota - 1;
        await db
          .update(students)
          .set({ remainingQuota: newQuota })
          .where(eq(students.id, input.studentId));
        
        // Log usage
        await db.insert(usageLog).values({
          studentId: input.studentId,
          articleId: input.articleId,
          articleTitle: input.articleTitle,
        });
        
        return {
          success: true,
          remainingQuota: newQuota,
        };
      }),
    
    // Get usage history
    getUsageHistory: publicProcedure
      .input(z.object({
        studentId: z.number(),
      }))
      .query(async ({ input }) => {
        const db = await getDb();
        if (!db) throw new Error("Database not available");
        
        return await db
          .select()
          .from(usageLog)
          .where(eq(usageLog.studentId, input.studentId));
      }),
  }),
});

export type AppRouter = typeof appRouter;
