import Minecraft from "/Minecraft.js";

import { PointerLockControls } from "@three/controls/PointerLockControls.js";

export default class Input {
  fpsControls;
  pressedKeys;

  attach(renderer) {
    this.fpsControls = new PointerLockControls(renderer.camera, renderer.renderer.domElement);
    renderer.scene.add(this.fpsControls.getObject());

    this.pressedKeys = {};

    document.addEventListener("click", (event) => {
      if (document.pointerLockElement !== renderer.renderer.domElement) {
        renderer.renderer.domElement.requestPointerLock();
        return;
      }

      Minecraft.getEventHandler().emit("mouse_click", event.button)
    });

    document.addEventListener("keydown", (event) => {
      this.pressedKeys[event.code] = true;
      Minecraft.getEventHandler().emit("key_down", event.code);
    });

    document.addEventListener("keyup", (event) => {
      this.pressedKeys[event.code] = false;
      Minecraft.getEventHandler().emit("key_up", event.code);
    });
  }
}
