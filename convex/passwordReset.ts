import { v } from "convex/values";
import { mutation } from "./_generated/server";

// Hash password helper using Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Generate random token using Web Crypto API
function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export const requestReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!admin) {
      // Don't reveal if email exists for security
      return { success: true };
    }

    const token = generateToken();
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    await ctx.db.insert("passwordResetTokens", {
      adminId: admin._id,
      token,
      expiresAt,
      used: false,
      createdAt: Date.now(),
    });

    // In production, send email with reset link using Resend
    // For now, return token (in production, this should be sent via email)
    return { token, success: true };
  },
});

export const resetPassword = mutation({
  args: {
    token: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const resetToken = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!resetToken || resetToken.used || resetToken.expiresAt < Date.now()) {
      throw new Error("Invalid or expired reset token");
    }

    // Mark token as used
    await ctx.db.patch(resetToken._id, { used: true });

    // Update password hash
    const passwordHash = await hashPassword(args.newPassword);
    await ctx.db.patch(resetToken.adminId, { passwordHash });

    return { success: true };
  },
});

