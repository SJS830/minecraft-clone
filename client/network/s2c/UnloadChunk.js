import Minecraft from "/Minecraft.js";

export let packet_name = "unload_chunk";

export function handle(data) {
  Minecraft.getWorld().removeChunk(data.chunkx, data.chunkz);
}
