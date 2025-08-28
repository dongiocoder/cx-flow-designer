# CX Flow Designer - Architecture Documentation

## Overview

CX Flow Designer is a Next.js 15 React application built for customer experience workstream management with integrated flow visualization capabilities. The application serves as a comprehensive tool for designing, managing, and optimizing customer journey workflows across different business scenarios.

## Project Structure

```
cx-flow-designer/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx         # Root layout with global providers
│   │   ├── page.tsx           # Main application orchestrator
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components (Radix UI based)
│   │   ├── FlowEditor.tsx    # React Flow canvas editor
│   │   ├── FlowNodes.tsx     # Custom node types for flows
│   │   ├── WorkstreamDetailPage.tsx  # Sub-entity management
│   │   ├── MainNavigation.tsx # Left sidebar navigation
│   │   ├── Home.tsx          # Dashboard with metrics
│   │   └── ...               # Other specialized components
│   ├── contexts/             # React contexts
│   │   └── ClientContext.tsx # Multi-client state management
│   ├── hooks/                # Custom React hooks
│   │   ├── useWorkstreams.ts # Primary data management
│   │   ├── useKnowledgeBaseAssets.ts
│   │   └── useContactDrivers.ts
│   └── lib/                  # Utilities and services
│       ├── storage.ts        # GitHub Repository integration
│       └── utils.ts          # Helper utilities
├── public/                   # Static assets
├── PRDs/                    # Product requirement documents
├── CLAUDE.md               # Development guidelines
└── package.json            # Dependencies and scripts
```

## Core Architecture Principles

### 1. Single-Page Application (SPA)
- All functionality contained within a single page (`src/app/page.tsx`)
- Mode switching between Table View, Flow Editor, and Knowledge Base Editor
- No page navigation - uses modal/drawer overlays and state management

### 2. Component-Based Architecture
- Modular React components with clear separation of concerns
- Custom hooks for business logic and state management
- UI components built with Radix UI and Tailwind CSS

### 3. Data-Driven Design
- Hierarchical data structure: Workstreams → Sub-entities → Flows
- Type-safe TypeScript interfaces throughout
- Persistent state management with localStorage and GitHub sync

## Data Model

### Core Entities

#### Workstreams
The primary organizing unit representing different business workflows:

```typescript
interface Workstream {
  id: string;
  name: string;
  description: string;
  type: 'inbound' | 'outbound' | 'background' | 'blank';
  successDefinition?: string;
  volumePerMonth: number;
  successPercentage: number;
  agentsAssigned?: number;
  automationPercentage?: number;
  // Sub-entities based on workstream type
  contactDrivers?: ContactDriver[]; // for inbound
  campaigns?: Campaign[];           // for outbound  
  processes?: Process[];           // for background
  flows: FlowEntity[];            // for blank workstreams
}
```

#### Sub-Entities
Each workstream type contains specific sub-entity types:

- **Inbound Workstreams** → **Contact Drivers**: Customer support scenarios
- **Outbound Workstreams** → **Campaigns**: Marketing/outreach initiatives  
- **Background Workstreams** → **Processes**: Back-office operations
- **Blank Workstreams** → **Flow Entities**: Generic workflow containers

All sub-entities share common properties:
```typescript
interface BaseSubEntity {
  id: string;
  name: string;
  description: string;
  containmentPercentage: number;
  volumePerMonth: number;
  avgHandleTime: number;
  csat: number;
  qaScore: number;
  flows: Flow[];
}
```

#### Flows
Individual workflow diagrams within sub-entities:

```typescript
interface Flow {
  id: string;
  name: string;
  description: string;
  type: 'current' | 'draft';
  version?: string;
  data?: FlowData; // React Flow nodes and edges
}
```

### Knowledge Base Assets
Separate content management system:

```typescript
interface KnowledgeBaseAsset {
  id: string;
  name: string;
  type: 'Article' | 'Macro' | 'SOP' | 'Product Description Sheet' | etc.;
  content: string;
  isInternal: boolean;
}
```

## State Management

### Multi-Client Architecture
- **ClientContext**: Manages multiple client environments
- Client-specific data isolation
- Seamless switching between client contexts

### Custom Hooks Pattern
Primary business logic contained in custom hooks:

- **`useWorkstreams`**: Core workstream and sub-entity CRUD operations
- **`useKnowledgeBaseAssets`**: Knowledge base content management
- **`useContactDrivers`**: Legacy contact driver management

### State Persistence
- **localStorage**: UI state (current section, drawer states, selections)
- **GitHub Repository**: Business data (workstreams, flows, knowledge base)
- **Graceful degradation**: Local-only mode when GitHub not configured

## Storage Architecture

### Hybrid Storage System
The application uses a sophisticated storage system that combines local and cloud storage:

```typescript
// Storage priority:
// 1. GitHub Repository (primary for business data)
// 2. localStorage (UI state only)
// 3. Memory cache (performance optimization)
```

### GitHub Integration
- **Repository Structure**: Client-based file organization
- **API Integration**: Direct GitHub Contents API usage
- **Rate Limiting**: Built-in queuing and retry mechanisms
- **Conflict Resolution**: SHA-based update detection

