import { Component, ChangeDetectionStrategy } from "@angular/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseToolComponent } from "./base-tool.component";
import "./mcp-app.css";

function extractTime(result: CallToolResult): string {
  const { text } = result.content?.find((c) => c.type === "text")!;
  return text;
}

@Component({
  selector: "app-root",
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main
      class="main"
      [style.padding-top.px]="hostContext?.safeAreaInsets?.top ?? null"
      [style.padding-right.px]="hostContext?.safeAreaInsets?.right ?? null"
      [style.padding-bottom.px]="hostContext?.safeAreaInsets?.bottom ?? null"
      [style.padding-left.px]="hostContext?.safeAreaInsets?.left ?? null"
    >
      <p class="notice">Watch activity in the DevTools console!</p>

      <div class="action">
        <p>
          <strong>Server Time:</strong>
          <code class="server-time">{{ serverTime }}</code>
        </p>
        <button type="button" (click)="handleGetTime()">Get Server Time</button>
      </div>
    </main>
  `,
})
export class GetTimeComponent extends BaseToolComponent {
  protected readonly appName = "Get Time App";
  protected serverTime = "Loading...";

  protected handleToolResult(result: CallToolResult): void {
    const structured = result.structuredContent as { time?: string } | undefined;
    this.serverTime = structured?.time ?? extractTime(result);
  }

  protected async handleGetTime(): Promise<void> {
    const result = await this.callTool("get-time", {});
    if (!result) {
      this.serverTime = "[ERROR]";
    }
  }
}
