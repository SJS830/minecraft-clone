import Minecraft from "/Minecraft.js";
import { textures_ready } from "/renderer/TextureManager.js";

export let packet_name = "chunk_init";

export function handle(data) {
  if (textures_ready) {
    let chunk = Minecraft.getWorld().initChunk(data.chunkx, data.chunkz);
    chunk.initBlocksRLE(data.blocks);
  } else {
    Minecraft.getEventHandler().once("textures_loaded", () => {
      let chunk = Minecraft.getWorld().initChunk(data.chunkx, data.chunkz);
      chunk.initBlocksRLE(data.blocks);
    });
  }
}