### Files Per Client
```
CLIENT_NAME/
├── workstreams.json
├── kb-assets.json
└── contact-drivers.json
```

## Component Architecture

### Application Layout
```
RootLayout (layout.tsx)
├── TooltipProvider
├── ClientProvider
├── MainNavigation (left sidebar)
└── Page Content Area
    ├── Global Header (fixed)
    ├── Status Banners (rate limits, errors)
    └── Mode-Switched Content
        ├── Table Mode (various sections)
        ├── Flow Editor Mode  
        └── Knowledge Base Editor Mode
```

### Key Components

#### FlowEditor
- **React Flow Integration**: Full-featured diagram editor
- **Custom Node Types**: Specialized workflow step nodes
- **Auto-save**: Automatic persistence with debouncing
- **Toolbar**: Node creation, zoom controls, minimap

#### WorkstreamDetailPage  
- **Sub-entity Management**: CRUD operations for different entity types
- **Metrics View**: Performance data visualization
- **Flow Management**: Create, edit, duplicate flows within entities

#### Universal Components
- **UniversalSubEntityDrawer**: Handles all sub-entity types uniformly
- **SubEntityDialog**: Create/edit modal for all entity types
- **MainNavigation**: Persistent left sidebar with section switching

## Flow Editor Architecture

### React Flow Integration
- **@xyflow/react v12**: Latest React Flow version
- **Custom Node Types**: PillNode, StepNode, RouterNode
- **Custom Edges**: Styled connection lines
- **Real-time Auto-save**: Changes persist automatically

### Node Categories
- **Self-Service**: Website pages, chatbots, knowledge base
- **Contact Channels**: Phone, email, chat, messaging
- **Agent Actions**: Greetings, verification, diagnosis
- **Outcomes**: Resolution, escalation, transfer

### Canvas Features
- **Drag & Drop**: Node creation from toolbar
- **Visual Editing**: Inline editing of node properties  
- **State Management**: Current vs. draft flow versions
- **Export/Import**: Full flow data serialization

## Technology Stack

### Core Framework
- **Next.js 15**: App Router, Server Components, Turbopack
- **React 19**: Latest features and optimizations
- **TypeScript 5**: Strict type checking enabled

### UI Framework
- **Tailwind CSS 4**: Utility-first styling
- **Radix UI**: Headless component library
- **Lucide React**: Icon system
- **Simple Icons**: Brand/company icons

### Specialized Libraries
- **@xyflow/react**: Flow diagram editor
- **class-variance-authority**: Component variant management
- **clsx + tailwind-merge**: Conditional styling

### Development Tools
- **ESLint 9**: Code linting with Next.js config
- **TypeScript**: Full type safety
- **PostCSS**: CSS processing

## Development Patterns

### Code Organization
```typescript
// Component structure pattern:
interface ComponentProps { ... }

export function Component({ ...props }: ComponentProps) {
  // 1. State hooks
  // 2. Effect hooks  
  // 3. Event handlers
  // 4. Derived values
  // 5. JSX render
}
```

### Data Flow
```
User Action → Event Handler → Hook Function → State Update → Storage Sync → UI Update
```

### Error Handling
- **Graceful Degradation**: Local mode when GitHub unavailable
- **Rate Limit Management**: Automatic retry with backoff
- **User Feedback**: Status indicators and error messages

### Performance Optimization
- **Request Queuing**: Prevents API rate limit violations
- **Data Caching**: In-memory cache with invalidation
- **Debounced Saves**: Reduces unnecessary API calls
- **Optimistic Updates**: Immediate UI feedback

## Deployment Architecture

### Environment Configuration
- **NEXT_PUBLIC_GITHUB_TOKEN**: GitHub Personal Access Token
- **NEXT_PUBLIC_GITHUB_REPO**: Target repository (format: "owner/repo")

### Build Process
```bash
npm run dev    # Development with Turbopack
npm run build  # Production build
npm run start  # Production server
npm run lint   # Code quality checks
```

### Production Considerations
- **Static Generation**: Pages pre-built at build time
- **API Routes**: None currently (client-side GitHub API)
- **Asset Optimization**: Automatic image/font optimization
- **Bundle Analysis**: Built-in Next.js analyzer

## Security Considerations

### GitHub Integration
- **Token Scope**: Minimal required permissions (repo access)
- **Client-Side API**: Direct browser-to-GitHub communication
- **Rate Limiting**: Built-in protection against abuse

### Data Privacy
- **Client Isolation**: Complete data separation per client
- **Local Fallback**: Works without cloud connectivity
- **No Server Storage**: All data in GitHub or browser

## Extensibility

### Adding New Sub-Entity Types
1. Define TypeScript interface extending `BaseSubEntity`
2. Add to `Workstream` type union
3. Update CRUD operations in `useWorkstreams`
4. Add UI components for management

### Flow Node Extensions
1. Define node type in `FlowNodes.tsx`
2. Add to node type registry
3. Create custom rendering component
4. Update toolbar for node creation

### Storage Backends
The storage service is abstracted to support multiple backends:
- Current: GitHub Repository API
- Potential: Database, S3, other Git providers

This architecture provides a solid foundation for a scalable, maintainable customer experience management platform with powerful workflow design capabilities.