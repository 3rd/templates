import { authSchema } from "../../../shared/schemas";
import { clearSessionResponseCookie, readSessionCookie, writeSessionResponseCookie } from "../../auth/cookies";
import { createSession, loginUser, logoutToken, registerUser } from "../../auth/service";
import { publicProcedure, router } from "../base";

export const authRouter = router({
  login: publicProcedure.input(authSchema).mutation(async ({ ctx, input }) => {
    const user = await loginUser(ctx.db, input);
    const session = await createSession(ctx.db, user.id);
    writeSessionResponseCookie(ctx.responseHeaders, session.token, session.expiresAt, ctx.env);
    return { user };
  }),
  logout: publicProcedure.mutation(async ({ ctx }) => {
    await logoutToken(ctx.db, readSessionCookie(ctx.c));
    clearSessionResponseCookie(ctx.responseHeaders);
    return { ok: true };
  }),
  me: publicProcedure.query(({ ctx }) => ({ user: ctx.user ?? null })),
  register: publicProcedure.input(authSchema).mutation(async ({ ctx, input }) => {
    const user = await registerUser(ctx.db, input);
    const session = await createSession(ctx.db, user.id);
    writeSessionResponseCookie(ctx.responseHeaders, session.token, session.expiresAt, ctx.env);
    return { user };
  }),
});
