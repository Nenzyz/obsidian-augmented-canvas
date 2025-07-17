# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development build with watch mode and hot reloading
- `npm run build` - Production build with TypeScript type checking
- `npm run version` - Bump version and update manifest files

## Architecture Overview

This is an **Obsidian plugin** that transforms Canvas into an AI-enhanced workspace. The plugin has undergone a major architectural evolution from OpenAI-only to a **multi-provider AI system**.

### Core Architecture

#### Multi-Provider System (`src/providers/`)
The plugin implements a provider pattern supporting multiple AI services:
- **OpenAI** - Full-featured original implementation  
- **Claude (Anthropic)** - Anthropic's Claude models
- **Gemini (Google)** - Google's Gemini models via REST API
- **Ollama** - Local model server integration

Each provider implements the `AIProvider` interface with standardized methods:
- `validateConfig()` - Validate API credentials and settings
- `getModels()` - Fetch available models dynamically 
- `sendMessage()` - Send chat requests with unified interface
- `getStatus()` - Real-time provider status validation

#### AI Service Layer (`src/services/aiService.ts`)
Central orchestration service that:
- Manages provider selection and initialization
- Routes requests to appropriate providers
- Handles provider switching and configuration
- Maintains backward compatibility with legacy OpenAI-specific code

#### Canvas Integration Architecture
The plugin heavily integrates with Obsidian's Canvas through:

**Link Traversal for Context**: Uses canvas node connections to build conversation history. When AI generates responses, it analyzes connected notes to provide context.

**Runtime Menu Patching**: Uses `monkey-around` to patch Canvas context menus at runtime, adding AI actions to node and canvas menus.

**Undocumented Canvas APIs**: Relies on reverse-engineered Canvas internals via `canvas-internal.d.ts` type definitions.

### Key Directory Structure

```
src/
├── actions/                     # Feature implementations organized by trigger
│   ├── canvasContextMenuActions/    # Canvas-level actions (flashcards, etc.)
│   ├── canvasNodeContextMenuActions/ # Node-level actions  
│   ├── canvasNodeMenuActions/       # Primary AI actions (Ask AI, questions)
│   └── commands/                    # Plugin commands (system prompts, etc.)
├── providers/                   # AI provider implementations
├── services/                    # Core business logic (aiService)
├── settings/                    # Multi-provider configuration system
├── obsidian/                   # Obsidian API utilities and Canvas patches
└── utils/                      # Shared utilities (JSON parsing, Canvas helpers)
```

### Critical Implementation Details

#### Canvas Context Understanding
The plugin builds conversation context by traversing canvas node connections. It reads content from various node types (text notes, markdown files, PDFs) and sends this context to AI providers along with user prompts.

**Context Separation**: Connected nodes are separated using a configurable separator (default: `\n\n---\n\n`) to ensure AI understands each connected node as distinct context rather than continuous text. This separator can be customized in plugin settings.

#### Provider-Specific API Handling
- **Gemini**: Uses Obsidian's `request()` API instead of `fetch()` to avoid CORS issues
- **Claude**: Implements Anthropic's message format with system prompts
- **Ollama**: Supports local server endpoints with model management
- **OpenAI**: Maintains full feature parity including vision models

#### JSON Response Parsing (`src/utils/jsonUtils.ts`)
Robust parsing system that handles AI responses wrapped in markdown code blocks. Essential for features like flashcard generation and question generation where AI returns structured JSON.

#### Settings Migration System
Maintains backward compatibility with existing OpenAI configurations while supporting multi-provider setup. Settings automatically migrate when users upgrade from OpenAI-only versions.

#### Context Separator Configuration
The `contextSeparator` setting allows users to customize how connected nodes are separated in conversation context:
- **Default**: `"\n\n---\n\n"` (horizontal rule with spacing)
- **Location**: Plugin settings → "Context separator"
- **Usage**: Enter `\n` for newlines in the settings UI
- **Purpose**: Prevents AI from treating connected nodes as continuous text
- **Token Handling**: Separator tokens are properly counted and handled during truncation

### Feature Implementation Patterns

#### AI Actions on Canvas Nodes
Most AI features follow this pattern:
1. Extract content from selected canvas node(s)
2. Build conversation context from connected nodes
3. Send request through AI service layer
4. Create new canvas nodes with AI responses
5. Link response nodes to maintain conversation flow

#### Flashcard Generation
Creates markdown files (not canvas nodes) in `Home/Flashcards/` directory using `front::back` format for integration with spaced repetition plugins. This is intentional design for external tool compatibility.

## Development Considerations

### Canvas API Limitations
Canvas APIs are largely undocumented and subject to change. The plugin uses runtime patching which is fragile. When modifying Canvas integration:
- Test thoroughly across Obsidian versions
- Avoid deep Canvas internals when possible
- Maintain fallbacks for API changes

### Provider Integration Best Practices
When adding new providers:
1. Implement the `AIProvider` interface completely
2. Add to the `PROVIDERS` registry in `src/providers/index.ts`
3. Update settings schema and UI
4. Test all AI features with the new provider
5. Handle provider-specific API quirks (CORS, authentication, etc.)

### Error Handling Requirements
- Always provide user feedback for API failures
- Implement graceful fallbacks for provider unavailability
- Validate configurations before making API calls
- Handle network timeouts and rate limits appropriately

### Testing Multi-Provider Functionality
- Test provider switching preserves configurations
- Verify all AI features work across providers  
- Test with invalid API keys and network failures
- Validate backward compatibility with existing configs
- Test dynamic model fetching for each provider
- Test context separator functionality with various separators and connected node scenarios

This codebase requires understanding of both Obsidian plugin architecture and modern AI service integration patterns. The multi-provider system demonstrates sophisticated architectural evolution while maintaining user compatibility.