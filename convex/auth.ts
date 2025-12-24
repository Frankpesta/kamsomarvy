import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Id } from "./_generated/dataModel";

// Hash password helper using Web Crypto API (available in Convex runtime)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

// Create admin session token using Web Crypto API
function createSessionToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

// Sessions are now stored in the database

// Check if email exists
export const checkEmailExists = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    return admin !== null;
  },
});

// First admin signup
export const signup = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if any admin exists
    const existingAdmin = await ctx.db.query("admins").first();
    if (existingAdmin) {
      throw new Error("Admin signup is disabled. Please contact an existing admin.");
    }

    // Check if email already exists
    const emailExists = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (emailExists) {
      throw new Error("Email already registered");
    }

    // Create admin with password hash
    const passwordHash = await hashPassword(args.password);
    const adminId = await ctx.db.insert("admins", {
      email: args.email,
      name: args.name,
      role: "super_admin",
      passwordHash,
      createdAt: Date.now(),
    });

    return { adminId, success: true };
  },
});

// Login
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const admin = await ctx.db
      .query("admins")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!admin) {
      throw new Error("Invalid email or password");
    }

    // Verify password hash
    const passwordHash = await hashPassword(args.password);
    if (admin.passwordHash !== passwordHash) {
      throw new Error("Invalid email or password");
    }

    const sessionToken = createSessionToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days

    // Store session in database
    await ctx.db.insert("sessions", {
      token: sessionToken,
      adminId: admin._id,
      expiresAt,
      createdAt: Date.now(),
    });

    // Update last login
    await ctx.db.patch(admin._id, {
      lastLogin: Date.now(),
    });

    return { sessionToken, admin };
  },
});

// Get current admin
export const getCurrentAdmin = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (!session || session.expiresAt < Date.now()) {
      // Note: Cannot delete in query (read-only). Expired sessions will be ignored.
      return null;
    }

    const admin = await ctx.db.get(session.adminId);
    return admin;
  },
});

// Logout
export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();

    if (session) {
      await ctx.db.delete(session._id);
    }

    return { success: true };
  },
});

