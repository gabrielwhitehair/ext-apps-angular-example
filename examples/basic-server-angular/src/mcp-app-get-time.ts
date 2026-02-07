import { bootstrapApplication } from "@angular/platform-browser";
import { GetTimeComponent } from "./get-time.component";
import "./global.css";
import "zone.js";

bootstrapApplication(GetTimeComponent).catch((error) => {
  console.error(error);
});
