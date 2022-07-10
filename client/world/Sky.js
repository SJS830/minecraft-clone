import { Sky } from "@three/objects/Sky.js";
import { GUI } from "@three/libs/lil-gui.module.min.js";
import Minecraft from "/Minecraft.js";
import * as THREE from "three";

export function initSky() {
  let sky, sun;

  sky = new Sky();
  sky.scale.setScalar( 450000 );
  Minecraft.getRenderer().scene.add(sky);

  sun = new THREE.Vector3();

  const effectController = {
    turbidity: 10,
    rayleigh: 3,
    mieCoefficient: 0.005,
    mieDirectionalG: 0.9,
    elevation: 0,
    azimuth: 180,
    exposure: .2
  };

  const uniforms = sky.material.uniforms;
  uniforms["turbidity"].value = effectController.turbidity;
  uniforms["rayleigh" ].value = effectController.rayleigh;
  uniforms["mieCoefficient"].value = effectController.mieCoefficient;
  uniforms["mieDirectionalG"].value = effectController.mieDirectionalG;

  const phi = THREE.MathUtils.degToRad(90 - effectController.elevation);
  const theta = THREE.MathUtils.degToRad(effectController.azimuth);

  sun.setFromSphericalCoords(1, phi, theta);

  uniforms["sunPosition"].value.copy(sun);

  var clouds = new Image();

  clouds.addEventListener("load", () => {
    var cloudsCanvas = document.createElement("canvas");
    cloudsCanvas.width = clouds.width;
    cloudsCanvas.height = clouds.height;
    cloudsCanvas.getContext("2d").drawImage(clouds, 0, 0, clouds.width, clouds.height);

    let side_vertices = [];
    let top_vertices = [];

    let n = 0;
    let arr = cloudsCanvas.getContext("2d").getImageData(0, 0, clouds.width, clouds.height).data;
    let pixels = [];
    while (n < arr.length) {
      pixels.push(arr[n]);
      n += 4;
    }

    function getPixel(x, y) {
      return pixels[y * clouds.height + x];
    }

    for (let x = 0; x < clouds.width; x++) {
      for (let z = 0; z < clouds.height; z++) {
        if (getPixel(x, z)) {
          let y = 0;

          if (!getPixel(x + 1, z)) {
            side_vertices.push(x + 1, y, z); //Bottom left
            side_vertices.push(x + 1, y + 1, z + 1); //Top right
            side_vertices.push(x + 1, y, z + 1); //Bottom right

            side_vertices.push(x + 1, y, z); //Bottom left
            side_vertices.push(x + 1, y + 1, z); //Top left
            side_vertices.push(x + 1, y + 1, z + 1)  //Top right
          }

          if (!getPixel(x - 1, z)) {
            side_vertices.push(x, y, z); //Bottom left
            side_vertices.push(x, y, z + 1); //Bottom right
            side_vertices.push(x, y + 1, z + 1); //Top right

            side_vertices.push(x, y, z); //Bottom left
            side_vertices.push(x, y + 1, z + 1); //Top right
            side_vertices.push(x, y + 1, z); //Top left
          }

          if (!getPixel(x, z + 1)) {
            side_vertices.push(x, y, z + 1); //Bottom left
            side_vertices.push(x + 1, y, z + 1); //Bottom right
            side_vertices.push(x + 1, y + 1, z + 1); //Top right

            side_vertices.push(x, y, z + 1); //Bottom left
            side_vertices.push(x + 1, y + 1, z + 1); //Top right
            side_vertices.push(x, y + 1, z + 1); //Top left
          }

          if (!getPixel(x, z - 1)) {
            side_vertices.push(x, y, z); //Bottom left
            side_vertices.push(x + 1, y + 1, z); //Top right
            side_vertices.push(x + 1, y, z); //Bottom right

            side_vertices.push(x, y, z); //Bottom left
            side_vertices.push(x, y + 1, z); //Top left
            side_vertices.push(x + 1, y + 1, z); //Top right
          }

          top_vertices.push(x, y + 1, z); //Bottom left
          top_vertices.push(x, y + 1, z + 1); //Bottom right
          top_vertices.push(x + 1, y + 1, z + 1); //Top right

          top_vertices.push(x, y + 1, z); //Bottom left
          top_vertices.push(x + 1, y + 1, z + 1); //Top right
          top_vertices.push(x + 1, y + 1, z); //Top left


          top_vertices.push(x, y, z); //Bottom left
          top_vertices.push(x + 1, y, z + 1); //Top right
          top_vertices.push(x, y, z + 1); //Top left

          top_vertices.push(x, y, z); //Bottom left
          top_vertices.push(x + 1, y, z); //Bottom right
          top_vertices.push(x + 1, y, z + 1); // Top right
        }
      }
    }

    let side_mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({color: 0xffffff}));
    side_mesh.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(side_vertices), 3));

    side_mesh.scale.x = 16;
    side_mesh.scale.y = 6;
    side_mesh.scale.z = 16;

    side_mesh.position.x = clouds.width * -8;
    side_mesh.position.y = 196;
    side_mesh.position.z = clouds.height * -8;

    Minecraft.getRenderer().scene.add(side_mesh);

    let top_mesh = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({color: 0xdde7ee}));
    top_mesh.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(top_vertices), 3));

    top_mesh.scale.x = 16;
    top_mesh.scale.y = 6;
    top_mesh.scale.z = 16;

    top_mesh.position.x = clouds.width * -8;
    top_mesh.position.y = 196;
    top_mesh.position.z = clouds.height * -8;

    Minecraft.getRenderer().scene.add(top_mesh);
  });

  clouds.src = "/textures/sky.png";
}
