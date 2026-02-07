import { registerAppResource, registerAppTool, RESOURCE_MIME_TYPE } from "@modelcontextprotocol/ext-apps/server";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult, ReadResourceResult } from "@modelcontextprotocol/sdk/types.js";
import fs from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

// Works both from source (server.ts) and compiled (dist/server.js)
const DIST_DIR = import.meta.filename.endsWith(".ts")
  ? path.join(import.meta.dirname, "dist")
  : import.meta.dirname;

const RESOURCE_URIS = {
  "get-time": "ui://get-time/mcp-app-get-time.html",
  "echo-text": "ui://echo-text/mcp-app-echo-text.html",
  "calculate-stats": "ui://calculate-stats/mcp-app-calculate-stats.html",
  "generate-color-palette":
    "ui://generate-color-palette/mcp-app-generate-color-palette.html",
  "hrb-welcome": "ui://hrb-welcome/mcp-app-hrb-welcome.html",
} as const;
const LEGACY_GET_TIME_RESOURCE_URI = "ui://get-time/mcp-app.html";

/**
 * Creates a new MCP server instance with tools and resources registered.
 */
export function createServer(): McpServer {
  const server = new McpServer({
    name: "Basic MCP App Server (Angular)",
    version: "1.0.0",
  });

  // Register a tool with UI metadata. When the host calls this tool, it reads
  // `_meta.ui.resourceUri` to know which resource to fetch and render as an
  // interactive UI.
  registerAppTool(server,
    "get-time",
    {
      title: "Get Time",
      description: "Returns the current server time as an ISO 8601 string.",
      inputSchema: {},
      outputSchema: z.object({ time: z.string() }),
      _meta: { ui: { resourceUri: RESOURCE_URIS["get-time"] } }, // Links this tool to its UI resource
    },
    async (): Promise<CallToolResult> => {
      const time = new Date().toISOString();
      return {
        content: [{ type: "text", text: time }],
        structuredContent: { time },
      };
    },
  );

  registerAppTool(server,
    "echo-text",
    {
      title: "Echo Text",
      description: "Echoes text with optional uppercase/lowercase transform.",
      inputSchema: z.object({
        text: z.string().min(1).max(500),
        emphasis: z.enum(["none", "uppercase", "lowercase"]).default("none"),
      }),
      outputSchema: z.object({
        original: z.string(),
        transformed: z.string(),
        emphasis: z.enum(["none", "uppercase", "lowercase"]),
      }),
      _meta: { ui: { resourceUri: RESOURCE_URIS["echo-text"] } },
    },
    async ({ text, emphasis }): Promise<CallToolResult> => {
      const transformed = emphasis === "uppercase"
        ? text.toUpperCase()
        : emphasis === "lowercase"
          ? text.toLowerCase()
          : text;

      return {
        content: [{ type: "text", text: transformed }],
        structuredContent: {
          original: text,
          transformed,
          emphasis,
        },
      };
    },
  );

  registerAppTool(server,
    "calculate-stats",
    {
      title: "Calculate Stats",
      description: "Calculates summary statistics for a list of numbers.",
      inputSchema: z.object({
        numbers: z.array(z.number().finite()).min(1).max(100),
      }),
      outputSchema: z.object({
        count: z.number(),
        sum: z.number(),
        average: z.number(),
        min: z.number(),
        max: z.number(),
      }),
      _meta: { ui: { resourceUri: RESOURCE_URIS["calculate-stats"] } },
    },
    async ({ numbers }): Promise<CallToolResult> => {
      const count = numbers.length;
      const sum = numbers.reduce((acc, value) => acc + value, 0);
      const average = sum / count;
      const min = Math.min(...numbers);
      const max = Math.max(...numbers);

      return {
        content: [{
          type: "text",
          text: `count=${count}, sum=${sum}, avg=${average.toFixed(2)}, min=${min}, max=${max}`,
        }],
        structuredContent: { count, sum, average, min, max },
      };
    },
  );

  registerAppTool(server,
    "generate-color-palette",
    {
      title: "Generate Color Palette",
      description: "Generates a deterministic palette from a seed string.",
      inputSchema: z.object({
        seed: z.string().min(1).max(100),
        count: z.number().int().min(2).max(8).default(5),
      }),
      outputSchema: z.object({
        seed: z.string(),
        count: z.number(),
        colors: z.array(z.string()),
      }),
      _meta: { ui: { resourceUri: RESOURCE_URIS["generate-color-palette"] } },
    },
    async ({ seed, count }): Promise<CallToolResult> => {
      const colors = createPalette(seed, count);
      return {
        content: [{ type: "text", text: colors.join(", ") }],
        structuredContent: { seed, count, colors },
      };
    },
  );

  registerAppTool(server,
    "hrb-welcome",
    {
      title: "H&R Block Welcome",
      description: "Shows a static H&R Block welcome card.",
      inputSchema: {},
      outputSchema: z.object({ message: z.string() }),
      _meta: { ui: { resourceUri: RESOURCE_URIS["hrb-welcome"] } },
    },
    async (): Promise<CallToolResult> => {
      return {
        content: [{ type: "text", text: "Welcome to H&R Block" }],
        structuredContent: { message: "Welcome to H&R Block" },
      };
    },
  );

  // Register one UI resource per tool.
  registerHtmlResource(server, RESOURCE_URIS["get-time"], "mcp-app-get-time.html");
  // Backward-compatible alias for older cached tool metadata.
  registerHtmlResource(server, LEGACY_GET_TIME_RESOURCE_URI, "mcp-app-get-time.html");
  registerHtmlResource(server, RESOURCE_URIS["echo-text"], "mcp-app-echo-text.html");
  registerHtmlResource(server, RESOURCE_URIS["calculate-stats"], "mcp-app-calculate-stats.html");
  registerHtmlResource(server, RESOURCE_URIS["generate-color-palette"], "mcp-app-generate-color-palette.html");
  registerHtmlResource(server, RESOURCE_URIS["hrb-welcome"], "mcp-app-hrb-welcome.html");

  return server;
}

