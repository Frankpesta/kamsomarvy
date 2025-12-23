import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const subscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if email already exists
    const existing = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      // If exists but unsubscribed, resubscribe
      if (!existing.subscribed) {
        await ctx.db.patch(existing._id, {
          subscribed: true,
          unsubscribedAt: undefined,
        });
        return { success: true, message: "Successfully resubscribed!" };
      }
      return { success: true, message: "You're already subscribed!" };
    }

    // Create new subscription
    await ctx.db.insert("newsletterSubscriptions", {
      email: args.email,
      subscribed: true,
      createdAt: Date.now(),
    });

    return { success: true, message: "Successfully subscribed!" };
  },
});

export const unsubscribe = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("newsletterSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (subscription && subscription.subscribed) {
      await ctx.db.patch(subscription._id, {
        subscribed: false,
        unsubscribedAt: Date.now(),
      });
      return { success: true, message: "Successfully unsubscribed!" };
    }

    return { success: false, message: "Email not found or already unsubscribed." };
  },
});

export const list = query({
  args: {
    subscribedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Avoid reassigning query between initializer and query types
    const subscriptions = args.subscribedOnly !== undefined
      ? await ctx.db
          .query("newsletterSubscriptions")
          .withIndex("by_subscribed", (q) =>
            q.eq("subscribed", args.subscribedOnly as boolean)
          )
          .collect()
      : await ctx.db
          .query("newsletterSubscriptions")
          .withIndex("by_created")
          .collect();
    
    return subscriptions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const all = await ctx.db.query("newsletterSubscriptions").collect();
    return {
      total: all.length,
      subscribed: all.filter((s) => s.subscribed).length,
      unsubscribed: all.filter((s) => !s.subscribed).length,
    };
  },
});

export const remove = mutation({
  args: {
    id: v.id("newsletterSubscriptions"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});
