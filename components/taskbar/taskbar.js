import { BaseComponent } from "../base-component.js";

export class Taskbar extends BaseComponent {
  constructor() {
    super();
    this.ready = this.loadTemplate({
      htmlPath: "./components/taskbar/taskbar.html",
      cssPath: "./components/taskbar/taskbar.css",
      templateId: "taskbar-template",
    });

    window.addEventListener("window-state-change", (e) => {
      const win = e.detail.window || e.target;
      const state = e.detail.state;

      if (win._taskbarButton) {
        win._taskbarButton.classList.toggle("active", state === "normal");
        win._taskbarButton.classList.toggle("hidden", state === "minimized");
      }
    });
  }

  async addWindowButton(win) {
    await this.ready;

    const btn = document.createElement("button");
    btn.textContent = win.getAttribute("title") || "Venster";

    btn.addEventListener("click", () => {
      const current = win.getAttribute("data-state");
      win.dispatchEvent(
        new CustomEvent("window-state-change", {
          detail: {
            state: current === "minimized" ? "normal" : "minimized",
            window: win,
          },
          bubbles: true,
          composed: true,
        })
      );
    });

    win._taskbarButton = btn;
    this.shadowRoot.querySelector(".buttons").appendChild(btn);
  }
}

customElements.define("taskbar-bar", Taskbar);
