# Jacky Coze API

A high-level TypeScript wrapper for the Coze API with lifecycle events, conversation management, and full TypeScript support.

[![npm version](https://img.shields.io/npm/v/jacky-coze-api.svg)](https://www.npmjs.com/package/jacky-coze-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

English | [简体中文](./README.zh.md)

## Features

✨ **Simple & Intuitive API** - Easy-to-use high-level abstraction over Coze API  
🔄 **Multi-turn Conversations** - Built-in conversation state management  
📡 **Lifecycle Events** - Hook into different stages of the chat lifecycle  
🎯 **TypeScript Support** - Full type definitions included  
💬 **Streaming Support** - Real-time message streaming  
🔌 **Flexible** - Support both ES Module and CommonJS

## Installation

```bash
npm install jacky-coze-api @coze/api
```

or with yarn:

```bash
yarn add jacky-coze-api @coze/api
```

or with pnpm:

```bash
pnpm add jacky-coze-api @coze/api
```

## Usage

### ES Module

```typescript
import { createCozeAgent } from 'jacky-coze-api';
import type { CozeAgentConfig, ChatResult } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
  debug: false,
});

const result = await agent.chat('Hello, how are you?');
console.log(result.message);
```

### CommonJS

```javascript
const { createCozeAgent } = require('jacky-coze-api');

const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
  debug: false,
});

(async () => {
  const result = await agent.chat('Hello, how are you?');
  console.log(result.message);
})();
```

## API Reference

### `createCozeAgent(config)`

Creates a new Coze Agent instance.

#### Parameters

- `config` (`CozeAgentConfig`): Configuration object
  - `COZE_API_KEY` (string, required): Your Coze API key
  - `COZE_BOT_ID` (string, required): Your Coze bot ID
  - `debug` (boolean, optional): Enable debug mode. Default: `false`
  - `autoSaveHistory` (boolean, optional): Automatically save conversation history. Default: `false`
  - `baseURL` (string, optional): Custom API base URL. Default: `"https://api.coze.cn"`

#### Returns

Returns a `CozeAgent` instance with the following methods:

##### `chat(query, events?)`

Send a message and get a response.

**Parameters:**
- `query` (string): The message to send
- `events` (LifecycleEvents, optional): Lifecycle event callbacks

**Returns:** `Promise<ChatResult>`

**ChatResult interface:**
```typescript
interface ChatResult {
  success: boolean;      // Whether the chat was successful
  message: string;       // The response message
  error?: any;          // Error object if failed
  usage?: any;          // Token usage information
  conversationId?: string; // Conversation ID
  completeData?: any;   // Complete response data
}
```

##### `reset()`

Reset the conversation (clears conversation ID and message history).

##### `getHistory()`

Get the conversation history.

**Returns:** Array of message objects with `role`, `content`, and optional `type`.

##### `conversation`

Direct access to the conversation manager.

### Lifecycle Events

You can hook into different stages of the chat lifecycle:

```typescript
interface LifecycleEvents {
  onStart?: (data: CreateChatData) => void;    // Called when chat starts
  onMessage?: (content: string) => void;        // Called for each message chunk
  onComplete?: (data: any) => void;             // Called when chat completes
  onError?: (error: any) => void;               // Called on error
  onUsage?: (usage: any) => void;               // Called with token usage info
}
```

## Examples

### 1. Basic Usage

```typescript
import { createCozeAgent } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
});

const result = await agent.chat('Tell me a joke');

if (result.success) {
  console.log('✅ Response:', result.message);
  console.log('💰 Token usage:', result.usage);
} else {
  console.log('❌ Error:', result.error);
}
```

### 2. Streaming with Lifecycle Events

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
});

const result = await agent.chat('Write a short poem', {
  onStart: (data) => {
    console.log('🚀 Chat started, conversation ID:', data.id);
  },
  onMessage: (content) => {
    // Stream each chunk as it arrives
    process.stdout.write(content);
  },
  onComplete: (data) => {
    console.log('\n✅ Chat completed');
  },
  onUsage: (usage) => {
    console.log('💰 Token usage:', usage);
  },
  onError: (error) => {
    console.error('❌ Error:', error);
  }
});
```

### 3. Multi-turn Conversation

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
  autoSaveHistory: true, // Enable history saving
});

// First turn
await agent.chat('My name is John');

// Second turn - the agent remembers the context
await agent.chat('What is my name?');

// View conversation history
const history = agent.getHistory();
console.log('Conversation history:', history);
```

### 4. Reset Conversation

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
});

await agent.chat('My favorite color is blue');

// Reset the conversation
agent.reset();

// This will be treated as a new conversation
await agent.chat('What is my favorite color?');
// Agent won't remember the previous context
```

### 5. Error Handling

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
});

try {
  const result = await agent.chat('Hello', {
    onError: (error) => {
      console.log('Callback error:', error);
    }
  });
  
  if (!result.success) {
    console.log('Chat failed:', result.error);
  }
} catch (error) {
  console.log('Caught error:', error);
}
```

### 6. Custom Configuration

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "your_api_key",
  COZE_BOT_ID: "your_bot_id",
  debug: true,                           // Enable debug mode
  autoSaveHistory: true,                 // Auto-save history
  baseURL: "https://api.coze.com"        // Custom API endpoint
});

await agent.chat('Hello!');
```

## Type Definitions

All TypeScript types are exported and can be imported separately:

```typescript
import type {
  CozeAgent,
  CozeAgentConfig,
  LifecycleEvents,
  ChatResult,
  ConversationManager
} from 'jacky-coze-api';
```

Or import from the interface module:

```typescript
import type { ChatResult } from 'jacky-coze-api/interface';
```

## Building from Source

```bash
# Install dependencies
npm install

# Build both CommonJS and ES modules
npm run build

# Build CommonJS only
npm run build:cjs

# Build ES module only
npm run build:esm

# Run development example
npm run dev

# Watch mode for development
npm run dev:watch

# Clean build artifacts
npm run clean
```

## Project Structure

```
jacky-coze-api/
├── src/
│   ├── index.ts          # Main entry point
│   ├── interface.ts      # Type definitions
│   └── examples/
│       └── demo.ts       # Usage examples
├── dist/                 # Build output (CommonJS)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── dist/esm/            # Build output (ES Module)
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── package.json
├── tsconfig.json        # TypeScript config for CommonJS
├── tsconfig.esm.json    # TypeScript config for ES Module
└── README.md
```

## Requirements

- Node.js >= 14.0.0
- TypeScript >= 4.0.0 (for development)
- @coze/api >= 1.3.0

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please [open an issue](https://github.com/wangjs-jacky/jacky-ai-notebook/issues) on GitHub.

## Links

- [Coze Official Documentation](https://www.coze.com/docs)
- [Coze API Package](https://www.npmjs.com/package/@coze/api)
- [Quick Start Guide](./QUICK_START.md)

## Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

---

Made with ❤️

