import { userSchema } from "shared/schemas/user";
import { z } from "zod";
import { database } from "../../db";
import { publicProcedure, router } from "../setup";

export const userRouter = router({
  list: publicProcedure.query(() => {
    const users = database.users.all();
    return {
      users: users.map((user) => ({
        ...user,
        createdAt: new Date(user.createdAt),
      })),
      total: users.length,
    };
  }),
  getById: publicProcedure.input(z.object({ id: z.string() })).query(({ input }) => {
    const user = database.users.one(input.id);
    if (!user) throw new Error("User not found");
    return {
      ...user,
      createdAt: new Date(user.createdAt),
    };
  }),
  create: publicProcedure.input(userSchema.omit({ id: true })).mutation(({ input }) => {
    const newUser = database.users.create(input);
    return {
      ...newUser,
      createdAt: new Date(newUser.createdAt),
    };
  }),
  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email().optional(),
        name: z.string().optional(),
      }),
    )
    .mutation(({ input }) => {
      const { id, ...updates } = input;
      const updatedUser = database.users.update(id, updates);
      return {
        ...updatedUser,
        createdAt: new Date(updatedUser.createdAt),
        updatedAt: new Date(updatedUser.updatedAt),
      };
    }),
  delete: publicProcedure.input(z.object({ id: z.string() })).mutation(({ input }) => {
    const success = database.users.delete(input.id);
    if (!success) throw new Error("User not found");
    return { success: true };
  }),
});
