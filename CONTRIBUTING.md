# Contributing to CL8

First off, thank you for considering contributing! We welcome all contributions — bug reports, feature requests, documentation improvements, and code changes.

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/). By participating, you are expected to uphold this code.

## How to Contribute

### 1. Find or Create an Issue

- Browse [open issues](https://github.com/YOUR_USERNAME/cl8/issues)
- If you have a new idea, open an issue first to discuss it
- Comment on the issue to let others know you're working on it

### 2. Set Up Development Environment

```bash
# Fork and clone the repo
git clone https://github.com/YOUR_USERNAME/cl8.git
cd cl8

# Install dependencies
npm install

# Copy environment config
cp .env.example .env

# Build the project
npm run build

# Run in development mode
npm run dev
```

### 3. Make Your Changes

- Follow the existing code style and conventions
- Write or update tests for your changes
- Ensure type safety — run `npm run typecheck`
- Keep the code clean and well-organized

### 4. Test Your Changes

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test

# Build
npm run build
```

### 5. Submit a Pull Request

1. Create a new branch: `git checkout -b feat/my-feature`
2. Commit your changes: `git commit -m 'feat: add amazing feature'`
3. Push to your fork: `git push origin feat/my-feature`
4. Open a PR against the `main` branch

## Development Guidelines

### Architecture

- `/src/agents` - Agent loop (Planner, Executor, Reflector)
- `/src/cli` - CLI commands and entry point
- `/src/config` - Configuration management
- `/src/core` - Engine and loop orchestration
- `/src/memory` - Conversation, session, and vector memory
- `/src/plugins` - Plugin system
- `/src/providers` - AI provider abstractions
- `/src/services` - Tool, security, and audit services
- `/src/tools` - Tool implementations
- `/src/types` - TypeScript type definitions
- `/src/ui` - Terminal UI components
- `/src/utils` - Utilities (crypto, logging)

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: fix a bug
docs: update documentation
refactor: refactor code
test: add or update tests
chore: maintenance tasks
```

### Code Style

- TypeScript strict mode
- No `any` types (use `unknown` when needed)
- Async/await over raw promises
- Named exports over default exports
- Comments explain _why_, not _what_

## Project Structure

```
src/
  agents/      # Agent logic (Planner, Executor, Reflector)
  cli/         # CLI framework (Commander.js)
  config/      # Configuration (.env + JSON store)
  core/        # Engine & event loop
  memory/      # Persistence layer
  plugins/     # Plugin system
  providers/   # AI provider abstraction
  services/    # Business logic services
  tools/       # Tool implementations
  types/       # TypeScript types
  ui/          # Terminal UI
  utils/       # Utilities
```

## Questions?

Open a [discussion](https://github.com/YOUR_USERNAME/cl8/discussions) or join our community chat.

Thank you for contributing!