function createPalette(seed: string, count: number): string[] {
  const baseHue = hashString(seed) % 360;
  const colors: string[] = [];

  for (let i = 0; i < count; i++) {
    const hue = (baseHue + i * (360 / count)) % 360;
    const saturation = 62 + (i % 3) * 8;
    const lightness = 42 + (i % 2) * 10;
    colors.push(hslToHex(hue, saturation, lightness));
  }

  return colors;
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function hslToHex(hue: number, saturation: number, lightness: number): string {
  const s = saturation / 100;
  const l = lightness / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) {
    rPrime = c;
    gPrime = x;
  } else if (hue < 120) {
    rPrime = x;
    gPrime = c;
  } else if (hue < 180) {
    gPrime = c;
    bPrime = x;
  } else if (hue < 240) {
    gPrime = x;
    bPrime = c;
  } else if (hue < 300) {
    rPrime = x;
    bPrime = c;
  } else {
    rPrime = c;
    bPrime = x;
  }

  const toHex = (value: number): string =>
    Math.round((value + m) * 255).toString(16).padStart(2, "0");

  return `#${toHex(rPrime)}${toHex(gPrime)}${toHex(bPrime)}`;
}

function registerHtmlResource(
  server: McpServer,
  resourceUri: string,
  filename: string,
): void {
  registerAppResource(server,
    resourceUri,
    resourceUri,
    { mimeType: RESOURCE_MIME_TYPE },
    async (): Promise<ReadResourceResult> => {
      const html = await fs.readFile(path.join(DIST_DIR, filename), "utf-8");

      return {
        contents: [{ uri: resourceUri, mimeType: RESOURCE_MIME_TYPE, text: html }],
      };
    },
  );
}
