import { BaseComponent } from "../base-component.js";

export class DesktopArea extends BaseComponent {
  constructor() {
    super();
    this.loadTemplate();
  }

  async loadTemplate() {
    const [html, css] = await Promise.all([
      fetch("./components/desktop-area/desktop-area.html").then((res) =>
        res.text()
      ),
      fetch("./components/desktop-area/desktop-area.css").then((res) =>
        res.text()
      ),
    ]);

    const style = document.createElement("style");
    style.textContent = css;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = html;

    const template = tempContainer.querySelector("template");
    const clone = template.content.cloneNode(true);

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(clone);
  }
}

customElements.define("desktop-area", DesktopArea);
