import { getSnapZones } from "../../utils/snap-zones.js";

export class SnapDebug extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    const desktopArea = document.querySelector("desktop-area");
    const zones = getSnapZones(desktopArea);

    const style = document.createElement("style");
    style.textContent = `
      .zone {
        position: absolute;
        background-color: rgba(255, 0, 0, 0.15);
        border: 1px dashed red;
        pointer-events: none;
        z-index: 9998;
      }
      .corner {
        background-color: rgba(0, 255, 0, 0.15);
        border-color: green;
      }
    `;

    this.shadowRoot.appendChild(style);

    zones.forEach((zone) => {
      const div = document.createElement("div");
      div.className = "zone" + (zone.type === "corner" ? " corner" : "");
      div.style.left = `${zone.detect.x}px`;
      div.style.top = `${zone.detect.y}px`;
      div.style.width = `${zone.detect.w}px`;
      div.style.height = `${zone.detect.h}px`;
      this.shadowRoot.appendChild(div);
    });
  }
}

customElements.define("snap-debug", SnapDebug);
