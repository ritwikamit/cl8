<div align="center">

# ⚡ CL8

### Terminal-First AI Coding & Automation Assistant

*Inspired by Claude Code · Gemini CLI · OpenAI Codex CLI · OpenHands · Aider · Cursor*

---

[![CI](https://github.com/ritwikamit/cl8/actions/workflows/ci.yml/badge.svg)](https://github.com/ritwikamit/cl8/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/cl8.svg?color=4ECDC4)](https://www.npmjs.com/package/cl8)
[![npm downloads](https://img.shields.io/npm/dm/cl8.svg?color=45B7D1)](https://www.npmjs.com/package/cl8)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-3178C6)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%3E%3D18-339933)](https://nodejs.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

**[Features](#features) · [Architecture](#architecture) · [Quick Start](#quick-start) · [Commands](#commands) · [Configuration](#configuration) · [Plugins](#plugin-system) · [Contributing](CONTRIBUTING.md)**

---

</div>

## 📋 Overview

**CL8** is a production-grade, terminal-native AI agent that lives in your command line. It understands natural language, writes and edits code, executes commands, searches your codebase, and automates complex multi-step workflows — all from the comfort of your terminal.

Unlike browser-based AI tools, CL8 operates **directly in your development environment**. It reads your files, understands your project structure, runs shell commands, and makes changes — with appropriate safety controls every step of the way.

### Why CL8?

- **Terminal-native** — No browser, no IDE plugin. Your terminal is your workspace.
- **Multi-provider** — Switch between OpenAI, Google Gemini, or local Ollama models.
- **Agentic workflow** — Plan, execute, reflect, and iterate autonomously.
- **Plugin architecture** — Extend with custom tools and MCP-compatible servers.
- **Security-first** — Sandboxed execution, command approval, and audit logging.
- **Persistent sessions** — Conversations survive process restarts with SQLite-backed memory.

---

## ✨ Features

### 🤖 AI-Powered Chat

```
┌────────────────────────────────────────────────┐
│  cl8> explain the authentication flow       │
│                                                │
│  🔍 Analyzing your auth system...              │
│                                                │
│  The authentication flow uses JWT tokens       │
│  with refresh rotation...                      │
│                                                │
│  Files analyzed:                               │
│  • src/auth/middleware.ts                      │
│  • src/auth/service.ts                        │
│  • src/auth/types.ts                          │
└────────────────────────────────────────────────┘
```

- Natural language interaction
- Streaming responses with markdown rendering
- Syntax-highlighted code blocks
- Multi-line input support
- Command history and slash commands

### 💻 Code Generation & Editing

- Generate code from natural language descriptions
- Read, write, and edit files with surgical precision
- Multi-file refactoring and corrections
- Code explanation and documentation generation
- Pattern-based search and replace

### 🛠️ Terminal Execution

- Execute shell commands directly from chat
- Command approval prompts for dangerous operations
- Live streaming of command output
- Secure command sandboxing
- Blocked command detection

### 🔍 Codebase Search

- Regex pattern searching across files
- File glob pattern matching
- Respects `.gitignore` patterns
- Directory-aware search scope

### 🧠 Agent Loop

```
User Prompt
    │
    ▼
┌─────────────┐
│   Planner   │  ──  Break down task into steps
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Executor  │  ──  Execute each step with tools
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Reflector  │  ──  Evaluate results, replan if needed
└──────┬──────┘
       │
       ▼
  Final Response
```

### 📦 Plugin System

- Dynamic plugin loading from directories
- Plugin manifests for metadata
- Tool registration API
- Hooks for lifecycle events
- MCP compatibility layer (future)

### 💾 Memory & Persistence

- Conversation history with automatic compaction
- Session management with resume capability
- Token usage tracking
- Workspace-scoped memory
- Vector memory for semantic search (abstraction)

### 🔒 Security

- Workspace sandboxing — files outside workspace are protected
- Command approval prompts for dangerous operations
- Blocked command detection and prevention
- API key encryption at rest
- Full audit logging of all tool calls
- Configurable approval modes: `ask`, `auto`, `deny`

---

## 🏗️ Architecture

CL8 follows a **layered, service-oriented architecture** designed for modularity and extensibility.

```
┌─────────────────────────────────────────────────┐
│                   CLI Layer                      │
│    Commander.js · Chalk · Ora · Inquirer         │
├─────────────────────────────────────────────────┤
│                 Agent Layer                      │
│    Planner → Executor → Reflector → Agent        │
├─────────────────────────────────────────────────┤
│                 Tool Layer                       │
│    FileTool · ShellTool · SearchTool · Plugin    │
├─────────────────────────────────────────────────┤
│               Service Layer                      │
│    ToolService · SecurityService · AuditService  │
├─────────────────────────────────────────────────┤
│              Provider Layer                      │
│    OpenAI · Gemini · Ollama (abstracted)         │
├─────────────────────────────────────────────────┤
│               Memory Layer                       │
│    Conversation · Session · Vector               │
├─────────────────────────────────────────────────┤
│              Plugin Layer                        │
│    PluginManager · PluginLoader · MCP (future)   │
└─────────────────────────────────────────────────┘
```

### Core Loop

The agentic loop is the heart of CL8:

1. **Plan** — The Planner receives user input and available tools, then decomposes the task into sequential steps using the LLM.

2. **Execute** — The Executor runs each step through the appropriate tool (file, shell, search), collecting results.

3. **Reflect** — The Reflector evaluates execution results, detects failures, and decides whether to replan or generate a final response.

4. **Respond** — The agent synthesizes a final response summarizing what was done and the results.

---

## 📁 Folder Structure

```
cl8/
│
├── src/
│   ├── agents/           # Agent orchestration
│   │   ├── Agent.ts      # Main agent (loop coordinator)
│   │   ├── Planner.ts    # Task decomposition
│   │   ├── Executor.ts   # Step execution
│   │   └── Reflector.ts  # Result evaluation
│   │
│   ├── cli/              # CLI framework
│   │   ├── index.ts      # Commander.js setup
│   │   └── commands/     # Command implementations
│   │       ├── chat.ts   # Interactive session
│   │       ├── init.ts   # First-time setup
│   │       ├── session.ts # Session management
│   │       └── config.ts # Configuration management
│   │
│   ├── config/           # Configuration
│   │   ├── index.ts      # Config loader (JSON store + .env)
│   │   └── env.ts        # Environment variable helpers
│   │
│   ├── core/             # Core engine
│   │   ├── Engine.ts     # Service orchestration
│   │   └── Loop.ts       # Interactive REPL loop
│   │
│   ├── memory/           # Persistence
│   │   ├── ConversationMemory.ts  # Message history
│   │   ├── SessionManager.ts      # Session lifecycle
│   │   └── VectorMemory.ts        # Semantic search (abstraction)
│   │
│   ├── plugins/          # Plugin system
│   │   ├── PluginManager.ts  # Plugin lifecycle
│   │   └── PluginLoader.ts   # Dynamic loading
│   │
│   ├── providers/        # AI provider abstraction
│   │   ├── BaseProvider.ts   # Abstract interface
│   │   ├── OpenAIProvider.ts # OpenAI / GPT
│   │   ├── GeminiProvider.ts # Google Gemini
│   │   └── OllamaProvider.ts # Local models
│   │
│   ├── services/         # Business logic
│   │   ├── ToolService.ts    # Tool dispatch
│   │   ├── SecurityService.ts # Security & approval
│   │   └── AuditService.ts   # Logging & audit
│   │
│   ├── tools/            # Tool implementations
│   │   ├── BaseTool.ts      # Abstract tool
│   │   ├── FileTool.ts      # File read/write/edit
│   │   ├── ShellTool.ts     # Command execution
│   │   └── SearchTool.ts    # Code search
│   │
│   ├── types/            # TypeScript type definitions
│   │   ├── agent.ts      # Agent types
│   │   ├── config.ts     # Configuration types
│   │   ├── memory.ts     # Memory types
│   │   ├── plugin.ts     # Plugin types
│   │   ├── provider.ts   # Provider types
│   │   └── tool.ts       # Tool types
│   │
│   ├── ui/               # Terminal UI
│   │   ├── MarkdownRenderer.ts  # Markdown → terminal
│   │   ├── Spinner.ts           # Loading spinners
│   │   └── StreamingOutput.ts   # Stream management
│   │
│   ├── utils/            # Utilities
│   │   ├── crypto.ts     # Encryption, IDs, hashing
│   │   └── logger.ts     # Winston logger
│   │
│   └── bin/              # Entry point
│       └── cl8.ts     # CLI binary
│
├── plugins/              # User-installed plugins
├── examples/             # Plugin examples
├── scripts/              # Build/utility scripts
├── tests/                # Test suite
├── docs/                 # Documentation
├── logs/                 # Application logs
│
├── .env.example          # Environment template
├── .github/workflows/    # CI/CD pipelines
├── CONTRIBUTING.md       # Contribution guide
├── LICENSE               # MIT license
└── README.md             # You are here
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** v18.0.0 or higher
- **npm** v9.0.0 or higher
- An API key for your preferred AI provider (optional for Ollama)

### ⚡ One-Liner Install

**Windows (PowerShell)**:
```powershell
# Option A: Run instantly with npx (no install needed)
npx cl8

# Option B: Install globally
npm install -g cl8
cl8

# Option C: Automated installer
irm https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.ps1 | iex
```

**macOS / Linux**:
```bash
# Option A: Run instantly with npx (no install needed)
npx cl8

# Option B: Install globally
npm install -g cl8
cl8

# Option C: Automated installer
curl -fsSL https://raw.githubusercontent.com/ritwikamit/cl8/main/scripts/install.sh | bash
```

### 2. Configure Your AI Provider

```bash
# Run the setup wizard
cl8 init

# Or configure manually by creating .env:
cp .env.example .env
# Then edit .env with your API keys
```

### 3. Start Using CL8

```text
cl8
```

### 4. Example Commands

Once CL8 is running, try these:

```text
cl8> Explain what this project does

cl8> Find all TODO comments in the codebase

cl8> Create a new React component for a login form

cl8> Debug the test failure in src/tests/auth.test.ts

cl8> Refactor the database service to use connection pooling

cl8> /help    # Show all available commands
cl8> /clear   # Clear the conversation
cl8> /status  # Show session information
```

---

## 📟 Commands

### CLI Commands

| Command | Description |
|---------|-------------|
| `cl8` or `cl8 chat` | Start interactive chat session |
| `cl8 init` | Initialize configuration wizard |
| `cl8 session --list` | List recent sessions |
| `cl8 session --show <id>` | Show session details |
| `cl8 session --resume <id>` | Resume a session |
| `cl8 config --show` | Show current configuration |
| `cl8 config --set <key> --value <val>` | Set configuration value |
| `cl8 config --reset` | Reset to defaults |
| `cl8 doctor` | Check system health |
| `cl8 --version` | Show version |
| `cl8 --help` | Show help |

### Slash Commands (in chat)

| Command | Description |
|---------|-------------|
| `/help` | Show available slash commands |
| `/clear` | Clear the conversation |
| `/reset` | Reset the agent state |
| `/status` | Show current session info |
| `/session` | Show session details |
| `/tokens` | Show token usage |
| `/mode <ask\|auto\|deny>` | Set approval mode |
| `/exit` | Exit CL8 |

### CLI Options

```text
cl8 chat [options]

Options:
  -p, --provider <provider>   AI provider (openai, gemini, ollama)
  -m, --model <model>         Model name (e.g. gpt-4o, gemini-2.0-flash)
  -w, --workspace <path>      Workspace directory
  -s, --session <id>          Resume a previous session
  -h, --help                  Display help
```

---

## ⚙️ Configuration

### Environment Variables (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | OpenAI API key | — |
| `OPENAI_MODEL` | OpenAI model name | `gpt-4o` |
| `GEMINI_API_KEY` | Google Gemini API key | — |
| `GEMINI_MODEL` | Gemini model name | `gemini-2.0-flash` |
| `OLLAMA_BASE_URL` | Ollama server URL | `http://localhost:11434` |
| `OLLAMA_MODEL` | Ollama model name | `codellama` |
| `CL8_DEFAULT_PROVIDER` | Default AI provider | `openai` |
| `CL8_WORKSPACE` | Workspace directory | `./workspace` |
| `CL8_APPROVAL_MODE` | Command approval (`ask`, `auto`, `deny`) | `ask` |
| `CL8_LOG_LEVEL` | Logging level | `info` |
| `CL8_PLUGIN_DIRS` | Plugin directories | `./plugins` |

### Approval Modes

| Mode | Behavior |
|------|----------|
| `ask` | Prompt for approval on dangerous commands (default, safest) |
| `auto` | Auto-approve commands with guardrails |
| `deny` | Block all command execution (read-only mode) |

---

## 🔌 Plugin System

CL8 features a dynamic plugin system that allows you to extend its capabilities.

### Plugin Structure

```
plugins/
  my-plugin/
    manifest.json    # Plugin metadata
    index.js         # Compiled entry point
```

### Manifest Format

```json
{
  "name": "my-plugin",
  "version": "1.0.0",
  "description": "Description of your plugin",
  "author": "Your Name",
  "license": "MIT",
  "entry": "index.js"
}
```

### Plugin API

Plugins receive a `PluginAPI` object with:

- `registerTool(tool)` — Register a custom tool
- `getTools()` — List registered tools
- `log(level, message)` — Log through CL8's logger
- `config` — Plugin configuration from manifest

---

## 🧪 Development

```bash
# Type check
npm run typecheck

# Lint
npm run lint

# Run tests
npm test

# Watch mode
npm run build:watch

# Development with hot reload
npm run dev
```

---

## 🛣️ Roadmap

- [x] Interactive chat with streaming responses
- [x] Multi-provider AI support (OpenAI, Gemini, Ollama)
- [x] File system tools (read, write, edit, search)
- [x] Shell command execution with security controls
- [x] Agent loop (Plan → Execute → Reflect)
- [x] Session persistence and management
- [x] Plugin architecture
- [x] Audit logging and security
- [ ] MCP (Model Context Protocol) support
- [ ] GitHub integration (PR review, issue management)
- [ ] Web search and browsing capabilities
- [ ] Docker sandbox for command execution
- [ ] Vector database for semantic memory
- [ ] Multi-agent orchestration
- [ ] VS Code extension integration
- [ ] Linux and macOS native packages
- [ ] Configuration UI (TUI)

---

## 🤝 Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on:

- Setting up a development environment
- Code style and conventions
- Testing requirements
- Pull request process

All contributions are welcome! 🎉

---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

CL8 stands on the shoulders of giants. It draws inspiration from:

- **[Claude Code](https://docs.anthropic.com/en/docs/claude-code)** by Anthropic — Agentic coding in the terminal
- **[Gemini CLI](https://github.com/google-gemini/gemini-cli)** by Google — Open-source AI agent
- **[OpenAI Codex CLI](https://github.com/openai/codex)** by OpenAI — Coding agent runtime
- **[OpenHands](https://github.com/All-Hands-AI/OpenHands)** — Open platform for AI software developers
- **[Aider](https://github.com/Aider-AI/aider)** by Paul Gauthier — AI pair programming
- **[Cursor](https://cursor.sh)** — AI-first code editor
- **[Cline](https://github.com/cline/cline)** — Autonomous coding agent

Built with ❤️ for the open-source community.

---

<div align="center">

**⭐ Star us on GitHub — it helps!**

[Report Bug](https://github.com/ritwikamit/cl8/issues) · [Request Feature](https://github.com/ritwikamit/cl8/issues)

</div>
