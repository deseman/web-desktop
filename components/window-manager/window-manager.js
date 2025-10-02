import { getSnapZones } from "../../utils/snap-zones.js";

export class WindowManager {
  constructor(desktopArea) {
    this.desktopArea = desktopArea;
    this.windows = [];

    desktopArea.addEventListener("window-state-change", (e) =>
      this.handleStateChange(e.detail)
    );
    desktopArea.addEventListener("window-drag-move", (e) =>
      this.onDrag(e.detail)
    );
    desktopArea.addEventListener("window-drag-end", (e) =>
      this.endDrag(e.detail)
    );
    desktopArea.addEventListener("window-unsnap", (e) => this.unsnap(e.detail));
  }

  register(win) {
    this.windows.push(win);
    win.windowManager = this;
    if (window.taskbar) {
      window.taskbar.addWindowButton(win);
    }
  }

  unregister(win) {
    this.windows = this.windows.filter((w) => w !== win);
  }

  createWindow(title, contentHTML) {
    const win = document.createElement("desktop-window");
    win.setAttribute("title", title);
    win.innerHTML = contentHTML;
    this.desktopArea.appendChild(win);
    this.register(win);
    return win;
  }

  handleStateChange({ window: win, state, position }) {
    console.log("handleStateChange", win, state, position);
    if (!this.windows.includes(win)) this.register(win);

    if (state === "restore") {
      const current = win.getAttribute("data-state");
      if (
        (current === "maximized" || current === "minimized") &&
        win._prevBounds
      ) {
        win.style.top = `${win._prevBounds.top}px`;
        win.style.left = `${win._prevBounds.left}px`;
        win.style.width = `${win._prevBounds.width}px`;
        win.style.height = `${win._prevBounds.height}px`;
        win.style.visibility = "visible";
        win.style.pointerEvents = "auto";
        win.style.opacity = "1";
        win.setAttribute("data-state", "normal");
        this.setActive(win);
      }
    }

    if (state === "normal") {
      win.style.visibility = "visible";
      win.style.pointerEvents = "auto";
      win.style.opacity = "1";
      win.setAttribute("data-state", "normal");
      this.setActive(win);
    }

    if (state === "minimized") {
      win.style.opacity = "0";
      win.style.pointerEvents = "none";
      win.style.visibility = "hidden";
      win.setAttribute("data-state", "minimized");
      this.activateNext();
    }

    if (state === "active") {
      this.setActive(win);
    }

    if (state === "snapped" && position) {
      win._prevBounds = {
        top: win.offsetTop,
        left: win.offsetLeft,
        width: win.offsetWidth,
        height: win.offsetHeight,
      };

      const parent = this.desktopArea;
      const halfW = parent.clientWidth / 2;
      const halfH = parent.clientHeight / 2;

      const positions = {
        left: [0, 0, halfW, parent.clientHeight],
        right: [halfW, 0, halfW, parent.clientHeight],
        top: [0, 0, parent.clientWidth, halfH],
        bottom: [0, halfH, parent.clientWidth, halfH],
        topleft: [0, 0, halfW, halfH],
        topright: [halfW, 0, halfW, halfH],
        bottomleft: [0, halfH, halfW, halfH],
        bottomright: [halfW, halfH, halfW, halfH],
      };

      const [x, y, w, h] = positions[position];
      win.style.left = `${x}px`;
      win.style.top = `${y}px`;
      win.style.width = `${w}px`;
      win.style.height = `${h}px`;
      win.setAttribute("data-state", "snapped");
    }

    if (state === "maximized") {
      win._prevBounds = {
        top: win.offsetTop,
        left: win.offsetLeft,
        width: win.offsetWidth,
        height: win.offsetHeight,
      };

      win.style.top = "0px";
      win.style.left = "0px";
      win.style.width = `${this.desktopArea.clientWidth}px`;
      win.style.height = `${this.desktopArea.clientHeight}px`;
      win.setAttribute("data-state", "maximized");
      this.setActive(win);
    }
  }

  onDrag({ window: win, clientX, clientY }) {
    if (!win.offsetX || !win.offsetY) return;

    const parent = this.desktopArea;
    const maxLeft = parent.clientWidth - win.offsetWidth;
    const maxTop = parent.clientHeight - win.offsetHeight;

    let newLeft = clientX - win.offsetX;
    let newTop = clientY - win.offsetY;

    newLeft = Math.max(0, Math.min(newLeft, maxLeft));
    newTop = Math.max(0, Math.min(newTop, maxTop));

    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;

    const zones = getSnapZones(parent);
    const matched = zones.find(
      (z) =>
        clientX >= z.detect.x &&
        clientX <= z.detect.x + z.detect.w &&
        clientY >= z.detect.y &&
        clientY <= z.detect.y + z.detect.h
    );

    if (matched) {
      const s = matched.snap;
      window.snapOverlay.show(s.x, s.y, s.w, s.h);
    } else {
      window.snapOverlay.hide();
    }
  }

  endDrag({ window: win, clientX, clientY }) {
    const zones = getSnapZones(this.desktopArea);
    window.snapOverlay.hide();

    const matched = zones.find(
      (z) =>
        clientX >= z.x &&
        clientX <= z.x + z.w &&
        clientY >= z.y &&
        clientY <= z.y + z.h
    );

    if (matched) {
      win.dispatchEvent(
        new CustomEvent("window-state-change", {
          detail: {
            state: "snapped",
            position: matched.position,
            window: win,
          },
          bubbles: true,
          composed: true,
        })
      );
    } else if (win.getAttribute("data-state") !== "normal") {
      win.dispatchEvent(
        new CustomEvent("window-state-change", {
          detail: { state: "normal", window: win },
          bubbles: true,
          composed: true,
        })
      );
    }
  }

  setActive(win) {
    this.windows.forEach((w) => w.removeAttribute("data-active"));
    win.setAttribute("data-active", "true");
  }

  activateNext() {
    const visibleWindows = this.windows.filter(
      (w) => w.getAttribute("data-state") !== "minimized"
    );
    const topmost = visibleWindows[visibleWindows.length - 1];
    if (topmost) this.setActive(topmost);
  }

  unsnap({ window: win, clientX, clientY }) {
    const bounds = win._prevBounds;
    if (!bounds) return;

    const titlebar = win.shadowRoot?.querySelector(".titlebar");
    const titlebarHeight = titlebar?.offsetHeight || 32;

    const newLeft = clientX - bounds.width / 2;
    const newTop = clientY - titlebarHeight / 2;

    win.style.width = `${bounds.width}px`;
    win.style.height = `${bounds.height}px`;
    win.style.left = `${newLeft}px`;
    win.style.top = `${newTop}px`;

    win.setAttribute("data-state", "normal");
    this.setActive(win);

    // 🔧 update drag offset direct
    win.offsetX = clientX - newLeft;
    win.offsetY = clientY - newTop;
  }
}
