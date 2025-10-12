# Jacky Coze API

一个高级 TypeScript 封装库，为 Coze API 提供生命周期事件、对话管理和完整的 TypeScript 支持。

[![npm version](https://img.shields.io/npm/v/jacky-coze-api.svg)](https://www.npmjs.com/package/jacky-coze-api)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](./README.md) | 简体中文

## 特性

✨ **简单直观的 API** - 易于使用的 Coze API 高级抽象  
🔄 **多轮对话** - 内置对话状态管理  
📡 **生命周期事件** - 可以钩入聊天生命周期的不同阶段  
🎯 **TypeScript 支持** - 包含完整的类型定义  
💬 **流式支持** - 实时消息流  
🔌 **灵活** - 同时支持 ES Module 和 CommonJS

## 安装

```bash
npm install jacky-coze-api @coze/api
```

或使用 yarn：

```bash
yarn add jacky-coze-api @coze/api
```

或使用 pnpm：

```bash
pnpm add jacky-coze-api @coze/api
```

## 使用方法

### ES Module

```typescript
import { createCozeAgent } from 'jacky-coze-api';
import type { CozeAgentConfig, ChatResult } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  debug: false,
});

const result = await agent.chat('你好，最近怎么样？');
console.log(result.message);
```

### CommonJS

```javascript
const { createCozeAgent } = require('jacky-coze-api');

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  debug: false,
});

(async () => {
  const result = await agent.chat('你好，最近怎么样？');
  console.log(result.message);
})();
```

## API 参考

### `createCozeAgent(config)`

创建一个新的 Coze Agent 实例。

#### 参数

- `config` (`CozeAgentConfig`)：配置对象
  - `COZE_API_KEY` (string, 必填)：你的 Coze API 密钥
  - `COZE_BOT_ID` (string, 必填)：你的 Coze 机器人 ID
  - `debug` (boolean, 可选)：启用调试模式。默认：`false`
  - `autoSaveHistory` (boolean, 可选)：自动保存对话历史。默认：`false`
  - `baseURL` (string, 可选)：自定义 API 基础 URL。默认：`"https://api.coze.cn"`

#### 返回值

返回一个 `CozeAgent` 实例，包含以下方法：

##### `chat(query, events?)`

发送消息并获取响应。

**参数：**
- `query` (string)：要发送的消息
- `events` (LifecycleEvents, 可选)：生命周期事件回调

**返回：** `Promise<ChatResult>`

**ChatResult 接口：**
```typescript
interface ChatResult {
  success: boolean;      // 聊天是否成功
  message: string;       // 响应消息
  error?: any;          // 失败时的错误对象
  usage?: any;          // Token 使用信息
  conversationId?: string; // 对话 ID
  completeData?: any;   // 完整的响应数据
}
```

##### `reset()`

重置对话（清除对话 ID 和消息历史）。

##### `getHistory()`

获取对话历史。

**返回：** 包含 `role`、`content` 和可选 `type` 的消息对象数组。

##### `conversation`

直接访问对话管理器。

### 生命周期事件

你可以钩入聊天生命周期的不同阶段：

```typescript
interface LifecycleEvents {
  onStart?: (data: CreateChatData) => void;    // 聊天开始时调用
  onMessage?: (content: string) => void;        // 每个消息块时调用
  onComplete?: (data: any) => void;             // 聊天完成时调用
  onError?: (error: any) => void;               // 发生错误时调用
  onUsage?: (usage: any) => void;               // 返回 token 使用信息时调用
}
```

## 示例

### 1. 基础使用

```typescript
import { createCozeAgent } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

const result = await agent.chat('给我讲个笑话');

if (result.success) {
  console.log('✅ 响应:', result.message);
  console.log('💰 Token 使用:', result.usage);
} else {
  console.log('❌ 错误:', result.error);
}
```

### 2. 使用生命周期事件的流式输出

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

const result = await agent.chat('写一首短诗', {
  onStart: (data) => {
    console.log('🚀 聊天开始，对话 ID:', data.id);
  },
  onMessage: (content) => {
    // 接收到消息块时实时输出
    process.stdout.write(content);
  },
  onComplete: (data) => {
    console.log('\n✅ 聊天完成');
  },
  onUsage: (usage) => {
    console.log('💰 Token 使用:', usage);
  },
  onError: (error) => {
    console.error('❌ 错误:', error);
  }
});
```

### 3. 多轮对话

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  autoSaveHistory: true, // 启用历史记录保存
});

// 第一轮对话
await agent.chat('我的名字是张三');

// 第二轮对话 - agent 会记住上下文
await agent.chat('你还记得我的名字吗？');

// 查看对话历史
const history = agent.getHistory();
console.log('对话历史:', history);
```

### 4. 重置对话

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

await agent.chat('我最喜欢的颜色是蓝色');

// 重置对话
agent.reset();

// 这将被视为新对话
await agent.chat('我最喜欢的颜色是什么？');
// Agent 不会记住之前的上下文
```

### 5. 错误处理

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

try {
  const result = await agent.chat('你好', {
    onError: (error) => {
      console.log('回调错误:', error);
    }
  });
  
  if (!result.success) {
    console.log('聊天失败:', result.error);
  }
} catch (error) {
  console.log('捕获到错误:', error);
}
```

### 6. 自定义配置

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  debug: true,                           // 启用调试模式
  autoSaveHistory: true,                 // 自动保存历史
  baseURL: "https://api.coze.com"        // 自定义 API 端点（国际版）
});

