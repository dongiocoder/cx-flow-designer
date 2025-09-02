import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all companies
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("companies").order("desc").collect();
  },
});

// Get company by slug
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// Create a new company
export const create = mutation({
  args: { 
    name: v.string(),
    slug: v.string()
  },
  handler: async (ctx, args) => {
    const existingCompany = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existingCompany) {
      throw new Error(`Company with slug "${args.slug}" already exists`);
    }

    const now = Date.now();
    
    return await ctx.db.insert("companies", {
      name: args.name,
      slug: args.slug,
      createdAt: now,
      lastModified: now,
    });
  },
});

// Update company
export const update = mutation({
  args: {
    id: v.id("companies"),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    
    return await ctx.db.patch(id, {
      ...updates,
      lastModified: Date.now(),
    });
  },
});

// Delete company (also deletes all associated data)
export const remove = mutation({
  args: { id: v.id("companies") },
  handler: async (ctx, args) => {
    // Delete all workstreams for this company
    const workstreams = await ctx.db
      .query("workstreams")
      .withIndex("by_company", (q) => q.eq("companyId", args.id))
      .collect();
    
    for (const workstream of workstreams) {
      await ctx.db.delete(workstream._id);
    }

    // Delete all knowledge base assets for this company
    const assets = await ctx.db
      .query("knowledgeBaseAssets")
      .withIndex("by_company", (q) => q.eq("companyId", args.id))
      .collect();
    
    for (const asset of assets) {
      await ctx.db.delete(asset._id);
    }

    // Delete all users for this company
    const users = await ctx.db
      .query("users")
      .withIndex("by_company", (q) => q.eq("companyId", args.id))
      .collect();
    
    for (const user of users) {
      await ctx.db.delete(user._id);
    }

    // Finally, delete the company
    return await ctx.db.delete(args.id);
  },
});

// Utility function to create slug from name
export const createSlugFromName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    // Convert name to URL-friendly slug
    const baseSlug = args.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Check if slug already exists and add number if needed
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await ctx.db
        .query("companies")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      
      if (!existing) {
        break;
      }
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    return slug;
  },
});