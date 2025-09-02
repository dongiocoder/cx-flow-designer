import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Get all workstreams for a company
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
      .query("workstreams")
      .withIndex("by_company", (q) => q.eq("companyId", company._id))
      .collect();
  },
});

// Get workstreams by type for a company
export const getByCompanyAndType = query({
  args: { 
    companySlug: v.string(),
    type: v.union(v.literal("inbound"), v.literal("outbound"), v.literal("background"), v.literal("blank"))
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
      .query("workstreams")
      .withIndex("by_company_and_type", (q) => 
        q.eq("companyId", company._id).eq("type", args.type)
      )
      .collect();
  },
});

// Get single workstream by ID
export const getById = query({
  args: { workstreamId: v.id("workstreams") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workstreamId);
  },
});

// Create a new workstream
export const create = mutation({
  args: {
    companySlug: v.string(),
    name: v.string(),
    description: v.string(),
    type: v.union(v.literal("inbound"), v.literal("outbound"), v.literal("background"), v.literal("blank")),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const company = await ctx.db
      .query("companies")
      .withIndex("by_slug", (q) => q.eq("slug", args.companySlug))
      .first();
    
    if (!company) {
      throw new Error(`Company "${args.companySlug}" not found`);
    }

    const now = new Date().toISOString();
    return await ctx.db.insert("workstreams", {
      name: args.name,
      description: args.description,
      type: args.type,
      companyId: company._id,
      tags: args.tags || [],
      priority: args.priority || "medium",
      // Required fields with default values
      volumePerMonth: 0,
      successPercentage: 0,
      contactDrivers: [],
      campaigns: [],
      processes: [],
      flows: [],
      createdAt: now,
      lastModified: now.split('T')[0],
    });
  },
});

// Update workstream
export const update = mutation({
  args: {
    id: v.id("workstreams"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    type: v.optional(v.union(v.literal("inbound"), v.literal("outbound"), v.literal("background"), v.literal("blank"))),
    tags: v.optional(v.array(v.string())),
    priority: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const now = new Date().toISOString().split('T')[0];
    return await ctx.db.patch(id, {
      ...updates,
      lastModified: now,
    });
  },
});

// Delete workstream
export const remove = mutation({
  args: { id: v.id("workstreams") },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

// Add contact driver to workstream
export const addContactDriver = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    driver: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const now = new Date().toISOString();
    const newDriver = {
      ...args.driver,
      flows: [],
      createdAt: now,
      lastModified: now.split('T')[0],
    };

    const existingDrivers = workstream.contactDrivers || [];
    const updatedDrivers = [...existingDrivers, newDriver];

    return await ctx.db.patch(args.workstreamId, {
      contactDrivers: updatedDrivers,
      lastModified: now.split('T')[0],
    });
  },
});

// Update contact driver in workstream
export const updateContactDriver = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    driverId: v.string(),
    updates: v.object({
      name: v.optional(v.string()),
      description: v.optional(v.string()),
      containmentPercentage: v.optional(v.number()),
      containmentVolume: v.optional(v.number()),
      volumePerMonth: v.optional(v.number()),
      avgHandleTime: v.optional(v.number()),
      csat: v.optional(v.number()),
      qaScore: v.optional(v.number()),
      phoneVolume: v.optional(v.number()),
      emailVolume: v.optional(v.number()),
      chatVolume: v.optional(v.number()),
      otherVolume: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream || !workstream.contactDrivers) {
      throw new Error("Workstream or contact drivers not found");
    }

    const now = new Date().toISOString().split('T')[0];
    const updatedDrivers = workstream.contactDrivers.map(driver =>
      driver.id === args.driverId 
        ? { ...driver, ...args.updates, lastModified: now }
        : driver
    );

    return await ctx.db.patch(args.workstreamId, {
      contactDrivers: updatedDrivers,
      lastModified: now,
    });
  },
});

// Delete contact driver from workstream
export const removeContactDriver = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    driverId: v.string(),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream || !workstream.contactDrivers) {
      throw new Error("Workstream or contact drivers not found");
    }

    const updatedDrivers = workstream.contactDrivers.filter(
      driver => driver.id !== args.driverId
    );

    return await ctx.db.patch(args.workstreamId, {
      contactDrivers: updatedDrivers,
      lastModified: new Date().toISOString().split('T')[0],
    });
  },
});

// Add campaign to workstream
export const addCampaign = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    campaign: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const now = new Date().toISOString();
    const newCampaign = {
      ...args.campaign,
      flows: [],
      createdAt: now,
      lastModified: now.split('T')[0],
    };

    const existingCampaigns = workstream.campaigns || [];
    const updatedCampaigns = [...existingCampaigns, newCampaign];

    return await ctx.db.patch(args.workstreamId, {
      campaigns: updatedCampaigns,
      lastModified: now.split('T')[0],
    });
  },
});

// Add process to workstream
export const addProcess = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    process: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const now = new Date().toISOString();
    const newProcess = {
      ...args.process,
      flows: [],
      createdAt: now,
      lastModified: now.split('T')[0],
    };

    const existingProcesses = workstream.processes || [];
    const updatedProcesses = [...existingProcesses, newProcess];

    return await ctx.db.patch(args.workstreamId, {
      processes: updatedProcesses,
      lastModified: now.split('T')[0],
    });
  },
});

