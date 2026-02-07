import { bootstrapApplication } from "@angular/platform-browser";
import { GenerateColorPaletteComponent } from "./generate-color-palette.component";
import "./global.css";
import "zone.js";

bootstrapApplication(GenerateColorPaletteComponent).catch((error) => {
  console.error(error);
});
