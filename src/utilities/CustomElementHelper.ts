export default function Define(name: string, element: CustomElementConstructor): CustomElementConstructor {
  customElements.get(name) ||
    customElements.define(name, element, {
      extends: 'div',
    });
  return customElements.get(name) || element;
}

export abstract class CustomHTMLElement extends HTMLDivElement {
  abstract initialize(...args: any[]): void;
}
