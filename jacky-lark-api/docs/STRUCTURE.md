# 项目结构说明

本项目已按照 Node.js 项目结构最佳实践进行组织。

## 📁 目录结构

```
jacky-lark-api/
├── src/                      # 源代码目录
│   ├── core/                 # 核心功能模块
│   │   ├── index.ts         # 模块统一导出
│   │   ├── client.ts        # API 客户端
│   │   └── oauth.ts         # OAuth 助手
│   ├── types/               # 类型定义
│   │   └── index.ts
│   └── index.ts             # 主入口文件
├── examples/                # 示例代码
│   └── index.ts
├── dist/                    # 编译输出（git 忽略）
├── docs/                    # 文档目录
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

## 🔄 对比重构前

### 重构前
```
src/
├── client.ts
├── oauth.ts
├── types.ts
├── examples.ts
└── index.ts
```

### 重构后
```
src/
├── core/        # 核心功能集中管理
│   ├── client.ts
│   ├── oauth.ts
│   └── index.ts
├── types/       # 类型定义集中管理
│   └── index.ts
└── index.ts

examples/        # 示例代码独立管理
└── index.ts
```

## ✅ 优势

1. **更好的可维护性**：相关功能集中在一起，易于查找和修改
2. **清晰的依赖关系**：通过模块边界明确依赖关系
3. **便于扩展**：新增功能时只需要在相应模块添加文件
4. **更好的代码组织**：符合 Node.js 社区最佳实践

## 📝 使用方式

```typescript
// 导入类型
import type { LarkApiClientConfig, UserInfoResponse } from 'jacky-lark-api';

// 导入核心模块
import { LarkApiClient, LarkOAuthHelper } from 'jacky-lark-api';

// 创建实例
const client = new LarkApiClient(config);
const oauth = new LarkOAuthHelper(config);
```

## 🔗 相关文档

- [API 文档](./API.md)
- [使用指南](./GUIDE.md)
- [最佳实践](./BEST_PRACTICES.md)

