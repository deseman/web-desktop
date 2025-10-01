import { WindowManager } from "./components/window-manager/window-manager.js";
import "./components/desktop-window/desktop-window.js";
import "./components/taskbar/taskbar.js";

// Verwijzingen naar bestaande elementen in index.html
const desktopArea = document.querySelector("desktop-area");
const taskbar = document.querySelector("taskbar-bar");

// Initialiseer windowManager met desktopArea
export const windowManager = new WindowManager(desktopArea);

// Maak taskbar globaal beschikbaar (optioneel)
window.taskbar = taskbar;

// Voorbeeldvensters
windowManager.createWindow("Instellingen", "<p>Instellingenvenster</p>");
windowManager.createWindow("Berichten", "<p>Berichtenvenster</p>");
