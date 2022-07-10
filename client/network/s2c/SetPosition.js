import Minecraft from "/Minecraft.js";

export let packet_name = "set_position";

export function handle(data) {
  Minecraft.LocalPlayer.position.coordinates.set(data.x, data.y, data.z);
}
