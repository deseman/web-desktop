import { BaseComponent } from "../base-component.js";

export class Taskbar extends BaseComponent {
  constructor() {
    super();
    this.ready = this.loadTemplate({
      htmlPath: "./components/taskbar/taskbar.html",
      cssPath: "./components/taskbar/taskbar.css",
      templateId: "taskbar-template",
    });
    window.taskbar = this; // optioneel: globale toegang
  }

  async addWindowButton(win) {
    await this.ready;

    const btn = document.createElement("button");
    btn.textContent = win.getAttribute("title") || "Venster";

    btn.addEventListener("click", () => {
      const current = win.getAttribute("data-state");
      win.setState(current === "minimized" ? "normal" : "minimized");
    });

    win._taskbarButton = btn;
    this.shadowRoot.querySelector(".buttons").appendChild(btn);
  }
}

customElements.define("taskbar-bar", Taskbar);
