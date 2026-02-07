import { bootstrapApplication } from "@angular/platform-browser";
import { CalculateStatsComponent } from "./calculate-stats.component";
import "./global.css";
import "zone.js";

bootstrapApplication(CalculateStatsComponent).catch((error) => {
  console.error(error);
});
