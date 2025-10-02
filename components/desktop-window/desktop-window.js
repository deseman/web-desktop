import { BaseComponent } from "../base-component.js";

export class DesktopWindow extends BaseComponent {
  constructor() {
    super();
    this.dragThreshold = 5;
    this.hasDragged = false;
    this.ready = this.loadTemplate({
      htmlPath: "./components/desktop-window/desktop-window.html",
      cssPath: "./components/desktop-window/desktop-window.css",
      templateId: "desktop-window-template",
    }).then(() => this.setupEvents());
  }

  setupEvents() {
    const shadow = this.shadowRoot;
    const titlebar = shadow.querySelector(".titlebar");
    const title = shadow.querySelector(".title");
    const maxBtn = shadow.querySelector("#max");
    const minBtn = shadow.querySelector("#min");
    const closeBtn = shadow.querySelector("#close");

    title.textContent = this.getAttribute("title") || "Venster";

    titlebar.addEventListener("mousedown", this.startDrag.bind(this));
    window.addEventListener("mousemove", this.onDrag.bind(this));
    window.addEventListener("mouseup", this.endDrag.bind(this));

    maxBtn.addEventListener("click", () => {
      const current = this.getAttribute("data-state");
      if (current === "maximized") {
        this.notifyState("restore");
      } else {
        this.notifyState("maximized");
      }
    });

    minBtn.addEventListener("click", () => {
      const current = this.getAttribute("data-state");
      if (current === "minimized") {
        this.notifyState("restore");
      } else {
        this.notifyState("minimized");
      }
    });
    closeBtn.addEventListener("click", () => this.remove());
  }

  notifyState(state, extra = {}) {
    this.dispatchEvent(
      new CustomEvent("window-state-change", {
        detail: { state, window: this, ...extra },
        bubbles: true,
        composed: true,
      })
    );
  }

  startDrag(e) {
    this.dragging = true;
    this.hasDragged = false;
    this.startX = e.clientX;
    this.startY = e.clientY;
    this.offsetX = e.clientX - this.offsetLeft;
    this.offsetY = e.clientY - this.offsetTop;

    const current = this.getAttribute("data-state");

    if (current === "snapped") {
      this.dispatchEvent(
        new CustomEvent("window-unsnap", {
          detail: { window: this, clientX: e.clientX, clientY: e.clientY },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  onDrag(e) {
    if (!this.dragging) return;

    const dx = Math.abs(e.clientX - this.startX);
    const dy = Math.abs(e.clientY - this.startY);

    if (dx > this.dragThreshold || dy > this.dragThreshold) {
      this.hasDragged = true;

      this.dispatchEvent(
        new CustomEvent("window-drag-move", {
          detail: { window: this, clientX: e.clientX, clientY: e.clientY },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  endDrag(e) {
    if (!this.dragging) return;
    this.dragging = false;

    if (!this.hasDragged) return;

    this.dispatchEvent(
      new CustomEvent("window-drag-end", {
        detail: { window: this, clientX: e.clientX, clientY: e.clientY },
        bubbles: true,
        composed: true,
      })
    );
  }

  connectedCallback() {
    this.setAttribute("data-state", "normal");
    if (!this.style.width) this.style.width = "320px";
    if (!this.style.height) this.style.height = "240px";
  }
}

customElements.define("desktop-window", DesktopWindow);
