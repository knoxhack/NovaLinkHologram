# NovaLink Setup Guide

This document provides detailed instructions for setting up and configuring the NovaLink platform.

## System Requirements

- **Node.js**: Version 18 or higher
- **npm**: Version 8 or higher
- **PostgreSQL**: Version 14 or higher
- **Memory**: At least 2GB RAM recommended
- **Storage**: Minimum 500MB free space
- **Browser**: Chrome, Firefox, Safari, or Edge (latest versions)

## Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/novalink.git
cd novalink
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/novalink

# Session Configuration
SESSION_SECRET=generate_a_secure_random_string

# Replit Authentication Configuration
REPLIT_DOMAINS=yourapp.replit.app,localhost:5000
REPL_ID=your_repl_id
ISSUER_URL=https://replit.com/oidc

# Optional: Replit API Key (for connecting to actual Replit agents)
REPLIT_API_KEY=your_replit_api_key
```

### 4. Set Up the Database

Create a PostgreSQL database:

```bash
createdb novalink
```

Push the schema to the database:

```bash
npm run db:push
```

Seed the database with initial data:

```bash
npm run db:seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Your NovaLink instance should now be running at [http://localhost:5000](http://localhost:5000).

## Configuration Options

### Customizing Agent Types

Agent types are defined in the database. You can add new agent types by inserting rows into the `agent_types` table:

```sql
INSERT INTO agent_types (name, icon, description) 
VALUES ('Custom Agent', 'cpu', 'A customized agent type for specific tasks');
```

### Authentication Options

NovaLink uses Replit's Authentication by default. The following options can be modified in `server/replitAuth.ts`:

- **Scopes**: Change the requested scopes in the `scope` parameter
- **Session Duration**: Modify `sessionTtl` to change how long sessions last
- **Cookie Settings**: Adjust cookie security settings in the session configuration

### Voice Command Customization

Voice command settings can be customized in `client/src/hooks/useVoiceCommands.ts`:

- **Wake Word**: Change the default wake word from "Nova"
- **Command Sensitivity**: Adjust the confidence threshold for command recognition
- **Language**: Set the recognition language

## Troubleshooting

### Database Connection Issues

If you encounter database connection problems:

1. Verify your PostgreSQL service is running:
   ```bash
   sudo service postgresql status
   ```

2. Check that your DATABASE_URL is correct in the .env file

3. Ensure the database exists:
   ```bash
   psql -l | grep novalink
   ```

### Authentication Problems

If authentication is not working:

1. Make sure your REPLIT_DOMAINS includes all domains where your app runs
2. Verify that your REPL_ID is correct
3. Check server logs for specific authentication errors

### Voice Recognition Not Working

Voice recognition issues can be resolved by:

1. Ensuring your browser has microphone permissions
2. Using a supported browser (Chrome works best for Web Speech API)
3. Checking if your microphone is properly connected and functioning

## Updating NovaLink

To update to the latest version:

1. Pull the latest changes:
   ```bash
   git pull origin main
   ```

2. Install any new dependencies:
   ```bash
   npm install
   ```

3. Apply any database migrations:
   ```bash
   npm run db:push
   ```

4. Restart the server:
   ```bash
   npm run dev
   ```

## Support

If you encounter any issues or have questions, please:

1. Check the [FAQ](./FAQ.md) for common questions
2. Search existing issues on GitHub
3. Create a new issue if your problem isn't already addressed

## Security Considerations

- Always use a strong, unique SESSION_SECRET
- Keep your REPLIT_API_KEY secure and never commit it to version control
- Regularly update dependencies to address security vulnerabilities
- Use HTTPS in production environments