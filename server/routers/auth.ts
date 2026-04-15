import { router, protectedProcedure, publicProcedure } from "../_core/trpc";
import { TRPCError } from "@trpc/server";

export const authRouter = router({
  /**
   * Get current authenticated user
   */
  me: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }

    return {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      role: ctx.user.role,
      openId: ctx.user.openId,
    };
  }),

  /**
   * Logout current user
   */
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    // The logout is handled by clearing the session cookie on the frontend
    // This procedure just confirms the logout action
    return {
      success: true,
      message: "Logged out successfully",
    };
  }),
});
