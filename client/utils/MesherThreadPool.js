import Minecraft from "/Minecraft.js";
import { texturesLoaded } from "/renderer/TextureManager.js";
import { atlas } from "/renderer/TextureManager.js";

export const workers = [];
export const chunksInQueue = [];

export function addChunkToQueue(chunk) {
  chunksInQueue.push(chunk);
}

export function init() {
  for (let i = 0; i < navigator.hardwareConcurrency - 1; i++) {
    let worker = new Worker("meshing_worker.js");
    worker.available = true;

    workers.push(worker);
  }

  Minecraft.getEventHandler().on("textures_loaded", () => {
    setInterval(() => {
      workers.filter(worker => worker.available).forEach(worker => {
        let chunk = chunksInQueue.shift();

        if (!chunk) {
          return;
        }

        worker.available = false;

        worker.onmessage = function(e) {
          chunk.handleWorkerMessage(e);
          this.available = true;
        }

        chunk.buildGeometries(worker);
      });

      if (chunksInQueue.length > 0) {
        console.log(`${chunksInQueue.length} chunks in queue...`);
      }
    }, 5);
  });
}
