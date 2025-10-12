# 发布指南

本文档介绍如何发布 `jacky-coze-api` 到 npm。

## 发布前检查清单

### 1. 更新版本号

根据改动类型更新 `package.json` 中的版本号：

```bash
# 补丁版本 (bug 修复): 1.0.0 -> 1.0.1
npm version patch

# 小版本 (新功能): 1.0.0 -> 1.1.0
npm version minor

# 大版本 (破坏性改动): 1.0.0 -> 2.0.0
npm version major
```

### 2. 更新 package.json 信息

在发布前，请更新以下字段：

```json
{
  "author": "你的名字 <your.email@example.com>",
  "repository": {
    "type": "git",
    "url": "https://github.com/你的用户名/jacky-coze-api.git"
  },
  "bugs": {
    "url": "https://github.com/你的用户名/jacky-coze-api/issues"
  },
  "homepage": "https://github.com/你的用户名/jacky-coze-api#readme"
}
```

### 3. 构建项目

```bash
npm run build
```

这将生成：
- `dist/` - CommonJS 格式
- `dist/esm/` - ES Module 格式
- `*.d.ts` - TypeScript 类型定义

### 4. 测试构建产物

#### 测试 CommonJS

创建测试文件 `test-cjs.js`:

```javascript
const { createCozeAgent } = require('./dist/index.js');

console.log('CommonJS import successful:', typeof createCozeAgent);
```

运行：

```bash
node test-cjs.js
```

#### 测试 ES Module

创建测试文件 `test-esm.mjs`:

```javascript
import { createCozeAgent } from './dist/esm/index.js';

console.log('ES Module import successful:', typeof createCozeAgent);
```

运行：

```bash
node test-esm.mjs
```

### 5. 检查打包内容

查看将要发布到 npm 的文件：

```bash
npm pack --dry-run
```

这会显示将包含在包中的所有文件。

## 发布到 npm

### 首次发布

1. **登录 npm**（如果还未登录）：

```bash
npm login
```

输入你的 npm 用户名、密码和邮箱。

2. **发布包**：

```bash
npm publish
```

### 更新发布

1. 更新版本号（见上文）
2. 提交更改：

```bash
git add .
git commit -m "chore: bump version to x.x.x"
git push
```

3. 发布：

```bash
npm publish
```

### 发布 Beta 版本

如果要发布预发布版本：

```bash
# 设置版本为 1.0.0-beta.0
npm version prerelease --preid=beta

# 发布到 beta tag
npm publish --tag beta
```

用户可以这样安装 beta 版本：

```bash
npm install jacky-coze-api@beta
```

## 发布后

### 1. 创建 Git Tag

```bash
git tag v1.0.0
git push --tags
```

### 2. 创建 GitHub Release

在 GitHub 上创建一个新的 Release，包含：
- 版本号
- 更新日志
- 重要改动说明

### 3. 验证发布

访问 npm 页面确认发布成功：

```
https://www.npmjs.com/package/jacky-coze-api
```

测试安装：

```bash
npm install jacky-coze-api
```

## 撤销发布

如果发布后发现严重问题，可以在 72 小时内撤销：

```bash
npm unpublish jacky-coze-api@1.0.0
```

**注意**：撤销发布后，同一版本号不能再次发布。

## 持续维护

### 版本策略

遵循语义化版本（Semantic Versioning）：

- **MAJOR** (主版本): 不兼容的 API 改动
- **MINOR** (次版本): 向下兼容的新功能
- **PATCH** (补丁版本): 向下兼容的 bug 修复

### 更新日志

在 `CHANGELOG.md` 中记录每个版本的变更：

```markdown
# Changelog

## [1.1.0] - 2025-01-15
### Added
- 新功能描述

### Changed
- 改动描述

### Fixed
- Bug 修复描述

## [1.0.0] - 2025-01-01
### Added
- 初始版本发布
```

## 常见问题

### 问题：`npm publish` 失败

**可能原因**：
1. 包名已被占用
2. 权限不足
3. 版本号已存在

**解决方法**：
- 检查包名是否可用：`npm search jacky-coze-api`
- 确认登录状态：`npm whoami`
- 更新版本号后重试

### 问题：TypeScript 类型定义不正确

**解决方法**：
1. 确保 `tsconfig.json` 中 `declaration: true`
2. 检查 `package.json` 中 `types` 字段
3. 重新构建：`npm run build`

### 问题：模块导入失败

**解决方法**：
1. 检查 `package.json` 中的 `exports` 字段
2. 确认 `main` 和 `module` 字段路径正确
3. 测试两种模块格式的导入

## 参考资源

- [npm 文档](https://docs.npmjs.com/)
- [语义化版本](https://semver.org/lang/zh-CN/)
- [TypeScript 发布](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html)

