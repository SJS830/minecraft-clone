import Minecraft from "/Minecraft.js";
import { textures } from "/renderer/TextureManager.js";

export default class HotBar {
  hotbar;
  hotbar_slots = [];
  hotbar_images = [];

  slots = [];
  slot = 0;

  init() {
    this.hotbar = document.createElement("div");
    this.hotbar.style.cssText = `
      position: absolute;
      left: 50%;
      bottom: 1.5vh;
      transform: translate(-50%, -50%);
      display: flex;
    `;

    for (let i = 0; i < 10; i++) {
      let slot = document.createElement("div");
      slot.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #32323280;
        margin: 2px;
      `;

      let image = document.createElement("img");
      image.style.cssText = `
        width: 32px;
        height: 32px;
        margin-left: 4px;
        margin-top: 4px;
      `;

      this.hotbar_slots.push(slot);
      this.hotbar_images.push(image);

      slot.appendChild(image);
      this.hotbar.appendChild(slot);
    }

    document.body.appendChild(this.hotbar);

    document.addEventListener("wheel", event => {
      if (event.deltaY > 0) {
        this.slot++;
      } else {
        this.slot--;
      }

      this.updateHighlight();
    });

    document.addEventListener("keyup", (event) => {
      if (Minecraft.getInstance().ChatBoxGui.isTyping()) {
        return;
      }

      if (!(["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"].includes(event.code.slice(-1)))) {
        return;
      }

      this.slot = parseInt(event.code.slice(-1)) - 1;
      this.updateHighlight()
    });

    this.updateHighlight();

    setTimeout(() => {
      for (let x = 1; x <= 10; x++) {
        this.setHotbarSlot(x - 1, x);
      }
    }, 1000);
  }

  getHotbarSlot() {
    return ((this.slot % 10) + 10) % 10;
  }

  getSlot(slot) {
    return this.slots[slot];
  }

  setHotbarSlot(slot, item) {
    this.slots[slot] = item;

    this.hotbar_images[slot].src = textures[item]["0 1 0"];
  }

  updateHighlight() {
    Array.from(this.hotbar_slots).forEach(x => {
      x.style.backgroundColor = "#32323280";
    });

    this.hotbar_slots[this.getHotbarSlot()].style.backgroundColor = "#ffffff80";
  }
}
