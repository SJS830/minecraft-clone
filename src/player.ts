import * as THREE from "three";
import { emitter } from "./EventEmitter";
import { pressedKeys } from "./inputController";
import { camera } from "./renderer";

export const player = {
  pos: new THREE.Vector3(0, 20, 0),
  vel: new THREE.Vector3(0, 0, 0),
  dir: new THREE.Euler(0, 0, 0, "YXZ"),
};

export function initPlayerControls() {
  emitter.on("tick", (delta) => {
    let movement = new THREE.Vector3();

    if (pressedKeys["KeyW"]) {
      movement.z -= 1;
    }
    if (pressedKeys["KeyS"]) {
      movement.z += 1;
    }
    if (pressedKeys["KeyA"]) {
      movement.x -= 1;
    }
    if (pressedKeys["KeyD"]) {
      movement.x += 1;
    }

    movement = movement.applyEuler(player.dir).setLength(delta * 10);
    player.pos.add(movement);

    camera.position.copy(player.pos);
    camera.rotation.copy(player.dir);
  });
}