import { initPlayer } from "/player/PlayerModel.js";

export let packet_name = "player_init";

export function handle(data) {
  initPlayer(data.id);
}
