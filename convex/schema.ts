import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Define the schema for our CX Flow Designer database
export default defineSchema({
  // Companies/Clients
  companies: defineTable({
    name: v.string(),
    slug: v.string(), // URL-friendly name (e.g., "hello-fresh", "warby-parker")
    createdAt: v.number(),
    lastModified: v.number(),
  }).index("by_slug", ["slug"]),

  // Users (for future auth integration)
  users: defineTable({
    name: v.string(),
    email: v.string(),
    companyId: v.id("companies"),
    role: v.union(v.literal("admin"), v.literal("user")),
    createdAt: v.number(),
    lastModified: v.number(),
  }).index("by_email", ["email"])
    .index("by_company", ["companyId"]),

  // Workstreams - main business entities
  workstreams: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("inbound"), 
      v.literal("outbound"), 
      v.literal("background"), 
      v.literal("blank")
    ),
    successDefinition: v.optional(v.string()),
    volumePerMonth: v.number(),
    successPercentage: v.number(),
    // Economics fields
    agentsAssigned: v.optional(v.number()),
    hoursPerAgentPerMonth: v.optional(v.number()),
    loadedCostPerAgent: v.optional(v.number()),
    automationPercentage: v.optional(v.number()),
    // Sub-entities as nested objects (following current structure)
    contactDrivers: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      containmentPercentage: v.number(),
      containmentVolume: v.number(),
      volumePerMonth: v.number(),
      avgHandleTime: v.number(),
      csat: v.number(),
      qaScore: v.number(),
      phoneVolume: v.number(),
      emailVolume: v.number(),
      chatVolume: v.number(),
      otherVolume: v.number(),
      flows: v.array(v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        type: v.union(v.literal("current"), v.literal("draft")),
        version: v.optional(v.string()),
        data: v.optional(v.object({
          nodes: v.array(v.any()),
          edges: v.array(v.any()),
        })),
        createdAt: v.string(),
        lastModified: v.string(),
      })),
      createdAt: v.string(),
      lastModified: v.string(),
    }))),
    campaigns: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      containmentPercentage: v.number(),
      containmentVolume: v.number(),
      volumePerMonth: v.number(),
      avgHandleTime: v.number(),
      csat: v.number(),
      qaScore: v.number(),
      phoneVolume: v.number(),
      emailVolume: v.number(),
      chatVolume: v.number(),
      otherVolume: v.number(),
      flows: v.array(v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        type: v.union(v.literal("current"), v.literal("draft")),
        version: v.optional(v.string()),
        data: v.optional(v.object({
          nodes: v.array(v.any()),
          edges: v.array(v.any()),
        })),
        createdAt: v.string(),
        lastModified: v.string(),
      })),
      createdAt: v.string(),
      lastModified: v.string(),
    }))),
    processes: v.optional(v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      containmentPercentage: v.number(),
      containmentVolume: v.number(),
      volumePerMonth: v.number(),
      avgHandleTime: v.number(),
      csat: v.number(),
      qaScore: v.number(),
      phoneVolume: v.number(),
      emailVolume: v.number(),
      chatVolume: v.number(),
      otherVolume: v.number(),
      flows: v.array(v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        type: v.union(v.literal("current"), v.literal("draft")),
        version: v.optional(v.string()),
        data: v.optional(v.object({
          nodes: v.array(v.any()),
          edges: v.array(v.any()),
        })),
        createdAt: v.string(),
        lastModified: v.string(),
      })),
      createdAt: v.string(),
      lastModified: v.string(),
    }))),
    // Flow entities for blank workstreams
    flows: v.array(v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      containmentPercentage: v.number(),
      containmentVolume: v.number(),
      volumePerMonth: v.number(),
      avgHandleTime: v.number(),
      csat: v.number(),
      qaScore: v.number(),
      phoneVolume: v.number(),
      emailVolume: v.number(),
      chatVolume: v.number(),
      otherVolume: v.number(),
      flows: v.array(v.object({
        id: v.string(),
        name: v.string(),
        description: v.string(),
        type: v.union(v.literal("current"), v.literal("draft")),
        version: v.optional(v.string()),
        data: v.optional(v.object({
          nodes: v.array(v.any()),
          edges: v.array(v.any()),
        })),
        createdAt: v.string(),
        lastModified: v.string(),
      })),
      createdAt: v.string(),
      lastModified: v.string(),
    })),
    // Metadata fields
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.string()),
    createdAt: v.string(),
    lastModified: v.string(),
  }).index("by_company", ["companyId"])
    .index("by_company_and_type", ["companyId", "type"]),

  // Knowledge Base Assets
  knowledgeBaseAssets: defineTable({
    companyId: v.id("companies"),
    name: v.string(),
    type: v.union(
      v.literal("Article"),
      v.literal("Macro"), 
      v.literal("Token Point"),
      v.literal("SOP"),
      v.literal("Product Description Sheet"),
      v.literal("PDF Material")
    ),
    content: v.string(),
    isInternal: v.boolean(),
    dateCreated: v.string(),
    lastModified: v.string(),
    createdAt: v.string(),
  }).index("by_company", ["companyId"])
    .index("by_company_and_type", ["companyId", "type"]),
});