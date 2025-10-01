export class WindowManager {
  constructor(desktopArea = null) {
    this.desktopArea = desktopArea;
    this.windows = [];
  }

  register(win) {
    this.windows.push(win);
  }

  unregister(win) {
    this.windows = this.windows.filter((w) => w !== win);
  }

  setActive(win) {
    this.windows.forEach((w) => {
      w.removeAttribute("data-active");
      if (w._taskbarButton) w._taskbarButton.classList.remove("active");
    });

    win.setAttribute("data-active", "");
    if (win._taskbarButton) win._taskbarButton.classList.add("active");
  }

  activateNext() {
    const candidates = this.windows.filter(
      (w) => w.getAttribute("data-state") !== "minimized"
    );
    if (candidates.length > 0) {
      const top = candidates[candidates.length - 1];
      this.setActive(top);
    }
  }

  bringToFront(win) {
    this.setActive(win);
    win.style.zIndex = this._nextZ();
  }

  _nextZ() {
    return 100 + this.windows.length;
  }

  createWindow(title, content, options = {}) {
    const win = document.createElement("desktop-window");

    win.setAttribute("title", title);
    if (options.id) win.id = options.id;
    if (options.class) win.classList.add(options.class);
    win.innerHTML = content;

    // Geef windowManager mee
    win.windowManager = this;

    const parent = options.parent || this.desktopArea || document.body;
    const offset = this.windows.length * 20; // spreiding
    const x = parent.clientWidth / 2 - 160 + offset;
    const y = parent.clientHeight / 2 - 120 + offset;

    win.style.left = `${x}px`;
    win.style.top = `${y}px`;
    parent.appendChild(win);

    this.register(win);
    this.setActive(win);
    if (window.taskbar) {
      window.taskbar.addWindowButton(win);
    }

    return win;
  }
}
