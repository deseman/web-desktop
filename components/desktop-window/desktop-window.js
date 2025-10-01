import { BaseComponent } from "../base-component.js";

export class DesktopWindow extends BaseComponent {
  constructor() {
    super();
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
      this.setState(current === "maximized" ? "normal" : "maximized");
    });

    minBtn.addEventListener("click", () => this.setState("minimized"));
    closeBtn.addEventListener("click", () => this.close());
  }

  setState(state) {
    const parent = this.parentElement;

    if (state === "maximized") {
      this._prevBounds = {
        top: this.offsetTop,
        left: this.offsetLeft,
        width: this.offsetWidth,
        height: this.offsetHeight,
      };

      this.style.setProperty("--prev-top", `${this._prevBounds.top}px`);
      this.style.setProperty("--prev-left", `${this._prevBounds.left}px`);
      this.style.setProperty("--prev-width", `${this._prevBounds.width}px`);
      this.style.setProperty("--prev-height", `${this._prevBounds.height}px`);

      this.classList.add("animating-maximize");

      setTimeout(() => {
        this.classList.remove("animating-maximize");
        this.style.top = "0px";
        this.style.left = "0px";
        this.style.width = `${parent.clientWidth}px`;
        this.style.height = `${parent.clientHeight}px`;
        this.setAttribute("data-state", "maximized");
        this.windowManager.setActive(this);
      }, 300);
    } else if (state === "normal") {
      if (this.getAttribute("data-state") === "minimized") {
        this.style.visibility = "visible";
        this.style.pointerEvents = "auto";
        this.style.opacity = "0";
        void this.offsetWidth;

        this.classList.add("animating-restore");

        setTimeout(() => {
          this.classList.remove("animating-restore");
          this.style.opacity = "1";
          this.setAttribute("data-state", "normal");
          this.windowManager.setActive(this);
        }, 300);
      } else if (this._prevBounds) {
        this.style.setProperty("--prev-top", `${this._prevBounds.top}px`);
        this.style.setProperty("--prev-left", `${this._prevBounds.left}px`);
        this.style.setProperty("--prev-width", `${this._prevBounds.width}px`);
        this.style.setProperty("--prev-height", `${this._prevBounds.height}px`);

        this.classList.add("animating-unmaximize");

        setTimeout(() => {
          this.classList.remove("animating-unmaximize");
          this.style.top = `${this._prevBounds.top}px`;
          this.style.left = `${this._prevBounds.left}px`;
          this.style.width = `${this._prevBounds.width}px`;
          this.style.height = `${this._prevBounds.height}px`;
          this.setAttribute("data-state", "normal");
          this.windowManager.setActive(this);
        }, 300);
      }
    } else if (state === "minimized") {
      this.classList.add("animating-minimize");

      setTimeout(() => {
        this.classList.remove("animating-minimize");
        this.style.opacity = "0";
        this.style.pointerEvents = "none";
        this.style.visibility = "hidden";
        this.removeAttribute("data-active");
        this.setAttribute("data-state", "minimized");
        this.windowManager.activateNext();
      }, 300);
    }
  }

  close() {
    this.windowManager.unregister(this);
    this.remove();
  }

  startDrag(e) {
    this.dragging = true;
    this.classList.remove("animated");
    this.offsetX = e.clientX - this.offsetLeft;
    this.offsetY = e.clientY - this.offsetTop;
    this.windowManager.setActive(this);
  }

  onDrag(e) {
    if (!this.dragging) return;

    const parent = this.parentElement;
    const maxLeft = parent.clientWidth - this.offsetWidth;
    const maxTop = parent.clientHeight - this.offsetHeight;

    let newLeft = e.clientX - this.offsetX;
    let newTop = e.clientY - this.offsetY;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    this.style.left = `${newLeft}px`;
    this.style.top = `${newTop}px`;
  }

  endDrag() {
    this.dragging = false;
  }

  enforceBounds() {
    if (this.style.visibility === "hidden") return;
    if (!this.parentElement) return;

    const parent = this.parentElement;
    const maxWidth = parent.clientWidth - this.offsetLeft;
    const maxHeight = parent.clientHeight - this.offsetTop;

    const minWidth = parseInt(getComputedStyle(this).minWidth);
    const minHeight = parseInt(getComputedStyle(this).minHeight);

    const newWidth = Math.max(minWidth, Math.min(this.offsetWidth, maxWidth));
    const newHeight = Math.max(
      minHeight,
      Math.min(this.offsetHeight, maxHeight)
    );

    this.style.width = `${newWidth}px`;
    this.style.height = `${newHeight}px`;
  }

  connectedCallback() {
    this.setAttribute("data-state", "normal");
    this.windowManager.register(this);

    if (!this.style.width) this.style.width = "320px";
    if (!this.style.height) this.style.height = "240px";

    this.resizeObserver = new ResizeObserver(() => this.enforceBounds());
    this.resizeObserver.observe(this);
  }

  disconnectedCallback() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    this.windowManager.unregister(this);
  }
}

customElements.define("desktop-window", DesktopWindow);
