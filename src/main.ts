import "./style.css";
import { initRenderer } from "./renderer";
import { initGenerationLoop } from "./world";
import { initPlayerControls } from "./player";

initRenderer();
initGenerationLoop();
initPlayerControls();