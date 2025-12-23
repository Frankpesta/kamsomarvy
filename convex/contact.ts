import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const submit = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name,
      email: args.email,
      phone: args.phone,
      message: args.message,
      read: false,
      replied: false,
      createdAt: Date.now(),
    });

    return { submissionId, success: true };
  },
});

export const list = query({
  args: {
    unreadOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("contactSubmissions");

    if (args.unreadOnly) {
      query = query.withIndex("by_read", (q) => q.eq("read", false));
    } else {
      query = query.withIndex("by_created");
    }

    const submissions = await query.collect();
    return submissions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const markAsRead = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { read: true });
    return { success: true };
  },
});

export const markAsReplied = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { replied: true, read: true });
    return { success: true };
  },
});

export const remove = mutation({
  args: {
    id: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

