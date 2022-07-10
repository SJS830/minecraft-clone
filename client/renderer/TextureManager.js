import * as THREE from "three";
import Minecraft from "/Minecraft.js";

export let images = [];
export let textures = {};
export let imagePositions = {};
export let atlas = undefined;
export let tatlas = undefined;
export let textures_ready = false;

export function getTextureUvs(blockid, side) {
  let x = (imagePositions[textures[blockid][side]] % Math.ceil(Math.sqrt(images.length))) * 16;
  let y = Math.floor(imagePositions[textures[blockid][side]] / Math.ceil(Math.sqrt(images.length))) * 16;
  let width = Math.ceil(Math.sqrt(images.length)) * 16;
  let height = Math.ceil(Math.sqrt(images.length)) * 16;

  return [x / width, 1 - ((y + 16) / height), (x + 16) / width, 1 - (y / height)];
}

export function generateAtlas() {
  let atlas_canvas = document.createElement("canvas");
  atlas_canvas.width = Math.ceil(Math.sqrt(images.length)) * 16;
  atlas_canvas.height = Math.ceil(Math.sqrt(images.length)) * 16;
  document.body.appendChild(atlas_canvas);

  let ctx = atlas_canvas.getContext("2d");

  //Create 2**n texture for optimal efficiency
  images.forEach((image, i) => {
    let x = i % Math.ceil(Math.sqrt(images.length));
    let y = Math.floor(i / Math.ceil(Math.sqrt(images.length)));

    ctx.drawImage(image, 16 * x, 16 * y);
  });

  new THREE.TextureLoader().load(atlas_canvas.toDataURL("image/png"), (texture) => {
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.NearestFilter;
    texture.generateMipmaps = false;

    atlas = new THREE.MeshBasicMaterial({map: texture});
    tatlas = new THREE.MeshBasicMaterial({map: texture, transparent: true, depthWrite: false});

    atlas_canvas.remove();

    textures_ready = true;
    Minecraft.getEventHandler().emit("textures_loaded");
  });
}

function addTexture(blockid, side, url) {
  return new Promise((resolve, reject) => {
    textures[blockid] = textures[blockid] || {};
    textures[blockid][side] = url;

    if (!imagePositions[url]) {
      let image = new Image();

      image.addEventListener("load", () => {
        imagePositions[url] = images.length;

        images.push(image);

        resolve();
      });

      image.src = url;
    }
  });
}

fetch("/textures/textures.json").then(response => response.json()).then(textures => {
  Promise.all(
    textures.blocks.map(blocktype => {
      return new Promise((resolve, reject) => {
        fetch(`/textures/blocks/${blocktype}.json`).then(response => response.json()).then(block => {
          if (block.full_block) {
            Promise.all(
              Object.entries(block.faces).map(entry => {
                return addTexture(block.id, entry[0], "/textures/images/blocks/" + entry[1]);
              })
            ).then(() => {
              resolve();
            });
          } else {
            console.log("You weren't supposed to get here");
          }
        });
      });
    })
  ).then(() => {
    generateAtlas();
  });
});
