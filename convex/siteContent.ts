import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const get = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const content = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();
    return content?.value || null;
  },
});

export const getAll = query({
  handler: async (ctx) => {
    const allContent = await ctx.db.query("siteContent").collect();
    const contentMap: Record<string, string> = {};
    for (const item of allContent) {
      contentMap[item.key] = item.value;
    }
    return contentMap;
  },
});

export const set = mutation({
  args: {
    key: v.string(),
    value: v.string(),
    updatedBy: v.id("admins"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("siteContent")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: args.updatedBy,
      });
    } else {
      await ctx.db.insert("siteContent", {
        key: args.key,
        value: args.value,
        updatedAt: Date.now(),
        updatedBy: args.updatedBy,
      });
    }
    return { success: true };
  },
});

