import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseToolComponent } from "./base-tool.component";
import "./mcp-app.css";

@Component({
  selector: "app-root",
  imports: [CommonModule, FormsModule],
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

      <section class="action advanced">
        <p><strong>Echo Text</strong></p>
        <textarea [(ngModel)]="text"></textarea>
        <select [(ngModel)]="emphasis">
          <option value="none">none</option>
          <option value="uppercase">uppercase</option>
          <option value="lowercase">lowercase</option>
        </select>
        <button type="button" (click)="handleEcho()">Echo Text</button>
      </section>

      <section class="result">
        <p><strong>Transformed:</strong> <code>{{ transformedText }}</code></p>
        <details *ngIf="lastStructuredContentJson">
          <summary>Structured Result JSON</summary>
          <pre>{{ lastStructuredContentJson }}</pre>
        </details>
      </section>
    </main>
  `,
})
export class EchoTextComponent extends BaseToolComponent {
  protected readonly appName = "Echo Text App";
  protected text = "Hello from Angular MCP app";
  protected emphasis: "none" | "uppercase" | "lowercase" = "none";
  protected transformedText = "";
  protected lastStructuredContentJson = "";

  protected handleToolResult(result: CallToolResult): void {
    const textBlock = result.content?.find((content) => content.type === "text");
    this.transformedText = textBlock?.type === "text" ? textBlock.text : "";
    this.lastStructuredContentJson = result.structuredContent
      ? JSON.stringify(result.structuredContent, null, 2)
      : "";
  }

  protected async handleEcho(): Promise<void> {
    const result = await this.callTool("echo-text", {
      text: this.text,
      emphasis: this.emphasis,
    });

    if (!result) {
      this.transformedText = "[ERROR]";
      this.lastStructuredContentJson = "";
    }
  }
}
