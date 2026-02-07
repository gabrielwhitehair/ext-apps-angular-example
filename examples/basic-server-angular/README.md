# Example: Basic Server (Angular)

An MCP App example with an Angular UI.

> [!TIP]
> Looking for a vanilla JavaScript example? See [`basic-server-vanillajs`](https://github.com/modelcontextprotocol/ext-apps/tree/main/examples/basic-server-vanillajs)!

## MCP Client Configuration

Add to your MCP client configuration (stdio transport):

```json
{
  "mcpServers": {
    "basic-angular": {
      "command": "npx",
      "args": [
        "-y",
        "--silent",
        "--registry=https://registry.npmjs.org/",
        "@modelcontextprotocol/server-basic-angular",
        "--stdio"
      ]
    }
  }
}
```

### Local Development

To test local modifications, use this configuration (replace `~/code/ext-apps` with your clone path):

```json
{
  "mcpServers": {
    "basic-angular": {
      "command": "bash",
      "args": [
        "-c",
        "cd ~/code/ext-apps/examples/basic-server-angular && npm run build >&2 && node dist/index.js --stdio"
      ]
    }
  }
}
```

## Overview

- Multiple tool registrations, each linked to its own UI resource:
  - `get-time` -> `ui://get-time/mcp-app-get-time.html`
  - `echo-text` -> `ui://echo-text/mcp-app-echo-text.html`
  - `calculate-stats` -> `ui://calculate-stats/mcp-app-calculate-stats.html`
  - `generate-color-palette` -> `ui://generate-color-palette/mcp-app-generate-color-palette.html`
  - `hrb-welcome` -> `ui://hrb-welcome/mcp-app-hrb-welcome.html`
- Angular UI using the [`App`](https://modelcontextprotocol.github.io/ext-apps/api/classes/app.App.html) class
- App communication APIs: [`callServerTool`](https://modelcontextprotocol.github.io/ext-apps/api/classes/app.App.html#callservertool), [`sendMessage`](https://modelcontextprotocol.github.io/ext-apps/api/classes/app.App.html#sendmessage), [`sendLog`](https://modelcontextprotocol.github.io/ext-apps/api/classes/app.App.html#sendlog), [`openLink`](https://modelcontextprotocol.github.io/ext-apps/api/classes/app.App.html#openlink)

## Key Files

- [`server.ts`](server.ts) - MCP server with tool and resource registration
- [`mcp-app-get-time.html`](mcp-app-get-time.html) / [`src/get-time.component.ts`](src/get-time.component.ts) - Get Time UI
- [`mcp-app-echo-text.html`](mcp-app-echo-text.html) / [`src/echo-text.component.ts`](src/echo-text.component.ts) - Echo Text UI
- [`mcp-app-calculate-stats.html`](mcp-app-calculate-stats.html) / [`src/calculate-stats.component.ts`](src/calculate-stats.component.ts) - Calculate Stats UI
- [`mcp-app-generate-color-palette.html`](mcp-app-generate-color-palette.html) / [`src/generate-color-palette.component.ts`](src/generate-color-palette.component.ts) - Color Palette UI
- [`mcp-app-hrb-welcome.html`](mcp-app-hrb-welcome.html) / [`src/hrb-welcome.component.ts`](src/hrb-welcome.component.ts) - Static H&R Block welcome UI

## Getting Started

```bash
npm install
npm run dev
```

## How It Works

1. The server registers each tool with metadata linking it to a distinct UI HTML resource.
2. When the tool is invoked, the Host renders the UI from the resource.
3. The UI uses the MCP App SDK API to communicate with the host and call server tools.

## Build System

This example bundles each UI into its own single HTML file using Vite with `vite-plugin-singlefile` - see [`vite.config.ts`](vite.config.ts). This allows UI content to be served as MCP resources with one HTML bundle per tool. Alternatively, MCP apps can load external resources by defining [`_meta.ui.csp.resourceDomains`](https://modelcontextprotocol.github.io/ext-apps/api/interfaces/app.McpUiResourceCsp.html#resourcedomains) in the UI resource metadata.
