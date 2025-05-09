# Contributing to NovaLink

Thank you for your interest in contributing to NovaLink! This document provides guidelines and instructions for contributing to this project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/yourusername/novalink.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `npm install`
5. Set up the environment variables (see `.env.example`)
6. Start the development server: `npm run dev`

## Development Guidelines

### Code Style

- Follow the existing code style and formatting
- Use TypeScript for all new code
- Add appropriate JSDoc comments for functions and components
- Keep components focused on a single responsibility

### Git Workflow

1. Keep your branch updated with the main branch
2. Make your changes in small, logical commits
3. Write clear commit messages that explain the "why" not just the "what"
4. Include the issue number in commit messages when applicable

### Pull Requests

1. Create a pull request from your branch to the main repository
2. Provide a clear description of the changes
3. Reference any related issues
4. Ensure all tests pass
5. Update documentation if necessary
6. Be responsive to feedback and review comments

## Project Structure

Understanding the project structure will help you make contributions effectively:

```
├── client/            # Frontend React application
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions
│   │   ├── models/      # 3D models and animations
│   │   └── pages/       # Page components
├── server/            # Backend Express application
│   ├── services/      # Business logic services
│   ├── routes.ts      # API route definitions
│   └── storage.ts     # Data access layer
├── shared/            # Shared code between frontend and backend
│   └── schema.ts      # Database schema and shared types
└── public/            # Static assets
```

## Feature Development Process

1. **Idea Phase**: Begin by discussing your idea in an issue
2. **Planning**: Break down the implementation into manageable tasks
3. **Implementation**: Write the code following the project guidelines
4. **Testing**: Test your changes thoroughly
5. **Documentation**: Update documentation to reflect your changes
6. **Review**: Submit a pull request for review

## Bug Reports

When filing a bug report, please include:

1. A clear description of the issue
2. Steps to reproduce the bug
3. Expected behavior
4. Actual behavior
5. Screenshots if applicable
6. Your environment details (browser, OS, etc.)

## Feature Requests

Feature requests are welcome. Please provide:

1. A clear description of the feature
2. The motivation behind the feature
3. Potential implementation approaches
4. Any relevant examples or resources

## Testing

- Write tests for new features and bug fixes
- Ensure all existing tests pass before submitting a PR
- Cover both happy paths and edge cases

## Documentation

- Update README.md with any new features or changes
- Keep API documentation current
- Add JSDoc comments to functions and components
- Update the ARCHITECTURE.md file when making architectural changes

## Setting Up the Development Environment

For detailed instructions on setting up the development environment, refer to SETUP.md.

## Getting Help

If you need help with your contribution:

1. Check the existing documentation
2. Look through related issues
3. Ask questions on open issues
4. Contact the maintainers

## Review Process

After submitting a pull request:

1. CI will run automated tests
2. Maintainers will review your code
3. You may need to make requested changes
4. Once approved, your PR will be merged

Thank you for contributing to NovaLink!