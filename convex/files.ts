import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});

export const getUrls = query({
  args: { storageIds: v.array(v.id("_storage")) },
  handler: async (ctx, args) => {
    const urls = await Promise.all(
      args.storageIds.map((id) => ctx.storage.getUrl(id))
    );
    return urls.filter((url): url is string => url !== null);
  },
});

// Generate upload URL for direct file upload (recommended for large files)
export const generateUploadUrl = mutation({
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Legacy upload method (for small files only - has size limitations)
export const upload = mutation({
  args: {
    file: v.any(), // Uint8Array
    contentType: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Note: This method has size limitations. Use generateUploadUrl for large files.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const storageId = await (ctx.storage as any).store(
      new Blob([new Uint8Array(args.file)], { type: args.contentType })
    );
    return storageId;
  },
});
