import { Component, ChangeDetectionStrategy } from "@angular/core";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseToolComponent } from "./base-tool.component";
import "./mcp-app.css";

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
      <section class="hrb-card">
        <div class="hrb-logo" aria-label="H&R Block logo">H&R</div>
        <h2>Welcome to H&amp;R Block</h2>
      </section>
    </main>
  `,
})
export class HrbWelcomeComponent extends BaseToolComponent {
  protected readonly appName = "H&R Block Welcome App";

  protected handleToolResult(_result: CallToolResult): void {
    // No-op: this UI is intentionally static.
  }
}
