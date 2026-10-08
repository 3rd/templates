import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTaskSchema, taskPageSchema, updateTaskSchema } from "../../../shared/schemas";
import { createTask, deleteTask, listTasks, updateTask } from "../../tasks/repository";
import { protectedProcedure, router } from "../base";

export const tasksRouter = router({
  create: protectedProcedure.input(createTaskSchema).mutation(({ ctx, input }) => ({
    task: createTask(ctx.db, ctx.user.id, input.title),
  })),
  delete: protectedProcedure.input(z.object({ id: z.string().uuid() })).mutation(({ ctx, input }) => {
    if (!deleteTask(ctx.db, ctx.user.id, input.id)) {
      throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
    }

    return { ok: true };
  }),
  list: protectedProcedure.input(taskPageSchema.optional()).query(({ ctx, input }) =>
    listTasks(ctx.db, ctx.user.id, input ?? {}),
  ),
  update: protectedProcedure
    .input(updateTaskSchema.extend({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) => {
      const task = updateTask(ctx.db, ctx.user.id, input.id, input);
      if (!task) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Task not found" });
      }

      return { task };
    }),
});
