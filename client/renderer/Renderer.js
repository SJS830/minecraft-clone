import * as THREE from "three";

import { EffectComposer } from "@three/postprocessing/EffectComposer.js";
import { RenderPass } from "@three/postprocessing/RenderPass.js";
import { ShaderPass } from "@three/postprocessing/ShaderPass.js";
import { FXAAShader } from "@three/shaders/FXAAShader.js";
import { CopyShader } from "@three/shaders/CopyShader.js";

export default class Renderer {
  scene;
  camera;
  renderer;
  effectComposer;

  createRenderer() {
    let scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);

    let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    let renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);

    let fxaaPass = new ShaderPass(FXAAShader);
    fxaaPass.material.uniforms["resolution"].value.x = 1 / (window.innerWidth * renderer.getPixelRatio());
    fxaaPass.material.uniforms["resolution"].value.y = 1 / (window.innerHeight * renderer.getPixelRatio());

    let effectComposer = new EffectComposer(renderer);
    effectComposer.addPass(new RenderPass(scene, camera));
    effectComposer.addPass(fxaaPass);

    window.addEventListener("resize", () =>{
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      fxaaPass.material.uniforms["resolution"].value.x = 1 / (window.innerWidth * renderer.getPixelRatio());
      fxaaPass.material.uniforms["resolution"].value.y = 1 / (window.innerHeight * renderer.getPixelRatio());
    });

    let stats = new Stats();
    window.document.body.appendChild(stats.domElement);
    window.document.body.appendChild(renderer.domElement);

    function animate() {
      requestAnimationFrame(animate);
      effectComposer.render();

      stats.update();
    }

    animate();

    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.effectComposer = effectComposer;
  }
}
