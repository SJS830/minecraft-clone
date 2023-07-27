import * as THREE from "three";
import { emitter } from "./EventEmitter";

export let scene: THREE.Scene;
export let camera: THREE.PerspectiveCamera;
export let renderer: THREE.WebGLRenderer;

export function initRenderer() {
  scene = new THREE.Scene();

  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.querySelector("#app")!.appendChild(renderer.domElement);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  let clock = new THREE.Clock();

  function animate() {
    emitter.emit("tick", clock.getDelta());
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  /*emitter.on("tick", (delta) => {
    console.log(`${(1 / delta).toFixed(2)}fps`);
  });*/

  animate();
}
