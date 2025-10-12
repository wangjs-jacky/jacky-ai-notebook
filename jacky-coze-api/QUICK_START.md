# 快速开始

本文档提供快速上手 `jacky-coze-api` 的指南。

## 安装

```bash
npm install jacky-coze-api @coze/api
```

## 基础使用

### ES Module (推荐)

```typescript
// main.ts 或 main.mjs
import { createCozeAgent } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

const result = await agent.chat('你好');
console.log(result.message);
```

### CommonJS

```javascript
// main.js
const { createCozeAgent } = require('jacky-coze-api');

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

(async () => {
  const result = await agent.chat('你好');
  console.log(result.message);
})();
```

## TypeScript 支持

完整的类型定义已包含在包中，无需额外安装：

```typescript
import { createCozeAgent } from 'jacky-coze-api';
import type { CozeAgentConfig, ChatResult, LifecycleEvents } from 'jacky-coze-api';

const config: CozeAgentConfig = {
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  debug: false,
};

const agent = createCozeAgent(config);

const events: LifecycleEvents = {
  onMessage: (content) => console.log(content),
  onComplete: () => console.log('完成'),
};

const result: ChatResult = await agent.chat('测试', events);
```

## 流式输出

```typescript
import { createCozeAgent } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

await agent.chat('写一首诗', {
  onMessage: (content) => {
    // 实时输出每个字符/词
    process.stdout.write(content);
  },
  onComplete: () => {
    console.log('\n完成！');
  }
});
```

## 多轮对话

```typescript
import { createCozeAgent } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  autoSaveHistory: true, // 启用历史记录
});

// 第一轮
await agent.chat('我叫小明');

// 第二轮 - AI 会记住上下文
const result = await agent.chat('你还记得我的名字吗？');
console.log(result.message); // AI 会回答"小明"

// 查看对话历史
const history = agent.getHistory();
console.log(history);

// 重置对话
agent.reset();
```

## 错误处理

```typescript
import { createCozeAgent } from 'jacky-coze-api';

const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
});

const result = await agent.chat('测试', {
  onError: (error) => {
    console.error('发生错误:', error);
  }
});

if (!result.success) {
  console.error('对话失败:', result.error);
} else {
  console.log('成功:', result.message);
  console.log('Token使用:', result.usage);
}
```

## 获取 API 密钥

1. 访问 [Coze 官网](https://www.coze.com/)
2. 登录并进入控制台
3. 创建一个 Bot 并获取 Bot ID
4. 在设置中生成 API 密钥

## 配置选项

```typescript
interface CozeAgentConfig {
  COZE_API_KEY: string;        // 必填：API 密钥
  COZE_BOT_ID: string;          // 必填：Bot ID
  debug?: boolean;              // 可选：调试模式，默认 false
  autoSaveHistory?: boolean;    // 可选：自动保存历史，默认 false
  baseURL?: string;             // 可选：API 地址，默认 "https://api.coze.cn"
}
```

## 生命周期事件

```typescript
interface LifecycleEvents {
  onStart?: (data) => void;     // 对话开始
  onMessage?: (content) => void; // 收到消息片段
  onComplete?: (data) => void;   // 对话完成
  onError?: (error) => void;     // 发生错误
  onUsage?: (usage) => void;     // Token 使用情况
}
```

## 返回结果

```typescript
interface ChatResult {
  success: boolean;          // 是否成功
  message: string;           // 回复内容
  error?: any;              // 错误信息（如果失败）
  usage?: any;              // Token 使用情况
  conversationId?: string;  // 会话 ID
  completeData?: any;       // 完整响应数据
}
```

## 更多示例

查看 [README.md](./README.md) 获取更多详细示例和 API 文档。

查看源码中的 `src/examples/demo.ts` 获取完整的示例代码。

## 常见问题

### Q: 如何启用调试模式？

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  debug: true, // 启用调试
});
```

### Q: 如何使用国际版 API？

```typescript
const agent = createCozeAgent({
  COZE_API_KEY: "你的API密钥",
  COZE_BOT_ID: "你的Bot ID",
  baseURL: "https://api.coze.com", // 国际版
});
```

### Q: 如何获取完整的响应数据？

```typescript
const result = await agent.chat('测试');
console.log(result.completeData); // 完整响应
console.log(result.usage);        // Token 使用
console.log(result.conversationId); // 会话 ID
```

## 支持

- [GitHub Issues](https://github.com/yourusername/jacky-coze-api/issues)
- [Coze 官方文档](https://www.coze.com/docs)
- [npm 包](https://www.npmjs.com/package/jacky-coze-api)

