export default class Crosshair {
  crosshair;

  init() {
    this.crosshair = document.createElement("b");
    this.crosshair.innerText = "+";
    this.crosshair.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      z-index: 100;
      color: white;
      transform: translate(-50%, -50%);
      font-size: 50;
    `;

    document.body.appendChild(this.crosshair);
  }
}
