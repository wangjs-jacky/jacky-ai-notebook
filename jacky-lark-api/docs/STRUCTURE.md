# 项目结构说明

本项目已按照 Node.js 项目结构最佳实践进行组织。

## 📁 目录结构

```
jacky-lark-api/
├── src/                      # 源代码目录
│   ├── core/                 # 核心功能模块
│   │   ├── index.ts         # 模块统一导出
│   │   ├── client.ts        # API 客户端
│   │   ├── oauth.ts         # OAuth 助手
│   │   ├── auth-store.ts    # 认证信息持久化存储
│   │   ├── login-handler.ts # 一键登录处理器
│   │   └── lark-sdk.ts      # 飞书 SDK 工具（统一导出）
│   ├── utils/               # 工具函数模块
│   │   ├── index.ts         # 工具统一导出
│   │   └── token-extractor.ts # Token 提取工具
│   ├── types/               # 类型定义
│   │   └── index.ts
│   ├── config.ts            # 配置管理
│   └── index.ts             # 主入口文件
├── examples/                # 示例代码
│   └── index.ts
├── scripts/                 # 脚本工具
│   └── clear-storage.js    # 清除存储脚本
├── dist/                    # 编译输出（git 忽略）
├── docs/                    # 文档目录
│   ├── CONFIG.md           # 配置说明
│   ├── STORAGE.md          # 存储说明
│   ├── TOKEN-EXTRACTION.md # Token 提取文档
│   ├── QUICK-START.md      # 快速开始
│   └── STRUCTURE.md        # 项目结构
├── package.json
├── tsconfig.json
└── README.md
```

## 🏗️ 设计原则

### 1. 模块化设计
- **按功能领域划分模块**：核心功能放在 `core/` 模块
- **单一职责原则**：每个模块只负责一个明确的职责
- **高内聚低耦合**：模块内部紧密相关，模块间依赖最小化

### 2. 清晰的目录命名
- `core/` - 核心功能实现
- `types/` - TypeScript 类型定义
- `examples/` - 使用示例代码
- `index.ts` - 模块统一导出

### 3. 统一导出模式
每个模块使用 `index.ts` 统一导出，提供清晰的公共接口：

```typescript
// src/core/index.ts
export { LarkApiClient } from './client.js';
export { LarkOAuthHelper } from './oauth.js';

// src/index.ts
export * from './types/index.js';
export * from './core/index.js';
```

## 📦 模块说明

### Core 模块 (`src/core/`)
核心功能模块，包含：
- **LarkApiClient**: 飞书 API 客户端，用于获取和刷新 user_access_token
- **LarkOAuthHelper**: OAuth 授权工具，用于生成授权链接和解析回调
- **authStore**: 认证信息持久化存储，自动保存和加载 token
- **LoginHandler**: 一键登录处理器，自动处理完整的 OAuth 流程
- **lark-sdk.ts**: 飞书 SDK 工具统一导出（从 utils 模块重新导出）

### Utils 模块 (`src/utils/`)
**新增**：工具函数模块，包含：
- **token-extractor.ts**: 从飞书 URL 中提取 token 的工具函数
  - `extractTokenFromUrl()`: 提取 token 和资源类型
  - `extractTokensFromUrls()`: 批量提取
  - `getTokenOnly()`: 仅提取 token 字符串
  - `isValidLarkUrl()`: 验证 URL 有效性
  - `LarkResourceType`: 资源类型枚举

### Types 模块 (`src/types/`)
TypeScript 类型定义：
- OAuth 配置和响应类型
- API 请求和响应类型
- 错误处理类型

### Examples (`examples/`)
使用示例，演示：
- OAuth 授权流程
- 获取 user_access_token
- 获取用户信息
- 刷新令牌
- Token 提取功能

## 🔄 模块重构历史

### Token 提取工具重构

为了更好的代码组织和可维护性，我们将 Token 提取功能封装成独立的工具模块：

**重构前：**
```
src/core/lark-sdk.ts  (包含所有实现逻辑)
```

**重构后：**
```
src/
├── utils/
│   ├── index.ts              # 工具统一导出
│   └── token-extractor.ts   # Token 提取核心实现
└── core/
    └── lark-sdk.ts           # 从 utils 重新导出（向后兼容）
```

**设计理念：**
1. **职责分离**: 工具函数独立到 `utils/` 模块，核心业务逻辑保持在 `core/` 模块
2. **统一导出**: `core/lark-sdk.ts` 作为统一导出点，保持向后兼容
3. **灵活导入**: 用户可以从主入口、core、utils 或具体工具文件导入
4. **便于扩展**: 未来可以在 `utils/` 中添加更多工具函数

## ✅ 优势

1. **更好的可维护性**：相关功能集中在一起，易于查找和修改
2. **清晰的依赖关系**：通过模块边界明确依赖关系
3. **便于扩展**：新增功能时只需要在相应模块添加文件
4. **更好的代码组织**：符合 Node.js 社区最佳实践
5. **灵活的导入方式**：支持多种导入方式，满足不同场景需求
6. **向后兼容**：保持现有 API 不变，平滑升级

## 📝 使用方式

### 方式 1: 从主入口导入（推荐）

```typescript
// 导入类型
import type { LarkApiClientConfig, UserInfoResponse, TokenResult } from 'jacky-lark-api';

// 导入核心模块
import { 
  LarkApiClient, 
  LarkOAuthHelper,
  LoginHandler,
  authStore
} from 'jacky-lark-api';

// 导入工具函数
import { 
  extractTokenFromUrl, 
  getTokenOnly, 
  isValidLarkUrl,
  LarkResourceType
} from 'jacky-lark-api';

// 使用
const client = new LarkApiClient(config);
const result = extractTokenFromUrl('https://feishu.cn/docs/xxx');
```

### 方式 2: 从具体模块导入

```typescript
// 从 core 模块导入
import { LarkApiClient } from 'jacky-lark-api/core';

// 从 utils 模块导入
import { extractTokenFromUrl } from 'jacky-lark-api/utils';

// 从 lark-sdk 导入（统一导出）
import { 
  extractTokenFromUrl, 
  LarkResourceType 
} from 'jacky-lark-api/core/lark-sdk';
```

### 方式 3: 直接从工具文件导入

```typescript
// 直接从工具文件导入
import { 
  extractTokenFromUrl,
  LarkResourceType,
  type TokenResult
} from 'jacky-lark-api/utils/token-extractor';
```

## 🔗 相关文档

- [API 文档](./API.md)
- [使用指南](./GUIDE.md)
- [最佳实践](./BEST_PRACTICES.md)

