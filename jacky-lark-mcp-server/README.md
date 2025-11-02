# Jacky Lark MCP Server

A Model Context Protocol (MCP) server for Feishu/Lark with OAuth authentication support.

## Quick Start

```bash
# Install dependencies
npm install

# Build the project
npm run build
```

## CLI Commands

### 1. Check Current Session (`whoami`)

Display the current configuration and login status:

```bash
jacky-lark-mcp-server whoami
# or
node dist/index.js whoami
```

Example output:
```
📋 User Sessions:

✅ App ID: cli_xxxxxxxxxxxxx
✅ App Secret: xxxxxxxx...
⚠️  User Access Token: Not set
```

### 2. Login with OAuth (`login`)

Login using OAuth to get a user access token:

```bash
jacky-lark-mcp-server login \
  --app-id YOUR_APP_ID \
  --app-secret YOUR_APP_SECRET
# or
node dist/index.js login \
  --app-id YOUR_APP_ID \
  --app-secret YOUR_APP_SECRET
```

#### Login Options:

- `-a, --app-id <appId>`: **Required**. Your Feishu/Lark App ID
- `-s, --app-secret <appSecret>`: **Required**. Your Feishu/Lark App Secret
- `-d, --domain <domain>`: Optional. Feishu/Lark Domain (default: "https://open.feishu.cn")
- `--host <host>`: Optional. Host to listen (default: "localhost")
- `-p, --port <port>`: Optional. Port to listen (default: "3000")
- `--scope <scope>`: Optional. Specify OAuth scope, separated by spaces or commas
- `--debug`: Optional. Enable debug mode

#### Login Flow:

1. Run the login command
2. Open the provided URL in your browser
3. Authorize the application
4. The token will be automatically saved to `.env` file

Example:
```bash
jacky-lark-mcp-server login \
  --app-id cli_xxxxxxxxxxxxx \
  --app-secret xxxxxxxxxxxxxxxx \
  --scope "im:message"
# or
node dist/index.js login \
  --app-id cli_xxxxxxxxxxxxx \
  --app-secret xxxxxxxxxxxxxxxx \
  --scope "im:message"
```

### 3. Start MCP Server (`start`)

Start the MCP server (default command):

```bash
jacky-lark-mcp-server start
# or simply
jacky-lark-mcp-server
# or with node
node dist/index.js start
```

## Environment Variables

The tool uses the following environment variables (stored in `.env`):

- `LARK_APP_ID`: Your Feishu/Lark App ID
- `LARK_APP_SECRET`: Your Feishu/Lark App Secret
- `LARK_USER_ACCESS_TOKEN`: User access token (obtained via `login` command)
- `LARK_REDIRECT_URI`: OAuth redirect URI (default: http://localhost:3000/callback)
- `LARK_SCOPE`: OAuth scope

## Project Structure

```
my-mcp-server/
├── src/
│   ├── tools/        # MCP Tools
│   │   └── ExampleTool.ts
│   └── index.ts      # Server entry point
├── package.json
└── tsconfig.json
```

## Adding Components

The project comes with an example tool in `src/tools/ExampleTool.ts`. You can add more tools using the CLI:

```bash
# Add a new tool
mcp add tool my-tool

# Example tools you might create:
mcp add tool data-processor
mcp add tool api-client
mcp add tool file-handler
```

## Tool Development

Example tool structure:

```typescript
import { MCPTool } from "mcp-framework";
import { z } from "zod";

interface MyToolInput {
  message: string;
}

class MyTool extends MCPTool<MyToolInput> {
  name = "my_tool";
  description = "Describes what your tool does";

  schema = {
    message: {
      type: z.string(),
      description: "Description of this input parameter",
    },
  };

  async execute(input: MyToolInput) {
    // Your tool logic here
    return `Processed: ${input.message}`;
  }
}

export default MyTool;
```

## Publishing to npm

1. Update your package.json:
   - Ensure `name` is unique and follows npm naming conventions
   - Set appropriate `version`
   - Add `description`, `author`, `license`, etc.
   - Check `bin` points to the correct entry file

2. Build and test locally:
   ```bash
   npm run build
   npm link
   my-mcp-server  # Test your CLI locally
   ```

3. Login to npm (create account if necessary):
   ```bash
   npm login
   ```

4. Publish your package:
   ```bash
   npm publish
   ```

After publishing, users can add it to their claude desktop client (read below) or run it with npx
```

## Using with Claude Desktop

### Local Development

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "node",
      "args":["/absolute/path/to/my-mcp-server/dist/index.js"]
    }
  }
}
```

### After Publishing

Add this configuration to your Claude Desktop config file:

**MacOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Windows**: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "my-mcp-server": {
      "command": "npx",
      "args": ["my-mcp-server"]
    }
  }
}
```

## Building and Testing

1. Make changes to your tools
2. Run `npm run build` to compile
3. The server will automatically load your tools on startup

## Learn More

- [MCP Framework Github](https://github.com/QuantGeekDev/mcp-framework)
- [MCP Framework Docs](https://mcp-framework.com)
