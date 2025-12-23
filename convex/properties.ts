import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  args: {
    category: v.optional(v.string()),
    propertyType: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    // Avoid reassigning `ctx.db.query(...)` between initializer and query types.
    const properties =
      args.featured !== undefined
        ? await ctx.db
            .query("properties")
            .withIndex("by_featured", (q) => q.eq("featured", args.featured as boolean))
            .collect()
        : args.category
          ? await ctx.db
              .query("properties")
              .withIndex("by_category", (q) => q.eq("category", args.category as string))
              .collect()
          : args.propertyType
            ? await ctx.db
                .query("properties")
                .withIndex("by_property_type", (q) =>
                  q.eq("propertyType", args.propertyType as string)
                )
                .collect()
            : await ctx.db.query("properties").withIndex("by_created").collect();
    return properties.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const get = query({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    price: v.number(),
    location: v.string(),
    address: v.string(),
    size: v.string(),
    bedrooms: v.number(),
    propertyType: v.string(),
    category: v.string(),
    buildingType: v.string(),
    images: v.array(v.id("_storage")),
    features: v.array(v.string()),
    description: v.optional(v.string()),
    featured: v.boolean(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("properties", {
      ...args,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("properties"),
    title: v.optional(v.string()),
    price: v.optional(v.number()),
    location: v.optional(v.string()),
    address: v.optional(v.string()),
    size: v.optional(v.string()),
    bedrooms: v.optional(v.number()),
    propertyType: v.optional(v.string()),
    category: v.optional(v.string()),
    buildingType: v.optional(v.string()),
    images: v.optional(v.array(v.id("_storage"))),
    features: v.optional(v.array(v.string())),
    description: v.optional(v.string()),
    featured: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return { success: true };
  },
});

export const remove = mutation({
  args: { id: v.id("properties") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
    return { success: true };
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const allProperties = await ctx.db.query("properties").collect();
    
    const stats = {
      total: allProperties.length,
      forSale: allProperties.filter((p) => p.category === "For Sale").length,
      forRent: allProperties.filter((p) => p.category === "For Rent").length,
      land: allProperties.filter((p) => p.propertyType === "Land").length,
      carcass: allProperties.filter((p) => p.propertyType === "Carcass").length,
      preFinish: allProperties.filter((p) => p.propertyType === "Pre-Finish").length,
      finished: allProperties.filter((p) => p.propertyType === "Finished").length,
      featured: allProperties.filter((p) => p.featured).length,
    };

    return stats;
  },
});

