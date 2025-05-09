# NovaLink API Reference

This document provides detailed technical documentation for the NovaLink API. It covers all available endpoints, request/response formats, and authentication requirements.

## Authentication

NovaLink uses Replit's OpenID Connect for authentication. All API endpoints except for public routes require authentication.

### Authentication Flow

1. Client redirects to `/api/login` to initiate the Replit auth flow
2. User authenticates with Replit
3. Replit redirects back to `/api/callback` with auth code
4. Server exchanges code for tokens and establishes a session
5. Client is redirected to the app

### Session Management

Sessions are stored in PostgreSQL and provided to the client via secure cookies. The session contains:

- User claims from Replit (user ID, email, etc.)
- Access token
- Refresh token
- Token expiration

## API Endpoints

All endpoints return JSON responses. Errors return appropriate HTTP status codes with a JSON body containing an error message.

### User & Authentication

#### GET `/api/auth/user`

Returns the currently authenticated user.

**Authentication Required**: Yes

**Response Body**:
```json
{
  "id": "12345",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "profileImageUrl": "https://replit.com/public/images/profileImage.png",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

#### GET `/api/login`

Initiates the Replit authentication flow.

**Authentication Required**: No

**Response**: Redirects to Replit auth page

#### GET `/api/logout`

Logs out the current user and ends the session.

**Authentication Required**: Yes

**Response**: Redirects to home page

### Agent Management

#### GET `/api/agents`

Returns a list of all available agents.

**Authentication Required**: Yes

**Response Body**:
```json
[
  {
    "id": 1,
    "name": "ChronoCore",
    "projectId": "project123",
    "status": "active",
    "typeId": 1,
    "memoryUsage": 256.5,
    "uptime": 86400,
    "lastActive": "2025-05-08T12:00:00Z",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  ...
]
```

#### GET `/api/agents/:id`

Returns a specific agent by ID.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Response Body**:
```json
{
  "id": 1,
  "name": "ChronoCore",
  "projectId": "project123",
  "status": "active",
  "typeId": 1,
  "memoryUsage": 256.5,
  "uptime": 86400,
  "lastActive": "2025-05-08T12:00:00Z",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

#### PATCH `/api/agents/:id/status`

Updates an agent's status.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Request Body**:
```json
{
  "status": "active"
}
```

**Response Body**:
```json
{
  "id": 1,
  "name": "ChronoCore",
  "status": "active",
  ...
}
```

### Agent Types

#### GET `/api/agent-types`

Returns all agent types.

**Authentication Required**: Yes

**Response Body**:
```json
[
  {
    "id": 1,
    "name": "Time Manager",
    "icon": "clock",
    "description": "Manages time-related tasks and scheduling",
    "createdAt": "2025-01-01T00:00:00Z"
  },
  ...
]
```

### Messages

#### GET `/api/agents/:id/messages`

Gets all messages for a specific agent.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Response Body**:
```json
[
  {
    "id": 1,
    "agentId": 1,
    "content": "System initialized and running",
    "timestamp": "2025-05-08T12:00:00Z",
    "direction": "outbound"
  },
  ...
]
```

#### POST `/api/agents/:id/messages`

Creates a new message for an agent.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Request Body**:
```json
{
  "content": "Execute daily backup",
  "direction": "inbound"
}
```

**Response Body**:
```json
{
  "id": 2,
  "agentId": 1,
  "content": "Execute daily backup",
  "timestamp": "2025-05-09T08:15:00Z",
  "direction": "inbound"
}
```

### Alerts

#### GET `/api/alerts`

Gets all system alerts.

**Authentication Required**: Yes

**Response Body**:
```json
[
  {
    "id": 1,
    "agentId": 1,
    "message": "Agent is awaiting input to proceed",
    "severity": "warning",
    "timestamp": "2025-05-08T14:30:00Z",
    "resolved": false
  },
  ...
]
```

#### GET `/api/agents/:id/alerts`

Gets alerts for a specific agent.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Response Body**:
```json
[
  {
    "id": 1,
    "agentId": 1,
    "message": "Agent is awaiting input to proceed",
    "severity": "warning",
    "timestamp": "2025-05-08T14:30:00Z",
    "resolved": false
  },
  ...
]
```

#### PATCH `/api/alerts/:id/resolve`

Resolves a specific alert.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The alert ID

**Response Body**:
```json
{
  "id": 1,
  "agentId": 1,
  "message": "Agent is awaiting input to proceed",
  "severity": "warning",
  "timestamp": "2025-05-08T14:30:00Z",
  "resolved": true,
  "resolvedAt": "2025-05-08T15:00:00Z"
}
```

### Commands

#### GET `/api/agents/:id/commands`

Gets command history for an agent.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Response Body**:
```json
[
  {
    "id": 1,
    "agentId": 1,
    "command": "status",
    "executed": true,
    "timestamp": "2025-05-08T12:30:00Z",
    "response": "Status: Active, Memory: 256.5MB, Uptime: 24h"
  },
  ...
]
```

#### POST `/api/agents/:id/commands`

Sends a command to an agent.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The agent ID

**Request Body**:
```json
{
  "command": "analyze"
}
```

**Response Body**:
```json
{
  "id": 2,
  "agentId": 1,
  "command": "analyze",
  "executed": false,
  "timestamp": "2025-05-09T08:30:00Z"
}
```

#### POST `/api/commands/:id/execute`

Executes a specific command.

**Authentication Required**: Yes

**Path Parameters**:
- `id`: The command ID

**Response Body**:
```json
{
  "id": 2,
  "agentId": 1,
  "command": "analyze",
  "executed": true,
  "timestamp": "2025-05-09T08:30:00Z",
  "executedAt": "2025-05-09T08:30:05Z",
  "response": "Analysis complete. No issues found."
}
```

## WebSocket API

NovaLink provides real-time updates via WebSockets. Connect to `/ws` to establish a WebSocket connection.

### Connection Authentication

WebSocket connections require an authenticated session. The server validates the session cookie.

### Message Types

#### Server to Client

##### `update`

Sent when agent statuses or alerts are updated.

```json
{
  "type": "update",
  "data": {
    "agents": [...],
    "alerts": [...]
  }
}
```

##### `voice`

Sent when an agent provides a voice response.

```json
{
  "type": "voice",
  "data": {
    "text": "Analysis complete. No issues found.",
    "agentId": 1
  }
}
```

##### `initial`

Sent when the WebSocket connection is first established.

```json
{
  "type": "initial",
  "data": {
    "agents": [...],
    "alerts": [...],
    "agentTypes": [...]
  }
}
```

#### Client to Server

##### `command`

Sent to execute a command on an agent.

```json
{
  "type": "command",
  "agentId": 1,
  "command": "status"
}
```

## Error Responses

All API errors follow a standard format:

```json
{
  "message": "Error message describing what went wrong",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `UNAUTHORIZED`: The request requires authentication
- `FORBIDDEN`: The authenticated user doesn't have permission
- `NOT_FOUND`: The requested resource doesn't exist
- `VALIDATION_ERROR`: The request body failed validation
- `INTERNAL_ERROR`: An unexpected server error occurred

## Rate Limiting

API endpoints are rate-limited to 100 requests per minute per user. WebSocket messages are limited to 10 per second.

When rate limited, the server responds with a 429 status code and a `Retry-After` header indicating when to retry.

## Versioning

The current API version is v1. All endpoints should be prefixed with `/api/v1` in future versions.

## CORS

Cross-Origin Resource Sharing is configured to allow requests from:
- `https://novalink.replit.app`
- `https://localhost:5000`