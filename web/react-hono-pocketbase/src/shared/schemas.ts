import { z } from "zod";

export const emailSchema = z.string().trim().email().max(254);
export const passwordSchema = z.string().min(8).max(128);

export const authSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const createTaskSchema = z.object({
  title: z.string().trim().min(1).max(160),
});

export const TASK_PAGE_SIZE = 20;

export const taskPageSchema = z.object({
  beforeCreatedAt: z.string()
    .refine((value) => z.iso.datetime({ precision: 3 }).safeParse(value.replace(" ", "T")).success)
    .optional(),
  beforeId: z.string().regex(/^[a-zA-Z0-9_-]{1,64}$/).optional(),
}).refine((input) => Boolean(input.beforeCreatedAt) === Boolean(input.beforeId));

export type TaskPageInput = z.infer<typeof taskPageSchema>;

export const updateTaskSchema = z.object({
  completed: z.boolean().optional(),
  title: z.string().trim().min(1).max(160).optional(),
});

export type AuthInput = z.infer<typeof authSchema>;
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;

export type User = {
  email: string;
  id: string;
};

export type Task = {
  completed: boolean;
  createdAt: string;
  id: string;
  title: string;
  updatedAt: string;
};

export type TaskPage = {
  tasks: Task[];
  hasNext: boolean;
};
