import { bootstrapApplication } from "@angular/platform-browser";
import { HrbWelcomeComponent } from "./hrb-welcome.component";
import "./global.css";
import "zone.js";

bootstrapApplication(HrbWelcomeComponent).catch((error) => {
  console.error(error);
});
