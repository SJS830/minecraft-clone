import { getPlayer } from "/player/PlayerModel.js";

export let packet_name = "player_move";

export function handle(data) {
  getPlayer(data.id).updatePosition(data.x, data.y, data.z, data.rx, data.ry, data.rz, data.shifting);
}
