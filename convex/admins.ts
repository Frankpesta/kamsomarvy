import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Hash password helper using Web Crypto API (available in Convex runtime)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

function createTempPassword(): string {
  // Human-friendly but still high entropy
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint8Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("admins").collect();
  },
});

export const invite = mutation({
  args: {
    email: v.string(),
    name: v.string(),
    role: v.string(), // "admin" or "super_admin"
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("Admin with this email already exists");
    }

    const tempPassword = createTempPassword();
    const passwordHash = await hashPassword(tempPassword);

    const adminId = await ctx.db.insert("admins", {
      email: args.email,
      name: args.name,
      role: args.role,
      passwordHash,
      createdAt: Date.now(),
    });

    // In a production system you’d email the temp password / reset link.
    return { adminId, tempPassword };
  },
});

export const remove = mutation({
  args: { id: v.id("admins") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const updateRole = mutation({
  args: {
    id: v.id("admins"),
    role: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { role: args.role });
    return { success: true };
  },
});

