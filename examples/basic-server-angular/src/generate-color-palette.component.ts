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
        <p><strong>Generate Color Palette</strong></p>
        <input type="text" [(ngModel)]="seed" />
        <input type="number" min="2" max="8" [(ngModel)]="count" />
        <button type="button" (click)="handleGenerate()">Generate Palette</button>
      </section>

      <section class="result" *ngIf="colors.length > 0">
        <div class="swatches">
          <div *ngFor="let color of colors" class="swatch">
            <span class="swatch-chip" [style.background-color]="color"></span>
            <code>{{ color }}</code>
          </div>
        </div>
        <details *ngIf="lastStructuredContentJson">
          <summary>Structured Result JSON</summary>
          <pre>{{ lastStructuredContentJson }}</pre>
        </details>
      </section>
    </main>
  `,
})
export class GenerateColorPaletteComponent extends BaseToolComponent {
  protected readonly appName = "Generate Color Palette App";
  protected seed = "mcp-angular";
  protected count = 5;
  protected colors: string[] = [];
  protected lastStructuredContentJson = "";

  protected handleToolResult(result: CallToolResult): void {
    const structured = result.structuredContent as { colors?: unknown } | undefined;
    const candidate = structured?.colors;
    this.colors = Array.isArray(candidate)
      ? candidate.filter((value): value is string => typeof value === "string")
      : [];
    this.lastStructuredContentJson = structured
      ? JSON.stringify(structured, null, 2)
      : "";
  }

  protected async handleGenerate(): Promise<void> {
    const result = await this.callTool("generate-color-palette", {
      seed: this.seed,
      count: Number(this.count),
    });

    if (!result) {
      this.colors = [];
      this.lastStructuredContentJson = "";
    }
  }
}
