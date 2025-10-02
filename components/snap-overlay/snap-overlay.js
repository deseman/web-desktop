export class SnapOverlay extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });

    const style = document.createElement("style");
    style.textContent = `
      :host {
        position: absolute;
        pointer-events: none;
        background-color: rgba(0, 120, 215, 0.3);
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.2s ease;
        z-index: 9999;
      }
    `;

    this.shadowRoot.appendChild(style);
  }

  show(x, y, w, h) {
    this.style.left = `${x}px`;
    this.style.top = `${y}px`;
    this.style.width = `${w}px`;
    this.style.height = `${h}px`;
    this.style.opacity = "1";
  }

  hide() {
    this.style.opacity = "0";
  }
}

customElements.define("snap-overlay", SnapOverlay);
