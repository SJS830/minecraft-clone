import { scene } from "./renderer";
import * as THREE from "three";

export type ChunkPos = {
  x: number;
  z: number;
};

export function posToChunk(pos: THREE.Vector3): ChunkPos {
  return {
    x: Math.floor(pos.x / 32),
    z: Math.floor(pos.z / 32),
  };
}

function blockPosToArrayIndex(pos: THREE.Vector3): number {
  return pos.z * 32 * 32 + pos.x * 32 + pos.y;
}

function arrayIndexToBlockPos(index: number): THREE.Vector3 {
  let y = index % 32;
  index -= y;
  index /= 32;

  let z = Math.floor(index / 32);
  let x = index % 32;

  return new THREE.Vector3(x, y, z);
}

export class Chunk {
  blocks: Int8Array;
  x: number;
  z: number;

  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
    this.blocks = new Int8Array(32 * 32 * 256);
  }

  generate() {
    for (let x = 0; x < 32; x++) {
      for (let z = 0; z < 32; z++) {
        for (let y = 0; y < 10; y++) {
          this.blocks[blockPosToArrayIndex(new THREE.Vector3(x, y, z))] = 1;
        }
      }
    }
  }

  objectName() {
    return `chunk_${this.x}_${this.z}`;
  }
  
  destroy() {
    let mesh = scene.getObjectByName(this.objectName()) as THREE.Mesh;

    if (mesh) {
      scene.remove(mesh);
    }

    mesh.geometry.dispose();
  }

  remesh() {
    let mesh = scene.getObjectByName(this.objectName()) as THREE.Mesh;

    if (!mesh) {
      mesh = new THREE.Mesh(
        new THREE.BufferGeometry(),
        new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }),
      );
      mesh.position.set(this.x * 32, 0, this.z * 32);
      mesh.name = this.objectName();
      scene.add(mesh);
    }

    const vertices: number[] = [];
    const normals: number[] = [];
    const uv: number[] = [];

    for (let i = 0; i < this.blocks.length; i++) {
      if (this.blocks[i] == 0) {
        continue;
      }

      let pos = arrayIndexToBlockPos(i);

      const shouldRenderFace = (face: THREE.Vector3) => {
        let newBlock = pos.clone().add(face);
        
        if (!newBlock.clone().clamp(new THREE.Vector3(0, 0, 0), new THREE.Vector3(31, 31, 255)).equals(newBlock)) {
          return true;
        }

        return (this.blocks[blockPosToArrayIndex(newBlock)] == 0);
      }

      //-z
      if (shouldRenderFace(new THREE.Vector3(0, 0, -1))) {
        vertices.push(pos.x, pos.y, pos.z);
        normals.push(0, 0, -1);
        vertices.push(pos.x + 1, pos.y, pos.z);
        normals.push(0, 0, -1);
        vertices.push(pos.x + 1, pos.y + 1, pos.z);
        normals.push(0, 0, -1);
  
        vertices.push(pos.x, pos.y, pos.z);
        normals.push(0, 0, -1);
        vertices.push(pos.x, pos.y + 1, pos.z);
        normals.push(0, 0, -1);
        vertices.push(pos.x + 1, pos.y + 1, pos.z);
        normals.push(0, 0, -1);  
      }

      //+z
      if (shouldRenderFace(new THREE.Vector3(0, 0, 1))) {
        vertices.push(pos.x, pos.y, pos.z + 1);
        normals.push(0, 0, 1);
        vertices.push(pos.x + 1, pos.y, pos.z + 1);
        normals.push(0, 0, 1);
        vertices.push(pos.x + 1, pos.y + 1, pos.z + 1);
        normals.push(0, 0, 1);
  
        vertices.push(pos.x, pos.y, pos.z + 1);
        normals.push(0, 0, 1);
        vertices.push(pos.x, pos.y + 1, pos.z + 1);
        normals.push(0, 0, 1);
        vertices.push(pos.x + 1, pos.y + 1, pos.z + 1);
        normals.push(0, 0, 1);  
      }

      //-x
      if (shouldRenderFace(new THREE.Vector3(-1, 0, 0))) {
        vertices.push(pos.x, pos.y, pos.z);
        normals.push(-1, 0, 0);
        vertices.push(pos.x, pos.y, pos.z + 1);
        normals.push(-1, 0, 0);
        vertices.push(pos.x, pos.y + 1, pos.z + 1);
        normals.push(-1, 0, 0);

        vertices.push(pos.x, pos.y, pos.z);
        normals.push(-1, 0, 0);
        vertices.push(pos.x, pos.y + 1, pos.z);
        normals.push(-1, 0, 0);
        vertices.push(pos.x, pos.y + 1, pos.z + 1);
        normals.push(-1, 0, 0);
      }

      //+x
      if (shouldRenderFace(new THREE.Vector3(1, 0, 0))) {
        vertices.push(pos.x + 1, pos.y, pos.z);
        normals.push(1, 0, 0);
        vertices.push(pos.x + 1, pos.y, pos.z + 1);
        normals.push(1, 0, 0);
        vertices.push(pos.x + 1, pos.y + 1, pos.z + 1);
        normals.push(1, 0, 0);

        vertices.push(pos.x + 1, pos.y, pos.z);
        normals.push(1, 0, 0);
        vertices.push(pos.x + 1, pos.y + 1, pos.z);
        normals.push(1, 0, 0);
        vertices.push(pos.x + 1, pos.y + 1, pos.z + 1);
        normals.push(1, 0, 0);
      }

      //-y
      if (shouldRenderFace(new THREE.Vector3(0, -1, 0))) {
        vertices.push(pos.x, pos.y, pos.z);
        normals.push(0, -1, 0);
        vertices.push(pos.x + 1, pos.y, pos.z);
        normals.push(0, -1, 0);
        vertices.push(pos.x + 1, pos.y, pos.z + 1);
        normals.push(0, -1, 0);

        vertices.push(pos.x, pos.y, pos.z);
        normals.push(0, -1, 0);
        vertices.push(pos.x, pos.y, pos.z + 1);
        normals.push(0, -1, 0);
        vertices.push(pos.x + 1, pos.y, pos.z + 1);
        normals.push(0, -1, 0);
      }

      //+y
      if (shouldRenderFace(new THREE.Vector3(0, 1, 0))) {
        vertices.push(pos.x, pos.y + 1, pos.z);
        normals.push(0, 1, 0);
        vertices.push(pos.x + 1, pos.y + 1, pos.z);
        normals.push(0, 1, 0);
        vertices.push(pos.x + 1, pos.y + 1, pos.z + 1);
        normals.push(0, 1, 0);

        vertices.push(pos.x, pos.y + 1, pos.z);
        normals.push(0, 1, 0);
        vertices.push(pos.x, pos.y + 1, pos.z + 1);
        normals.push(0, 1, 0);
        vertices.push(pos.x + 1, pos.y + 1, pos.z + 1);
        normals.push(0, 1, 0);
      }
    }

    let geometry = mesh.geometry;

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(vertices, 3),
    );
    geometry.setAttribute(
      "normal",
      new THREE.Float32BufferAttribute(normals, 3),
    );
  }
}
