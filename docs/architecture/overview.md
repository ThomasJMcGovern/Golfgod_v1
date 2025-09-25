# System Architecture Overview

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
├───────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Next.js    │  │    React     │  │   Tailwind   │      │
│  │  App Router  │  │  Components  │  │     CSS      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │              Convex Client Provider               │       │
│  │         (Real-time subscriptions, Auth)           │       │
│  └──────────────────────────────────────────────────┘       │
│                                                               │
└───────────────────────────┬───────────────────────────────────┘
                           │
                           │ WebSocket / HTTP
                           │
┌───────────────────────────▼───────────────────────────────────┐
│                        BACKEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────────────────────────────────┐        │
│  │                  Convex Platform                   │        │
│  │                                                    │        │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │        │
│  │  │  Functions  │  │  Database  │  │    Auth    │ │        │
│  │  │  (Queries,  │  │  (NoSQL)   │  │  (Users,   │ │        │
│  │  │  Mutations) │  │            │  │  Sessions) │ │        │
│  │  └────────────┘  └────────────┘  └────────────┘ │        │
│  │                                                    │        │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐ │        │
│  │  │  Storage   │  │  Cron Jobs │  │  Webhooks  │ │        │
│  │  │  (Files)   │  │            │  │            │ │        │
│  │  └────────────┘  └────────────┘  └────────────┘ │        │
│  └──────────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 15.2.3**: React framework with App Router
- **React 19**: UI library with hooks and concurrent features
- **TypeScript**: Type-safe development
- **Tailwind CSS 3.4**: Utility-first CSS framework
- **Shadcn/ui**: Component library built on Radix UI
- **React Select**: Advanced dropdown component

### Backend
- **Convex**: Real-time serverless backend
- **Convex Auth**: Authentication system
- **NoSQL Database**: Document-based storage
- **WebSocket**: Real-time data synchronization

### Development Tools
- **PapaParse**: CSV parsing
- **Lucide React**: Icon library
- **ESLint**: Code linting
- **Prettier**: Code formatting

## Core Architecture Principles

### 1. Real-time First
All data updates propagate instantly to connected clients via Convex's reactive queries.

### 2. Type Safety
End-to-end type safety from database schema to React components.

### 3. Serverless
No server management - automatic scaling with Convex platform.

### 4. Component-Based
Modular, reusable React components with clear separation of concerns.

## Data Flow

### Query Flow (Read)
```
User Action → React Component → useQuery Hook → Convex Client
    → WebSocket → Convex Function → Database → Response
    → Real-time Update → Component Re-render
```

### Mutation Flow (Write)
```
User Action → React Component → useMutation Hook → Convex Client
    → HTTP/WebSocket → Convex Function → Validation
    → Database Write → Broadcast Update → All Subscribed Clients
```

### Authentication Flow
```
Sign In → Convex Auth → Create Session → Store Token
    → Attach to Requests → Validate in Functions → Access Control
```

## Key Design Decisions

### 1. Convex as Backend
**Why**: Real-time capabilities, serverless scaling, integrated auth
**Alternative considered**: Supabase, Firebase
**Trade-off**: Vendor lock-in vs development speed

### 2. Next.js App Router
**Why**: Modern React patterns, better performance, built-in optimizations
**Alternative considered**: Pages Router, Remix
**Trade-off**: Learning curve vs future-proof architecture

### 3. Shadcn/ui Components
**Why**: Customizable, accessible, well-maintained
**Alternative considered**: Material-UI, Ant Design
**Trade-off**: More setup vs complete control

### 4. TypeScript Throughout
**Why**: Type safety, better IDE support, fewer runtime errors
**Alternative considered**: JavaScript
**Trade-off**: Initial complexity vs long-term maintainability

## Security Architecture

### Authentication
- Password-based authentication via Convex Auth
- Session tokens with automatic refresh
- Secure cookie storage

### Authorization
- Role-based access control (User, Admin)
- Function-level permissions
- Row-level security for user data

### Data Protection
- HTTPS everywhere
- Input validation and sanitization
- SQL injection protection (NoSQL)
- XSS prevention via React

## Performance Optimizations

### Frontend
- Server-side rendering for initial page load
- Client-side navigation with prefetching
- Image optimization with Next.js Image
- Code splitting and lazy loading
- React component memoization

### Backend
- Indexed database queries
- Efficient pagination
- Batch processing for imports
- Caching strategies
- Query result deduplication

### Network
- WebSocket connection pooling
- Request batching
- Compression
- CDN for static assets

## Scalability Considerations

### Horizontal Scaling
- Convex automatically scales functions
- Database sharding handled by platform
- No server management required

### Data Growth
- Indexed queries for large datasets
- Pagination for list views
- Archival strategies for old data
- Efficient data structures

### User Growth
- Connection pooling
- Rate limiting on mutations
- Caching for popular queries
- CDN for global distribution

## Monitoring and Observability

### Application Monitoring
- Convex dashboard for real-time metrics
- Function execution logs
- Database query performance
- Error tracking and alerts

### User Analytics
- Page view tracking
- User action events
- Performance metrics
- Conversion funnels

## Deployment Architecture

### Development
```
Local Next.js → Local Convex Dev → Hot Reload
```

### Staging
```
Vercel Preview → Convex Dev Instance → Test Data
```

### Production
```
Vercel Production → Convex Production → Live Data
    → CloudFlare CDN → Global Users
```

## Database Design Philosophy

### Denormalization
Player names stored in tournament results for query performance.

### Indexing Strategy
- Primary indexes on IDs
- Secondary indexes on common queries
- Full-text search on names

### Data Consistency
- Atomic transactions
- Referential integrity via application logic
- Cascade deletes handled in functions

## API Design

### RESTful Principles
- Resource-based naming
- Predictable patterns
- Clear separation of concerns

### Query vs Mutation
- Queries: Read-only, cached, reactive
- Mutations: Write operations, validated, atomic

### Error Handling
- Consistent error format
- Meaningful error messages
- Proper HTTP status codes

## Testing Strategy

### Unit Tests
- Component testing with React Testing Library
- Function testing with Convex test utilities
- Utility function tests with Jest

### Integration Tests
- API endpoint testing
- Database operation testing
- Authentication flow testing

### E2E Tests
- User journey testing with Playwright
- Cross-browser compatibility
- Performance testing

## Future Architecture Considerations

### Microservices
Consider splitting into services:
- Player Service
- Tournament Service
- Statistics Service
- User Service

### Event-Driven
Implement event sourcing for:
- Audit logs
- Real-time notifications
- Analytics pipeline

### Machine Learning
Potential ML features:
- Player performance prediction
- Tournament outcome modeling
- Personalized recommendations

### Mobile Apps
Native app considerations:
- React Native for code reuse
- Offline-first architecture
- Push notifications

## Architecture Decisions Record (ADR)

### ADR-001: Use Convex for Backend
**Date**: 2024-01
**Status**: Accepted
**Context**: Need real-time, scalable backend
**Decision**: Use Convex platform
**Consequences**: Fast development, vendor lock-in

### ADR-002: Adopt Next.js App Router
**Date**: 2024-01
**Status**: Accepted
**Context**: Modern React patterns needed
**Decision**: Use App Router over Pages
**Consequences**: Better performance, learning curve

### ADR-003: Implement Shadcn/ui
**Date**: 2024-01
**Status**: Accepted
**Context**: Need customizable component library
**Decision**: Use Shadcn/ui with Radix
**Consequences**: Full control, more setup work