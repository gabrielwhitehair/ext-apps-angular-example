import { CommonModule } from "@angular/common";
import { Component, ChangeDetectionStrategy } from "@angular/core";
import { FormsModule } from "@angular/forms";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BaseToolComponent } from "./base-tool.component";
import "./mcp-app.css";

interface StatsResult {
  average: number;
  count: number;
  max: number;
  min: number;
  sum: number;
}

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
        <p><strong>Calculate Stats</strong></p>
        <input type="text" [(ngModel)]="numbersText" />
        <button type="button" (click)="handleCalculate()">Calculate Stats</button>
      </section>

      <section class="result" *ngIf="statsResult">
        <div class="stats-grid">
          <p><strong>Count:</strong> {{ statsResult.count }}</p>
          <p><strong>Sum:</strong> {{ statsResult.sum }}</p>
          <p><strong>Average:</strong> {{ statsResult.average.toFixed(2) }}</p>
          <p><strong>Min:</strong> {{ statsResult.min }}</p>
          <p><strong>Max:</strong> {{ statsResult.max }}</p>
        </div>
        <details *ngIf="lastStructuredContentJson">
          <summary>Structured Result JSON</summary>
          <pre>{{ lastStructuredContentJson }}</pre>
        </details>
      </section>
    </main>
  `,
})
export class CalculateStatsComponent extends BaseToolComponent {
  protected readonly appName = "Calculate Stats App";
  protected numbersText = "5, 10, 15, 20";
  protected statsResult: StatsResult | null = null;
  protected lastStructuredContentJson = "";

  protected handleToolResult(result: CallToolResult): void {
    const structured = result.structuredContent;
    this.statsResult = isStatsResult(structured) ? structured : null;
    this.lastStructuredContentJson = structured
      ? JSON.stringify(structured, null, 2)
      : "";
  }

  protected async handleCalculate(): Promise<void> {
    try {
      const result = await this.callTool("calculate-stats", {
        numbers: parseNumbers(this.numbersText),
      });
      if (!result) {
        this.statsResult = null;
        this.lastStructuredContentJson = "";
      }
    } catch (error) {
      console.error(error);
      this.statsResult = null;
      this.lastStructuredContentJson = "";
    }
  }
}

function parseNumbers(input: string): number[] {
  const numbers = input
    .split(",")
    .map((part) => Number(part.trim()))
    .filter((value) => Number.isFinite(value));

  if (numbers.length === 0) {
    throw new Error("Enter at least one valid number.");
  }

  return numbers;
}

function isStatsResult(value: unknown): value is StatsResult {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;
  return (
    typeof record.count === "number" &&
    typeof record.sum === "number" &&
    typeof record.average === "number" &&
    typeof record.min === "number" &&
    typeof record.max === "number"
  );
}
