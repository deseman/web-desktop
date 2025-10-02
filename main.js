import { WindowManager } from "./components/window-manager/window-manager.js";
import "./components/desktop-window/desktop-window.js";
import "./components/snap-overlay/snap-overlay.js";
import "./components/snap-debug/snap-debug.js";
import "./components/taskbar/taskbar.js";

const desktopArea = document.querySelector("desktop-area");
const snapOverlay = document.querySelector("snap-overlay");
const taskbar = document.querySelector("taskbar-bar");

export const windowManager = new WindowManager(desktopArea);
window.snapOverlay = snapOverlay;
window.taskbar = taskbar;

windowManager.createWindow("Instellingen", "<p>Instellingenvenster</p>");
windowManager.createWindow("Berichten", "<p>Berichtenvenster</p>");
