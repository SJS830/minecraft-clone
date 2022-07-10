import Minecraft from "/Minecraft.js";

export let packet_name = "block_update";

export function handle(data) {
  Minecraft.getWorld().setBlock(data.x, data.y, data.z, data.block);
}