await agent.chat('你好！');
```

## 类型定义

所有 TypeScript 类型都已导出，可以单独导入：

```typescript
import type {
  CozeAgent,
  CozeAgentConfig,
  LifecycleEvents,
  ChatResult,
  ConversationManager
} from 'jacky-coze-api';
```

或者从 interface 模块导入：

```typescript
import type { ChatResult } from 'jacky-coze-api/interface';
```

## 从源码构建

```bash
# 安装依赖
npm install

# 构建 CommonJS 和 ES 模块
npm run build

# 仅构建 CommonJS
npm run build:cjs

# 仅构建 ES 模块
npm run build:esm

# 运行开发示例
npm run dev

# 开发监听模式
npm run dev:watch

# 清理构建产物
npm run clean
```

## 项目结构

```
jacky-coze-api/
├── src/
│   ├── index.ts          # 主入口文件
│   ├── interface.ts      # 类型定义
│   └── examples/
│       └── demo.ts       # 使用示例
├── dist/                 # 构建输出（CommonJS）
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── dist/esm/            # 构建输出（ES Module）
│   ├── index.js
│   ├── index.d.ts
│   └── ...
├── package.json
├── tsconfig.json        # TypeScript 配置（CommonJS）
├── tsconfig.esm.json    # TypeScript 配置（ES Module）
└── README.md
```

## 环境要求

- Node.js >= 14.0.0
- TypeScript >= 4.0.0（用于开发）
- @coze/api >= 1.3.0

## 常见问题

### 如何获取 API 密钥？

1. 访问 [Coze 官网](https://www.coze.cn/)
2. 登录并进入控制台
3. 创建一个 Bot 并获取 Bot ID
4. 在设置中生成 API 密钥

### 如何使用国际版 API？

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  baseURL: "https://api.coze.com", // 国际版 API
});
```

### 如何启用调试模式？

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  debug: true, // 启用调试
});
```

### 如何获取完整的响应数据？

```typescript
const result = await agent.chat('测试');
console.log(result.completeData); // 完整响应
console.log(result.usage);        // Token 使用情况
console.log(result.conversationId); // 会话 ID
```

## 许可证

MIT

## 贡献

欢迎贡献！请随时提交 Pull Request。

## 支持

如果你遇到任何问题或有疑问，请在 GitHub 上[提交 issue](https://github.com/yourusername/jacky-coze-api/issues)。

## 相关链接

- [Coze 官方文档](https://www.coze.cn/docs)
- [Coze API 包](https://www.npmjs.com/package/@coze/api)
- [快速开始指南](./QUICK_START.md)

## 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解版本更新历史。

---

用 ❤️ 制作


