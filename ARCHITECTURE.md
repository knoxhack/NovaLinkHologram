# NovaLink Architecture Document

This document details the architectural decisions, component organization, and design patterns used in the NovaLink platform.

## System Overview

NovaLink is built as a full-stack application with clear separation between the frontend, backend, and database layers. It follows modern web application patterns with most business logic residing in the frontend to create a responsive user experience.

## Core Components

### 1. Frontend Architecture

#### Technology Stack
- **React.js**: Core UI library
- **TypeScript**: For type safety
- **TanStack Query**: For data fetching, caching, and state management
- **Tailwind CSS**: For styling with custom design system
- **shadcn/ui**: For UI components
- **Wouter**: For lightweight client-side routing

#### Directory Structure

```
client/
├── src/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions and services
│   ├── models/             # 3D models and animations
│   ├── pages/              # Page components
│   ├── App.tsx             # Main application component
│   ├── index.css           # Global styles
│   └── main.tsx            # Application entry point
```

#### Key Design Patterns

1. **Custom Hooks Pattern**
   - `useHologram`: Manages hologram state and animations
   - `useVoiceCommands`: Handles voice recognition
   - `useAgents`: Fetches and manages agent data
   - `useAuth`: Manages authentication state

2. **Component Composition**
   - Core components are composed of smaller, focused components
   - Shared UI elements are in the `components/ui` directory
   - Page-specific components are co-located with their pages

3. **State Management**
   - Local component state for UI-specific state
   - TanStack Query for server state
   - WebSocket for real-time updates

### 2. Backend Architecture

#### Technology Stack
- **Express.js**: Web server and API
- **TypeScript**: For type safety
- **Drizzle ORM**: For database access
- **WebSocket**: For real-time communication
- **Passport.js**: For authentication

#### Directory Structure

```
server/
├── services/              # Business logic services
├── db.ts                  # Database connection setup
├── index.ts               # Server entry point
├── replitAuth.ts          # Authentication configuration
├── routes.ts              # API route definitions
├── storage.ts             # Data access layer
└── vite.ts                # Development server configuration
```

#### Key Design Patterns

1. **Service Layer Pattern**
   - Separate modules for different business domains
   - Reusable business logic isolated from route handlers

2. **Repository Pattern**
   - `storage.ts` provides an abstraction over data access
   - Implements `IStorage` interface for potential alternative implementations

3. **Middleware Chain**
   - Authentication middleware
   - Error handling middleware
   - Request validation middleware

### 3. Database Architecture

#### Technology Stack
- **PostgreSQL**: Relational database
- **Drizzle ORM**: Type-safe database access
- **Drizzle Kit**: Database migration tools

#### Schema Design

The database schema is defined in `shared/schema.ts` and includes:

1. **Users Table**
   - Stores user information from Replit authentication
   - Links to session data

2. **Sessions Table**
   - Manages user sessions securely
   - Supports token refresh

3. **Agent Types Table**
   - Defines categories of agents
   - Contains display information and capabilities

4. **Agents Table**
   - Stores agent metadata
   - Tracks status, resources, and uptime

5. **Messages Table**
   - Records communication with agents
   - Supports bidirectional conversations

6. **Alerts Table**
   - Tracks system alerts and notifications
   - Links to related agents

7. **Commands Table**
   - Records command history
   - Tracks execution status and responses

### 4. Shared Code

The `shared` directory contains code shared between frontend and backend:

```
shared/
└── schema.ts              # Database schema and shared types
```

This ensures type consistency across the application.

## Key Architectural Decisions

### 1. Hologram Visualization Approach

After evaluating multiple options for hologram visualization:

1. **Three.js/React Three Fiber (Considered)**: 
   - Would provide true 3D capabilities
   - Required significant resources
   - Had compatibility issues with other React components

2. **CSS-based Approach (Selected)**:
   - More performant for most devices
   - Better integration with the React component lifecycle
   - Easier to maintain and extend
   - Sufficient for creating convincing 3D-like effects

### 2. Voice Command System

The voice command system uses the Web Speech API with:

1. **Wake Word Pattern**:
   - Configurable wake word ("Nova")
   - Continuous listening mode with manual stop
   - Feedback mechanisms to show recognition status

2. **Fallback Mechanisms**:
   - Text command input when voice isn't available
   - Visual command buttons for common actions

### 3. Real-time Communication

1. **WebSocket Selection**:
   - Chose WebSockets over SSE or polling for bidirectional communication
   - Lightweight message format for efficient updates
   - Reconnection logic for reliability

2. **Event Types**:
   - Structured message types for different update scenarios
   - Support for targeted and broadcast messages

### 4. Authentication Strategy

1. **Replit Authentication**:
   - Leverages OpenID Connect for secure authentication
   - Maintains session state in PostgreSQL
   - Supports token refresh for long-lived sessions

## Performance Considerations

1. **Query Optimization**:
   - Efficient database queries with proper indexing
   - Query caching where appropriate

2. **Rendering Performance**:
   - CSS animations optimized for GPU acceleration
   - Conditional rendering to minimize DOM updates
   - Virtualization for long lists

3. **Asset Loading**:
   - SVG for vector graphics
   - CSS for animations where possible
   - Minimal external dependencies

## Security Considerations

1. **Authentication**:
   - Secure, HTTP-only cookies for session storage
   - Token refresh mechanism to minimize session theft risk
   - CSRF protection

2. **Authorization**:
   - Route-level middleware for protected resources
   - Validation of user permissions

3. **Data Validation**:
   - Input validation on all API endpoints
   - Zod schemas for type validation
   - Sanitization of user inputs

## Scalability Considerations

1. **Stateless Server Design**:
   - Server components designed to scale horizontally
   - Session data stored in PostgreSQL, not in memory

2. **Connection Management**:
   - WebSocket connection pooling
   - Graceful degradation under high load

3. **Database Scaling**:
   - Efficient query patterns
   - Indexes on frequently queried columns
   - Potential for read replicas in the future

## Future Architecture Considerations

1. **Microservices Evolution**:
   - Potential to split into specialized services:
     - Authentication Service
     - Agent Management Service
     - Notification Service

2. **Real-time Enhancements**:
   - Potential migration to Socket.IO for additional features
   - Support for room-based communication for multi-user scenarios

3. **Advanced Visualization**:
   - Potential WebGL integration for more complex holographic effects
   - AR capabilities for mobile viewing