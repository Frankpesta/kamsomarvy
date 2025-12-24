import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  properties: defineTable({
    title: v.string(),
    price: v.number(),
    location: v.string(),
    address: v.string(),
    size: v.string(), // e.g., "350 sqm"
    bedrooms: v.number(),
    propertyType: v.string(), // "Land", "Carcass", "Pre-Finish", "Finished"
    category: v.string(), // "For Sale", "For Rent"
    buildingType: v.string(), // "Terrace", "Duplex", "Penthouse", etc.
    images: v.array(v.id("_storage")), // Array of storage IDs
    features: v.array(v.string()), // Array of feature strings
    description: v.optional(v.string()),
    featured: v.boolean(), // For Hot Sales section
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_category", ["category"])
    .index("by_property_type", ["propertyType"])
    .index("by_featured", ["featured"])
    .index("by_created", ["createdAt"]),

  representatives: defineTable({
    name: v.string(),
    role: v.string(),
    phone: v.string(),
    photo: v.optional(v.id("_storage")),
    email: v.optional(v.string()),
    order: v.number(), // For ordering display
    createdAt: v.number(),
  })
    .index("by_order", ["order"]),

  admins: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.string(), // "super_admin" or "admin"
    passwordHash: v.string(), // SHA-256 hash of password
    createdAt: v.number(),
    lastLogin: v.optional(v.number()),
  })
    .index("by_email", ["email"]),

  siteContent: defineTable({
    key: v.string(), // e.g., "hero_title", "hero_subtitle", "hot_sales_text"
    value: v.string(),
    updatedAt: v.number(),
    updatedBy: v.id("admins"),
  })
    .index("by_key", ["key"]),

  passwordResetTokens: defineTable({
    adminId: v.id("admins"),
    token: v.string(),
    expiresAt: v.number(),
    used: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_admin", ["adminId"]),

  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    message: v.string(),
    read: v.boolean(),
    replied: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_read", ["read"])
    .index("by_created", ["createdAt"]),

  newsletterSubscriptions: defineTable({
    email: v.string(),
    subscribed: v.boolean(),
    createdAt: v.number(),
    unsubscribedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_subscribed", ["subscribed"])
    .index("by_created", ["createdAt"]),

  sessions: defineTable({
    token: v.string(),
    adminId: v.id("admins"),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_admin", ["adminId"]),
});

