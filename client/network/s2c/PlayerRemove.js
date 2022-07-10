import { getPlayer } from "/player/PlayerModel.js";

export let packet_name = "player_remove";

export function handle(data) {
  getPlayer(data.id).destroy();
}
