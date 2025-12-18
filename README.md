# Game Factory

> AI-native endless game generator for ChatGPT Store

Create unique text-adventure games in 2 clicks and play endlessly - no prompts, registration, or payment required.

## Features

- **2-Click Start**: Choose genre → adjust settings → play
- **Endless Variety**: AI generates unique stories every time
- **Survival Mechanics**: HP, supplies, inventory, threat levels
- **Share Challenges**: Send seed codes to friends to compete
- **13+ Safe**: Content filtered for all ages

## Quick Start

```bash
# Install dependencies
pnpm install

# Run tests
pnpm test

# Start MCP server (development)
pnpm run server

# Build widgets
pnpm run build:widgets
```

## Architecture

```
game-factory/
├── src/
│   ├── server/           # MCP Server
│   │   ├── tools/        # 5 MCP tools
│   │   ├── engine/       # Game logic
│   │   └── types/        # TypeScript types
│   ├── widgets/          # React UI components
│   └── shared/           # Constants, safety rules
├── templates/            # Curated game templates
└── tests/                # Test suite
```

## MCP Tools

| Tool | Purpose | Read-Only |
|------|---------|-----------|
| `list_templates` | Browse curated game templates | Yes |
| `start_run` | Begin a new game run | No |
| `act` | Apply player choice (retry-safe) | No |
| `end_run` | End run, get summary | No |
| `export_challenge` | Get shareable seed | Yes |

## Game Mechanics

- **Core Loop**: Scene → 3 Choices → Outcome → State Update → Next Scene
- **State**: HP, Supplies, Inventory, Flags, Progress, Threat Level
- **RNG**: Server-side deterministic (seed + turn + action)
- **Fail-Forward**: No rerolls, choose your consequence

## Content Safety

- No occult/spiritual themes
- No graphic violence
- No sexual content
- No gambling mechanics
- Filtered for 13+ audience

## Development

```bash
# Type checking
pnpm run typecheck

# Run tests with watch
pnpm run test:watch

# Build for production
pnpm run build
```

## License

MIT

## Links

- [Design Document](docs/plans/2025-12-18-game-factory-design.md)
- [Privacy Policy](PRIVACY.md)
