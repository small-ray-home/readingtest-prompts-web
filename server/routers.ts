import { router, publicProcedure } from "./_core/trpc";
import { z } from "zod";
import { db } from "./db";
import { users, articles } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from "uuid";

export const appRouter = router({
  // 1. 登入邏輯
  login: publicProcedure
    .input(
      z.object({
        username: z.string(),
        password: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      // 預設管理員驗證
      if (input.username === "admin" && input.password === "readingadmin") {
        return {
          user: {
            id: "admin-id",
            name: "系統管理員",
            username: "admin",
            password: "readingadmin",
            role: "admin" as const,
            totalLimit: 0,
            remainingLimit: 0,
          },
        };
      }

      // 學生驗證
      const foundUser = await db
        .select()
        .from(users)
        .where(eq(users.username, input.username))
        .limit(1);

      if (!foundUser.length || foundUser[0].password !== input.password) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "帳號或密碼錯誤！",
        });
      }

      return { user: foundUser[0] };
    }),

  // 2. 取得所有學生清單
  getStudents: publicProcedure.query(async () => {
    return await db.select().from(users).where(eq(users.role, "student"));
  }),

  // 3. 新增/更新學生資訊（名稱、帳號、密碼、可用篇數、剩餘篇數）
  saveStudent: publicProcedure
    .input(
      z.object({
        id: z.string().optional(),
        name: z.string().min(1, "請輸入姓名"),
        username: z.string().min(1, "請輸入帳號"),
        password: z.string().min(1, "請輸入密碼"),
        totalLimit: z.number().min(0),
        remainingLimit: z.number().min(0),
      })
    )
    .mutation(async ({ input }) => {
      if (input.id) {
        const updated = await db
          .update(users)
          .set({
            name: input.name,
            username: input.username,
            password: input.password,
            totalLimit: input.totalLimit,
            remainingLimit: input.remainingLimit,
          })
          .where(eq(users.id, input.id))
          .returning();
        return updated[0];
      } else {
        const newStudent = await db
          .insert(users)
          .values({
            id: uuidv4(),
            name: input.name,
            username: input.username,
            password: input.password,
            role: "student",
            totalLimit: input.totalLimit,
            remainingLimit: input.remainingLimit,
          })
          .returning();
        return newStudent[0];
      }
    }),

  // 4. 刪除學生
  deleteStudent: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.delete(users).where(eq(users.id, input.id));
      return { success: true };
    }),

  // 5. 取得提示與文章清單
  getArticles: publicProcedure.query(async () => {
    return await db.select().from(articles);
  }),

  // 6. 學生選擇文章，並減少 1 篇額度
  deductAndReadArticle: publicProcedure
    .input(
      z.object({
        studentId: z.string(),
        articleId: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      const studentList = await db
        .select()
        .from(users)
        .where(eq(users.id, input.studentId))
        .limit(1);

      if (!studentList.length) {
        throw new TRPCError({ code: "NOT_FOUND", message: "找不到該學生資訊" });
      }

      const student = studentList[0];
      if (student.remainingLimit <= 0) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "您的剩餘篇數不足，無法觀看提示！",
        });
      }

      // 扣除 1 篇額度
      const updatedStudent = await db
        .update(users)
        .set({
          remainingLimit: student.remainingLimit - 1,
        })
        .where(eq(users.id, input.studentId))
        .returning();

      // 取得文章內容
      const articleList = await db
        .select()
        .from(articles)
        .where(eq(articles.id, input.articleId))
        .limit(1);

      return {
        updatedStudent: updatedStudent[0],
        article: articleList[0],
      };
    }),
});

export type AppRouter = typeof appRouter;
