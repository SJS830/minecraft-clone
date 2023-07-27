import { emitter } from "./EventEmitter";
import { Chunk, posToChunk } from "./chunk";
import { player } from "./player";

export const chunks: { [key: string]: Chunk } = {};

export function initGenerationLoop() {
  emitter.on("tick", () => {
    let playerChunk = posToChunk(player.pos);

    for (const [key, chunk] of Object.entries(chunks)) {
      if (Math.max(Math.abs(chunk.x - playerChunk.x), Math.max(chunk.z - playerChunk.z)) > 3) {
        chunk.destroy();
        delete chunks[key];
      }
    }

    for (let px = -3; px <= 3; px++) {
      for (let pz = -3; pz <= 3; pz++) {
        let newChunk = { x: playerChunk.x + px, z: playerChunk.z + pz };

        if (!chunks[`${newChunk.x}_${newChunk.z}`]) {
          let chunk = new Chunk(newChunk.x, newChunk.z);
          chunk.generate();
          chunk.remesh();

          chunks[`${chunk.x}_${chunk.z}`] = chunk;
        }
      }
    }
  });
}
