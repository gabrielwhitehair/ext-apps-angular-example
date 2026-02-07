import { bootstrapApplication } from "@angular/platform-browser";
import { EchoTextComponent } from "./echo-text.component";
import "./global.css";
import "zone.js";

bootstrapApplication(EchoTextComponent).catch((error) => {
  console.error(error);
});
