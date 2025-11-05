# Jacky Lark MCP Server

一个强大的飞书文档管理工具，通过 AI 助手（如 Cursor）帮你轻松管理飞书文档和知识库。

## ✨ 主要功能

- 📝 **创建和更新文档**：使用 Markdown 格式创建新文档或更新现有文档
- 📥 **下载文档**：将飞书文档转换为 Markdown 格式，方便本地编辑和备份
- 🔐 **安全认证**：使用 OAuth 安全登录，保护你的账户安全
- 🤖 **AI 集成**：完美集成到 Cursor 等 AI 工具中，让 AI 帮你管理文档

## 🚀 快速开始

### 第一步：安装

确保你的电脑已安装 Node.js（版本 >= 18.19.0）。如果没有，请先[下载安装 Node.js](https://nodejs.org/)。

`jacky-lark-mcp-server` 已发布为 npm 包，直接使用 `npx` 即可，无需安装。npx 会自动下载并运行最新版本。

### 第二步：创建飞书应用

1. 访问 [飞书开放平台](https://open.feishu.cn/)
2. 登录你的飞书账号
3. 点击「创建应用」→ 选择「企业自建应用」
4. 填写应用名称和描述
5. 在「凭证与基础信息」页面获取：
   - **App ID**（应用 ID）
   - **App Secret**（应用密钥）
6. 在「安全设置」中配置重定向 URI：
   - 添加 `http://localhost:3000/callback`
7. 在「权限管理」中申请所需权限：
   - `drive:drive` - 访问云端硬盘（读写）
   - `wiki:wiki` - 访问知识库（读写）
   - 根据你的需求选择其他权限

**💡 快速方式：如果不希望自建应用**

如果你不想创建自己的飞书应用，可以直接使用预配置的应用。编辑 Cursor 的 MCP 配置文件 `~/.cursor/mcp.json`，使用以下配置：

```json
{
  "mcpServers": {
    "jacky-lark-mcp-server": {
      "command": "npx",
      "args": [
        "jacky-lark-mcp-server",
        "-a", "cli_a8f62c84d70a5013",
        "-s", "DtD1Ye7zTaZhhoZ2Pcy0oeFyFbgvVPhq",
        "--scope", "wiki:wiki docx:document docx:document.block:convert"
      ]
    }
  }
}
```

使用此配置后，可以直接跳到「第四步：重启 Cursor」。

### 第三步：配置 Cursor（自建应用方式）

如果你选择自建应用，编辑 Cursor 的 MCP 配置文件 `~/.cursor/mcp.json`：

```json
{
  "mcpServers": {
    "jacky-lark-mcp-server": {
      "command": "npx",
      "args": [
        "jacky-lark-mcp-server",
        "-a", "你的_APP_ID",
        "-s", "你的_APP_SECRET",
        "--scope", "wiki:wiki docx:document docx:document.block:convert"
      ]
    }
  }
}
```

**重要提示：**
- 将 `你的_APP_ID` 和 `你的_APP_SECRET` 替换为第二步获取的凭证
- `--scope` 参数指定了所需的权限范围，根据你的实际需求可以调整：
  - `wiki:wiki` - 访问知识库（读写）
  - `docx:document` - 访问文档（读写）
  - `docx:document.block:convert` - 文档块转换权限

### 第四步：重启 Cursor

配置完成后，重启 Cursor，AI 助手就可以使用飞书文档管理功能了！

## 📖 使用指南

### 在 Cursor 中使用

配置完成后，你可以在 Cursor 的聊天中直接使用这些功能：

#### 创建新文档

直接告诉 AI 助手：

```
帮我在飞书知识库中创建一个新文档，标题是"项目计划"，内容如下：
# 项目计划
## 目标
完成项目开发
## 时间表
- 第一周：需求分析
- 第二周：开发
```

AI 会使用 `add-markdown-to-feishu` 工具帮你创建文档。

#### 更新现有文档

```
将以下内容追加到飞书文档 https://xxx.feishu.cn/wiki/xxx 中：
## 更新记录
- 2024-01-01：完成功能开发
```

#### 下载文档

```
帮我把这个飞书文档下载为 Markdown：https://xxx.feishu.cn/docx/xxx
```

AI 会使用 `download-feishu-doc` 工具下载文档。

## 🛠️ 可用功能

### 1. 创建和追加文档

**功能：** 在飞书知识库中创建新文档或向现有文档追加内容

**使用场景：**
- ✅ 将 Markdown 笔记同步到飞书
- ✅ 批量创建文档
- ✅ 定期更新文档内容

**参数说明：**
- `content` - Markdown 格式的文档内容
- `url` - 飞书知识库节点 URL（创建新文档时）或文档 URL（追加内容时）
- `mode` - 操作模式：`create`（创建）或 `append`（追加）
- `title` - 新文档的标题（仅在创建时使用）

### 2. 下载文档

**功能：** 将飞书文档转换为 Markdown 格式并保存到本地

**使用场景：**
- ✅ 备份重要文档
- ✅ 本地编辑文档
- ✅ 文档格式转换

**参数说明：**
- `url` - 飞书文档 URL（支持普通文档和知识库节点）
- `outputPath` - 保存路径（可选，默认：当前目录的 `document.md`）
- `downloadImages` - 是否下载图片（默认：是）
- `imagesDir` - 图片保存目录（可选）

### 3. 查看配置

**功能：** 查看当前的飞书应用配置信息

**使用场景：**
- ✅ 验证配置是否正确
- ✅ 排查配置问题

## ⚙️ 配置选项

以下配置选项需要在 Cursor 的 MCP 配置文件 `~/.cursor/mcp.json` 中设置。

### 必需配置

在 `args` 数组中添加以下参数：

- `-a, --app-id` - 飞书应用 ID（从飞书开放平台获取）
- `-s, --app-secret` - 飞书应用密钥（从飞书开放平台获取）

**注意：** 可以使用短参数 `-a` 和 `-s` 代替长参数，例如：
- `-a YOUR_APP_ID` 等同于 `--app-id YOUR_APP_ID`
- `-s YOUR_APP_SECRET` 等同于 `--app-secret YOUR_APP_SECRET`

### 可选配置

- `--scope` - 权限范围（可选，默认使用应用的所有权限）
  - 示例：`--scope "wiki:wiki docx:document docx:document.block:convert"`
  - 常用权限：
    - `wiki:wiki` - 访问知识库（读写）
    - `docx:document` - 访问文档（读写）
    - `docx:document.block:convert` - 文档块转换权限
    - `drive:drive` - 访问云端硬盘（读写）
- `-p, --port` - OAuth 回调端口（默认：3000）
- `--wiki-url` - 默认知识库 URL（可选）
- `--debug` - 启用调试模式（显示详细日志，用于排查问题）

**配置示例：**

```json
{
  "mcpServers": {
    "jacky-lark-mcp-server": {
      "command": "npx",
      "args": [
        "jacky-lark-mcp-server",
        "-a", "你的_APP_ID",
        "-s", "你的_APP_SECRET",
        "--scope", "wiki:wiki docx:document docx:document.block:convert",
        "--debug"
      ]
    }
  }
}
```

## ❓ 常见问题

### Q: 如何获取飞书应用的 App ID 和 App Secret？

A: 登录 [飞书开放平台](https://open.feishu.cn/)，创建应用后，在「凭证与基础信息」页面可以看到。

### Q: 为什么需要配置重定向 URI？

A: OAuth 登录需要回调地址，系统默认使用 `http://localhost:3000/callback`，需要在飞书开放平台的安全设置中添加这个地址。

### Q: 支持哪些权限？

A: 主要需要以下权限：
- `drive:drive` - 访问云端硬盘（用于文档操作）
- `wiki:wiki` - 访问知识库（用于知识库操作）

根据你的具体需求，可能还需要其他权限。更多信息请参考[飞书开放平台文档](https://open.feishu.cn/document/ukTMukTMukTM/uITNz4iM1MjLyUzM)。

### Q: 文档下载后图片无法显示？

A: 确保在下载时设置了 `downloadImages: true`，图片会被下载到指定目录（默认是 `images` 文件夹）。

### Q: 如何修改默认的知识库？

A: 在 Cursor 的 MCP 配置中使用 `--wiki-url` 参数指定默认知识库 URL。

### Q: 连接失败怎么办？

A: 请检查：
1. App ID 和 App Secret 是否正确
2. 重定向 URI 是否在飞书开放平台正确配置
3. 应用权限是否已申请并通过审核
4. MCP 配置中的参数格式是否正确

### Q: 可以在多个知识库中使用吗？

A: 可以！每次操作时指定不同的知识库 URL 即可。

## 🔒 安全提示

- ⚠️ **不要分享你的 App Secret**：这是敏感信息，请妥善保管
- ⚠️ **不要将配置文件提交到 Git**：如果使用配置文件，请将其添加到 `.gitignore`
- ✅ **使用最小权限原则**：只申请你实际需要的权限
- ✅ **定期更新应用密钥**：如果怀疑密钥泄露，及时在飞书开放平台重置

## 📞 获取帮助

如果遇到问题：

1. 检查 Cursor 的 MCP 配置是否正确
2. 在配置中添加 `--debug` 参数以获取详细日志
3. 查看[飞书开放平台文档](https://open.feishu.cn/document/)
4. 提交 Issue 获取帮助

## 📝 更新日志

查看 [CHANGELOG.md](./CHANGELOG.md) 了解最新更新。
