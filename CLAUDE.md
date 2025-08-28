# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Detailed Docs

For detailed info and instructions, check the architecture.md file

## Project Overview

This is a Next.js 15 React application called "CX Flow Designer" - a customer experience workstream management tool with flow visualization capabilities. The application features two main modes:
1. **Workstream Management Interface** - table-based management of workstreams and their sub-entities
2. **Flow Editor** - full-canvas React Flow editor for designing workflow diagrams

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Architecture & Key Concepts

### Core Data Structure
The application centers around **Workstreams** which contain different types of sub-entities based on their type:
- **Inbound workstreams** → Contact Drivers (customer support scenarios)
- **Outbound workstreams** → Campaigns (marketing/outreach)
- **Background workstreams** → Processes (back-office operations)
- **Blank workstreams** → Flow Entities (generic workflows)

Each sub-entity can contain multiple **Flows** (React Flow diagrams) with states: `current` or `draft`.

### Data Flow & State Management
- **Custom hooks pattern**: `useWorkstreams`, `useKnowledgeBaseAssets`, `useContactDrivers`
- **Storage system**: Hybrid localStorage + optional GitHub Gist sync (`src/lib/storage.ts`)
- **Persistent state**: All UI state (selected workstream, current section, etc.) persists to localStorage

### Component Architecture
- **Single-page application**: All modes swap within the same page frame
- **Modal/drawer overlays**: No page navigation, everything uses overlays
- **Section-based routing**: Uses `currentSection` state instead of URL routing

### Key Components
- `src/app/page.tsx` - Main application orchestrator with mode switching
- `src/components/WorkstreamDetailPage.tsx` - Sub-entity management interface
- `src/components/FlowEditor.tsx` - React Flow canvas editor
- `src/components/Home.tsx` - Dashboard with metrics cards
- `src/hooks/useWorkstreams.ts` - Primary data management hook

### UI Architecture
- **Global header**: Logo + client selector + user avatar (never changes)
- **Mode switching**: Table view ↔ Flow Editor ↔ Knowledge Base Editor
- **Context preservation**: Drawer states and selections persist across mode switches
- **Responsive design**: Uses CSS Grid with Tailwind classes

### Technology Stack
- **Framework**: Next.js 15 with App Router
- **UI**: Tailwind CSS + Radix UI components
- **Flow Editor**: @xyflow/react (React Flow)
- **Icons**: Lucide React + Simple Icons
- **State**: React hooks + localStorage persistence
- **TypeScript**: Strict mode enabled

## Code Patterns & Conventions

### Component Structure
Components follow a pattern of:
1. Interface definitions
2. State management with custom hooks
3. Event handlers
4. useEffect for persistence
5. Conditional rendering based on mode/state

### Data Persistence
All business data syncs to GitHub Gist when configured with environment variables:
- `NEXT_PUBLIC_GITHUB_TOKEN` - GitHub personal access token with 'gist' scope
- `NEXT_PUBLIC_GIST_ID` - Target GitHub Gist ID for data storage

When not configured, the app runs in "Local Mode" with data stored in memory only.

### Styling Approach
- Tailwind utility classes for all styling
- Radix UI for complex components (dropdowns, dialogs, etc.)
- CSS Grid for table layouts with explicit `gridTemplateColumns`
- Consistent spacing and color schemes

## Important Implementation Notes

### Flow Editor Integration
- Flows are embedded within sub-entities, not standalone
- Flow data structure: `{ nodes: Node[], edges: Edge[] }` from React Flow
- Canvas state persists to the parent sub-entity structure

### Multi-Entity CRUD Operations
The `useWorkstreams` hook provides CRUD operations for all sub-entity types with a consistent pattern:
- `add[EntityType]ToWorkstream`
- `update[EntityType]InWorkstream`  
- `delete[EntityType]FromWorkstream`

### Storage Strategy
- **GitHub Gist primary storage** for all business data (workstreams, assets, flows)
- **localStorage for UI state only** (current section, drawer states, selections)
- **Graceful degradation** to local-only mode when GitHub not configured
- **Clear storage status indicators** for user awareness

## Development Guidelines

When working with this codebase:
- Always use the existing hooks for data operations
- Maintain the single-page application pattern
- Preserve existing localStorage keys and data structures
- Follow the modal/drawer overlay pattern for UI interactions
- Use TypeScript interfaces consistently for type safety
- Test both localStorage and GitHub Gist storage scenarios