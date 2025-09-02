#!/usr/bin/env node

/**
 * Migration script to transfer data from GitHub repository to Convex
 * Run with: node scripts/migrate-to-convex.js
 */

const fs = require('fs');
const path = require('path');
const { ConvexHttpClient } = require("convex/browser");

// Load environment variables from .env.local
function loadEnvFile(filePath) {
  try {
    const envFile = fs.readFileSync(filePath, 'utf8');
    const envVars = {};
    
    envFile.split('\n').forEach(line => {
      line = line.trim();
      if (line && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=').trim();
          // Remove quotes if present
          value = value.replace(/^["']|["']$/g, '');
          envVars[key] = value;
        }
      }
    });
    
    return envVars;
  } catch (error) {
    console.warn(`Could not load ${filePath}: ${error.message}`);
    return {};
  }
}

// Load environment variables from .env.local
const envVars = loadEnvFile(path.join(__dirname, '../.env.local'));

// Configuration from environment
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || envVars.NEXT_PUBLIC_GITHUB_TOKEN;
const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO || envVars.NEXT_PUBLIC_GITHUB_REPO;
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || envVars.NEXT_PUBLIC_CONVEX_URL;

if (!GITHUB_TOKEN || !GITHUB_REPO || !CONVEX_URL) {
  console.error('❌ Missing required environment variables:');
  console.error('   NEXT_PUBLIC_GITHUB_TOKEN');
  console.error('   NEXT_PUBLIC_GITHUB_REPO');  
  console.error('   NEXT_PUBLIC_CONVEX_URL');
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

// GitHub API helper
async function getFileFromGitHub(filePath) {
  const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${filePath}`, {
    headers: {
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    }
  });

  if (!response.ok) {
    if (response.status === 404) {
      return null; // File doesn't exist
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return JSON.parse(atob(data.content));
}

// Migration functions
async function migrateClient(clientName) {
  console.log(`\n🔄 Migrating client: ${clientName}`);
  
  // Create slug from client name
  const slug = clientName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  
  // 1. Ensure company exists in Convex
  console.log('   📝 Creating company...');
  let companyId;
  try {
    companyId = await convex.mutation("companies:create", {
      name: clientName,
      slug: slug,
    });
    console.log(`   ✅ Created company: ${clientName} (${slug})`);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log(`   ℹ️  Company already exists: ${clientName}`);
      const company = await convex.query("companies:getBySlug", { slug });
      companyId = company._id;
    } else {
      throw error;
    }
  }

  // 2. Migrate workstreams
  console.log('   📊 Migrating workstreams...');
  try {
    const workstreams = await getFileFromGitHub(`${clientName}/workstreams.json`);
    if (workstreams && workstreams.length > 0) {
      for (const workstream of workstreams) {
        await convex.mutation("workstreams:create", {
          companySlug: slug,
          name: workstream.name,
          description: workstream.description,
          type: workstream.type || 'blank',
          successDefinition: workstream.successDefinition,
          volumePerMonth: workstream.volumePerMonth || 0,
          successPercentage: workstream.successPercentage || 0,
          agentsAssigned: workstream.agentsAssigned,
          hoursPerAgentPerMonth: workstream.hoursPerAgentPerMonth,
          loadedCostPerAgent: workstream.loadedCostPerAgent,
          automationPercentage: workstream.automationPercentage,
        });
        
        // Note: Sub-entities (contactDrivers, campaigns, processes) will need to be 
        // migrated separately as they're nested in the schema
        console.log(`     ✅ Migrated workstream: ${workstream.name}`);
      }
    }
  } catch (error) {
    console.log(`     ⚠️  No workstreams found or error: ${error.message}`);
  }

  // 3. Migrate knowledge base assets  
  console.log('   📚 Migrating knowledge base assets...');
  try {
    const assets = await getFileFromGitHub(`${clientName}/kb-assets.json`);
    if (assets && assets.length > 0) {
      for (const asset of assets) {
        await convex.mutation("knowledgeBase:create", {
          companySlug: slug,
          name: asset.name,
          type: asset.type,
          content: asset.content || '',
          isInternal: asset.isInternal,
        });
        console.log(`     ✅ Migrated asset: ${asset.name}`);
      }
    }
  } catch (error) {
    console.log(`     ⚠️  No knowledge base assets found or error: ${error.message}`);
  }

  // 4. Migrate contact drivers (standalone - these seem redundant now)
  console.log('   📞 Migrating standalone contact drivers...');
  try {
    const contactDrivers = await getFileFromGitHub(`${clientName}/contact-drivers.json`);
    if (contactDrivers && contactDrivers.length > 0) {
      console.log(`     ℹ️  Found ${contactDrivers.length} standalone contact drivers`);
      console.log(`     ⚠️  These are redundant with workstream contact drivers - skipping migration`);
      console.log(`     💡 Contact drivers should be managed through workstreams in Convex`);
    }
  } catch (error) {
    console.log(`     ⚠️  No contact drivers found or error: ${error.message}`);
  }

  console.log(`   ✅ Completed migration for: ${clientName}`);
}

// Main migration
async function main() {
  console.log('🚀 Starting GitHub to Convex migration...\n');
  
  // Get list of clients from GitHub
  const clients = ['HelloFresh', 'Warby Parker']; // Add your clients here
  
  for (const client of clients) {
    try {
      await migrateClient(client);
    } catch (error) {
      console.error(`❌ Failed to migrate ${client}:`, error.message);
    }
  }
  
  console.log('\n🎉 Migration completed!');
  console.log('\n📋 Next steps:');
  console.log('   1. Test the app at http://localhost:3000');  
  console.log('   2. Verify data appears correctly in Convex dashboard');
  console.log('   3. Update any remaining components to use Convex hooks');
  console.log('   4. Remove old GitHub storage code when satisfied');
}

// Run migration
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { migrateClient };