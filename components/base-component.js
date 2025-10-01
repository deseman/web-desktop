export class BaseComponent extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async loadTemplate({ htmlPath, cssPath, templateId }) {
    const [html, css] = await Promise.all([
      fetch(htmlPath).then((res) => res.text()),
      fetch(cssPath).then((res) => res.text()),
    ]);

    const style = document.createElement("style");
    style.textContent = css;

    const tempContainer = document.createElement("div");
    tempContainer.innerHTML = html;

    const template = tempContainer.querySelector(
      templateId ? `#${templateId}` : "template"
    );
    const clone = template.content.cloneNode(true);

    this.shadowRoot.appendChild(style);
    this.shadowRoot.appendChild(clone);
  }
}
