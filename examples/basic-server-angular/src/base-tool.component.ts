import { NgZone, inject, type OnInit } from "@angular/core";
import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";

export abstract class BaseToolComponent implements OnInit {
  private readonly zone = inject(NgZone);

  protected app: App | null = null;
  protected hostContext: McpUiHostContext | undefined;

  protected abstract readonly appName: string;

  async ngOnInit(): Promise<void> {
    const instance = new App({ name: this.appName, version: "1.0.0" });

    instance.onteardown = async () => {
      console.info("App is being torn down");
      return {};
    };

    instance.ontoolinput = (params) => {
      console.info("Received tool call input:", params);
    };

    instance.ontoolresult = (result) => {
      console.info("Received tool call result:", result);
      this.zone.run(() => {
        this.handleToolResult(result);
      });
    };

    instance.ontoolcancelled = (params) => {
      console.info("Tool call cancelled:", params.reason);
    };

    instance.onerror = console.error;

    instance.onhostcontextchanged = (params) => {
      this.zone.run(() => {
        this.hostContext = { ...this.hostContext, ...params };
        this.applyHostStyles();
      });
    };

    await instance.connect();
    this.zone.run(() => {
      this.app = instance;
      this.hostContext = instance.getHostContext();
      this.applyHostStyles();
    });
  }

  protected abstract handleToolResult(result: CallToolResult): void;

  protected async callTool(
    name: string,
    args: Record<string, unknown>,
  ): Promise<CallToolResult | null> {
    if (!this.app) return null;

    try {
      console.info(`Calling ${name} tool...`, args);
      const result = await this.app.callServerTool({ name, arguments: args });
      console.info(`${name} result:`, result);
      this.handleToolResult(result);
      return result;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  private applyHostStyles(): void {
    if (!this.hostContext) return;

    if (this.hostContext.theme) {
      applyDocumentTheme(this.hostContext.theme);
    }
    if (this.hostContext.styles?.variables) {
      applyHostStyleVariables(this.hostContext.styles.variables);
    }
    if (this.hostContext.styles?.css?.fonts) {
      applyHostFonts(this.hostContext.styles.css.fonts);
    }
  }
}