// Add flow entity to workstream
export const addFlowEntity = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    flowEntity: v.object({
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
    }),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const now = new Date().toISOString();
    const newFlowEntity = {
      ...args.flowEntity,
      flows: [],
      createdAt: now,
      lastModified: now.split('T')[0],
    };

    const existingFlows = workstream.flows || [];
    const updatedFlows = [...existingFlows, newFlowEntity];

    return await ctx.db.patch(args.workstreamId, {
      flows: updatedFlows,
      lastModified: now.split('T')[0],
    });
  },
});

// Add flow to sub-entity (contact driver, campaign, process, or flow entity)
export const addFlowToSubEntity = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    subEntityId: v.string(),
    subEntityType: v.union(v.literal("contactDrivers"), v.literal("campaigns"), v.literal("processes"), v.literal("flows")),
    flow: v.object({
      id: v.string(),
      name: v.string(),
      description: v.string(),
      type: v.union(v.literal("current"), v.literal("draft")),
      version: v.optional(v.string()),
      data: v.optional(v.object({
        nodes: v.array(v.any()),
        edges: v.array(v.any()),
      })),
    }),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const now = new Date().toISOString();
    const newFlow = {
      ...args.flow,
      createdAt: now,
      lastModified: now.split('T')[0],
    };

    const subEntities = workstream[args.subEntityType];
    if (!subEntities) {
      throw new Error(`Sub-entities of type ${args.subEntityType} not found`);
    }

    const updatedSubEntities = subEntities.map((entity: any) =>
      entity.id === args.subEntityId
        ? { 
            ...entity, 
            flows: [...entity.flows, newFlow],
            lastModified: now.split('T')[0]
          }
        : entity
    );

    return await ctx.db.patch(args.workstreamId, {
      [args.subEntityType]: updatedSubEntities,
      lastModified: now.split('T')[0],
    });
  },
});

// Update flow data (nodes and edges) in sub-entity
export const updateFlowData = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    subEntityType: v.union(v.literal("contactDrivers"), v.literal("campaigns"), v.literal("processes"), v.literal("flows")),
    flowId: v.string(),
    nodes: v.array(v.any()),
    edges: v.array(v.any()),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const subEntities = workstream[args.subEntityType];
    if (!subEntities) {
      throw new Error(`Sub-entities of type ${args.subEntityType} not found`);
    }

    const now = new Date().toISOString().split('T')[0];

    const updatedSubEntities = subEntities.map((entity: any) => ({
      ...entity,
      flows: entity.flows.map((flow: any) => 
        flow.id === args.flowId 
          ? {
              ...flow,
              data: { nodes: args.nodes, edges: args.edges },
              lastModified: now
            }
          : flow
      ),
      lastModified: now
    }));

    return await ctx.db.patch(args.workstreamId, {
      [args.subEntityType]: updatedSubEntities,
      lastModified: now,
    });
  },
});

// Set flow as current for sub-entity
export const setFlowAsCurrent = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    subEntityType: v.union(v.literal("contactDrivers"), v.literal("campaigns"), v.literal("processes"), v.literal("flows")),
    flowId: v.string(),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const subEntities = workstream[args.subEntityType];
    if (!subEntities) {
      throw new Error(`Sub-entities of type ${args.subEntityType} not found`);
    }

    const now = new Date().toISOString().split('T')[0];

    const updatedSubEntities = subEntities.map((entity: any) => {
      const hasTargetFlow = entity.flows.some((flow: any) => flow.id === args.flowId);
      
      if (!hasTargetFlow) {
        return entity;
      }

      return {
        ...entity,
        flows: entity.flows.map((flow: any) => ({
          ...flow,
          type: flow.id === args.flowId ? 'current' : (flow.type === 'current' ? 'draft' : flow.type),
          version: flow.id === args.flowId ? `v ${(Math.random() * 10).toFixed(1)}` : flow.version,
          lastModified: now
        })),
        lastModified: now
      };
    });

    return await ctx.db.patch(args.workstreamId, {
      [args.subEntityType]: updatedSubEntities,
      lastModified: now,
    });
  },
});

// Delete flow from sub-entity
export const removeFlowFromSubEntity = mutation({
  args: {
    workstreamId: v.id("workstreams"),
    subEntityType: v.union(v.literal("contactDrivers"), v.literal("campaigns"), v.literal("processes"), v.literal("flows")),
    flowId: v.string(),
  },
  handler: async (ctx, args) => {
    const workstream = await ctx.db.get(args.workstreamId);
    if (!workstream) {
      throw new Error("Workstream not found");
    }

    const subEntities = workstream[args.subEntityType];
    if (!subEntities) {
      throw new Error(`Sub-entities of type ${args.subEntityType} not found`);
    }

    const now = new Date().toISOString().split('T')[0];

    const updatedSubEntities = subEntities.map((entity: any) => ({
      ...entity,
      flows: entity.flows.filter((flow: any) => flow.id !== args.flowId),
      lastModified: now
    }));

    return await ctx.db.patch(args.workstreamId, {
      [args.subEntityType]: updatedSubEntities,
      lastModified: now,
    });
  },
});