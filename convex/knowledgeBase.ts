import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all knowledge base assets for a company
export const getByCompany = query({
  args: { companySlug: v.string() },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.companySlug))
      .first();
    
    if (!company) {
      throw new Error(`Company "${args.companySlug}" not found`);
    }

    return await ctx.db
      .query("knowledgeBaseAssets")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .order("desc")
      .collect();
  },
});

// Get knowledge base assets by type for a company
export const getByCompanyAndType = query({
  args: { 
    companySlug: v.string(),
    type: v.union(
      v.literal("Article"),
      v.literal("Macro"), 
      v.literal("Token Point"),
      v.literal("SOP"),
      v.literal("Product Description Sheet"),
      v.literal("PDF Material")
    )
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.companySlug))
      .first();
    
    if (!company) {
      throw new Error(`Company "${args.companySlug}" not found`);
    }

    return await ctx.db
      .query("knowledgeBaseAssets")
      .withIndex("by_company_and_type", (q) => 
        q.eq("companyId", company._id).eq("type", args.type)
      )
      .collect();
  },
});

// Get single asset by ID
export const getById = query({
  args: { id: v.id("knowledgeBaseAssets") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Create new knowledge base asset
export const create = mutation({
  args: {
    companySlug: v.string(),
    name: v.string(),
    type: v.union(
      v.literal("Article"),
      v.literal("Macro"), 
      v.literal("Token Point"),
      v.literal("SOP"),
      v.literal("Product Description Sheet"),
      v.literal("PDF Material")
    ),
    content: v.optional(v.string()),
    isInternal: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { companySlug, ...assetData } = args;
    
    const company = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", companySlug))
      .first();
    
    if (!company) {
      throw new Error(`Company "${companySlug}" not found`);
    }

    const now = new Date().toISOString();
    const dateString = now.split('T')[0];
    
    return await ctx.db.insert("knowledgeBaseAssets", {
      ...assetData,
      companyId: company._id,
      content: assetData.content || '',
      dateCreated: dateString,
      lastModified: dateString,
      createdAt: now,
    });
  },
});

// Update knowledge base asset
export const update = mutation({
  args: {
    id: v.id("knowledgeBaseAssets"),
    name: v.optional(v.string()),
    type: v.optional(v.union(
      v.literal("Article"),
      v.literal("Macro"), 
      v.literal("Token Point"),
      v.literal("SOP"),
      v.literal("Product Description Sheet"),
      v.literal("PDF Material")
    )),
    content: v.optional(v.string()),
    isInternal: v.optional(v.boolean()),
    lastModified: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, lastModified, ...updates } = args;
    
    return await ctx.db.patch(id, {
      ...updates,
      lastModified: lastModified || new Date().toISOString().split('T')[0],
    });
  },
});

// Delete knowledge base asset
export const remove = mutation({
  args: { id: v.id("knowledgeBaseAssets") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Duplicate knowledge base asset
export const duplicate = mutation({
  args: { id: v.id("knowledgeBaseAssets") },
  handler: async (ctx, args) => {
    const original = await ctx.db.get(args.id);
    if (!original) {
      throw new Error("Asset not found");
    }

    const now = new Date().toISOString();
    const dateString = now.split('T')[0];

    // Create a copy with modified name and new timestamps
    return await ctx.db.insert("knowledgeBaseAssets", {
      companyId: original.companyId,
      name: `${original.name} (Copy)`,
      type: original.type,
      content: original.content,
      isInternal: original.isInternal,
      dateCreated: dateString,
      lastModified: dateString,
      createdAt: now,
    });
  },
});