import * as THREE from "three";
import * as TextureManager from "/renderer/TextureManager.js";
import { atlas, tatlas, images, imagePositions, textures } from "/renderer/TextureManager.js";
import { addChunkToQueue } from "/utils/MesherThreadPool.js";
import Minecraft from "/Minecraft.js";

let CHUNK_WIDTH = 32;
let CHUNK_HEIGHT = 256;

export { CHUNK_WIDTH, CHUNK_HEIGHT };

export class Chunk {
  constructor(chunkx, chunkz) {
    this.chunkx = chunkx;
    this.chunkz = chunkz;

    this.blocks = new Int8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_WIDTH).fill(0);

    this.mesh = new THREE.Mesh(new THREE.BufferGeometry(), atlas);
    this.mesh.position.set(this.chunkx * CHUNK_WIDTH, 0, this.chunkz * CHUNK_WIDTH);
    Minecraft.getRenderer().scene.add(this.mesh);

    this.transparentLayer = new THREE.Mesh(new THREE.BufferGeometry(), tatlas);
    this.transparentLayer.position.set(this.chunkx * CHUNK_WIDTH, 0, this.chunkz * CHUNK_WIDTH);
    Minecraft.getRenderer().scene.add(this.transparentLayer);

    this.needsRemeshing = false;

    this.remeshInterval = setInterval(() => {
      if (this.needsRemeshing) {
        addChunkToQueue(this);
        this.needsRemeshing = false;
      }
    }, 10);
  }

  destroy() {
    clearInterval(this.remeshInterval);

    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
    Minecraft.getRenderer().scene.remove(this.mesh);
  }

  initBlocksRLE(rle) {
    let pointer = 0;

    for (let i = 0; i < rle.length; i++) {
      for (let j = 0; j < rle[i][1]; j++) {
        this.blocks[pointer] = rle[i][0];
        pointer++;
      }
    }

    this.needsRemeshing = true;
  }

  blockPosToArrayIndex(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= CHUNK_WIDTH || y >= CHUNK_HEIGHT | z >= CHUNK_WIDTH) {
      return undefined;
    }

    return (z * CHUNK_WIDTH * CHUNK_HEIGHT) + (x * CHUNK_HEIGHT) + y;
  }

  arrayIndexToBlockPos(index) {
    let y = index % CHUNK_HEIGHT;
    index -= y;
    index /= CHUNK_HEIGHT;

    let z = Math.floor(index / CHUNK_WIDTH);
    let x = index % CHUNK_WIDTH;

    return [x, y, z];
  }

	getBlock(x, y, z) {
    let index = this.blockPosToArrayIndex(x, y, z);

    if (!index) {
      return 0;
    } else {
      return this.blocks[index];
    }
	}

  setBlock(x, y, z, val, dontRemesh = false) {
    let index = this.blockPosToArrayIndex(x, y, z);

    this.blocks[index] = val;

    if (!dontRemesh) {
      this.needsRemeshing = true;
    }
  }

  buildGeometries(meshingWorker) {
    meshingWorker.postMessage([this.blocks.buffer, [images.length, textures, imagePositions]]);
  }

  handleWorkerMessage(e) {
    this.mesh.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(e.data[0]), 3));
    this.mesh.geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(e.data[1]), 2));

    this.transparentLayer.geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(e.data[2]), 3));
    this.transparentLayer.geometry.setAttribute("uv", new THREE.BufferAttribute(new Float32Array(e.data[3]), 2));

    let sphere = e.data[4];
    this.mesh.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(sphere[0], sphere[1], sphere[2]), sphere[3]);
    this.transparentLayer.geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(sphere[0], sphere[1], sphere[2]), sphere[3]);
  }
}
