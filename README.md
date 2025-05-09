# NovaLink - Advanced AI Agent Interface

![NovaLink Banner](./public/novalink-banner.svg)

NovaLink is a high-definition 3D holographic AI assistant platform designed to interface with Replit Agent V2. This immersive cyberpunk-styled interface allows users to monitor, control, and communicate with all active AI agents across multiple projects in real-time.

## 🌟 Features

### Current Features

#### 🤖 AI Agent Monitoring & Control
- **Real-time Agent Status** - Monitor active, idle, processing, and stopped agents
- **Agent Details View** - View comprehensive agent metrics including uptime, memory usage, and status
- **Command Interface** - Send direct commands to individual agents
- **Alert System** - Real-time notifications of critical agent issues with visual and audio cues

#### 🌌 Immersive Holographic UI
- **Interactive 3D Hologram** - CSS-based holographic visualization with real-time animations
- **Multiple Visualization Modes** - Normal, Alert, Analysis, and Listening modes with unique visual signatures
- **Data Visualization** - Dynamic data points representing agent activity and system status
- **Cyberpunk Aesthetics** - Futuristic grid backgrounds, digital noise, power flicker effects, and alert animations

#### 🎤 Voice Command System
- **Natural Voice Recognition** - Speak commands directly to NovaLink using the "Nova" wake word
- **Visual Feedback** - Hologram reacts and changes based on voice activity with specialized animations
- **Continuous Listening** - Enhanced mode that stays active until manually deactivated
- **Transcript Display** - Shows what the system is hearing in real-time
- **Voice Settings** - Configurable wake word and voice feedback options

#### 💬 Communication Tools
- **Agent Logs** - Historical record of agent activity and communications
- **Message System** - Read and insert messages for async communication with agents
- **Voice Response** - Audio feedback for important alerts and responses
- **Quick Commands** - Preset command buttons for common actions

#### 🔐 Authentication & Security
- **Replit Authentication** - Secure access through Replit's authentication system
- **Session Management** - Maintain secure session with proper authorization
- **Protected Routes** - Resource access control based on authentication status

#### ⚡ Real-time Updates
- **WebSocket Communication** - Instant updates without page refreshes
- **Notification System** - Toast notifications for system events and command confirmations
- **Dynamic Data Refresh** - Automatic data updates when agent status changes

### 🚀 Planned Future Features

#### Enhanced Agent Capabilities
- **Agent Creation Interface** - Visual wizard for creating and deploying new AI agents
- **Cross-Agent Collaboration** - Enable agents to communicate and work together on complex tasks
- **Custom Agent Templates** - Pre-configured agent templates for common use cases

#### Advanced Visualization
- **3D Model Upgrade** - WebGL-based hologram with more complex animations and interactions
- **AR Hologram Mode** - View NovaLink hologram in augmented reality on mobile devices
- **Customizable Hologram Appearance** - Personalize the hologram's appearance and behavior

#### Expanded Voice Capabilities
- **Natural Language Processing** - More sophisticated command parsing and contextual understanding
- **Voice ID Recognition** - Identify different users by their voice signatures
- **Multi-language Support** - Voice commands in multiple languages

#### Productivity Features
- **Agent Scheduling** - Schedule tasks and commands for future execution
- **Task Management** - Create, assign, and track tasks across multiple agents
- **Performance Analytics** - Detailed metrics and insights on agent performance

#### Integration Capabilities
- **External API Integration** - Connect to third-party services and data sources
- **Notification Systems** - Push notifications to mobile devices or messaging platforms
- **Export/Import** - Data portability between NovaLink instances

## 🔌 API Documentation

NovaLink provides a comprehensive API for interacting with agents. All endpoints are relative to your base URL.

### Authentication Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login` | GET | Initiates the Replit auth flow |
| `/api/callback` | GET | OAuth callback for completing authentication |
| `/api/logout` | GET | Logs out the current user |
| `/api/auth/user` | GET | Returns the authenticated user's information |

### Agent Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents` | GET | Retrieves all available agents |
| `/api/agents/:id` | GET | Gets a specific agent by ID |
| `/api/agents/:id/status` | PATCH | Updates an agent's status |

### Message Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents/:id/messages` | GET | Gets messages for a specific agent |
| `/api/agents/:id/messages` | POST | Sends a new message to an agent |

### Alert Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/alerts` | GET | Gets all system alerts |
| `/api/agents/:id/alerts` | GET | Gets alerts for a specific agent |
| `/api/alerts/:id/resolve` | PATCH | Resolves a specific alert |

### Command Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/agents/:id/commands` | GET | Gets command history for an agent |
| `/api/agents/:id/commands` | POST | Sends a command to an agent |
| `/api/commands/:id/execute` | POST | Executes a specific command |

### WebSocket API

NovaLink uses WebSockets for real-time communication. Connect to `/ws` to receive updates.

#### Message Types:

| Type | Description | Example Payload |
|------|-------------|-----------------|
| `update` | Agent or alert status updates | `{ type: 'update', data: { agents: [], alerts: [] } }` |
| `voice` | Voice response from agent | `{ type: 'voice', data: { text: "Response text", agentId: 1 } }` |
| `command` | Command sent to agent | `{ type: 'command', agentId: 1, command: "status" }` |
| `initial` | Initial data load | `{ type: 'initial', data: { agents: [], alerts: [], agentTypes: [] } }` |

## 🛠️ Architecture

NovaLink is built on a modern stack with the following components:

- **Frontend**: React.js with TypeScript and shadcn components
- **State Management**: TanStack Query for data fetching and caching
- **Real-time Communication**: WebSockets for instant updates
- **Styling**: Tailwind CSS with custom animations
- **Backend**: Express.js API server
- **Storage**: PostgreSQL database with Drizzle ORM
- **Authentication**: Replit Authentication via OpenID Connect

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Replit account for authentication

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/novalink.git
   cd novalink
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/novalink
   SESSION_SECRET=your_session_secret
   REPLIT_DOMAINS=yourapp.replit.app
   ```

4. Initialize the database:
   ```bash
   npm run db:push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## ✨ Acknowledgements

- Replit for the authentication and agent API infrastructure
- shadcn/ui for the modern component system
- All open source libraries that made this project possible