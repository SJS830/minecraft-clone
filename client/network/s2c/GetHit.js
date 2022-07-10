import * as THREE from "three";
import { getPlayer } from "/player/PlayerModel.js";
import Minecraft from "/Minecraft.js";

export let packet_name = "get_hit";

let sound;

document.addEventListener("pointerlockchange", () => {
  const listener = new THREE.AudioListener();
  Minecraft.getRenderer().camera.add(listener);

  sound = new THREE.Audio(listener);

  const audioLoader = new THREE.AudioLoader();
  audioLoader.load("/textures/mycutisinsane.mp3", function(buffer) {
    sound.setBuffer(buffer);
  });
});

export function handle(data) {
  let player = getPlayer(data.id);
  sound.play();

  if (!player) {
    return;
  }

  player.head.material[4].map = new THREE.TextureLoader().load("textures/player/hitface.png");
  player.larm.material = new THREE.MeshBasicMaterial({color: 0xff0000});
  player.rarm.material = new THREE.MeshBasicMaterial({color: 0xff0000});
  player.lleg.material = new THREE.MeshBasicMaterial({color: 0xff0000});
  player.rleg.material = new THREE.MeshBasicMaterial({color: 0xff0000});
  player.chest.material = new THREE.MeshBasicMaterial({color: 0xff0000});

  setTimeout(() => {
    player.head.material[4].map = new THREE.TextureLoader().load("textures/player/face.jpg");
    player.larm.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    player.rarm.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    player.lleg.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    player.rleg.material = new THREE.MeshBasicMaterial({color: 0x00ff00});
    player.chest.material = new THREE.MeshBasicMaterial({color: 0x0000ff});
  }, 300);
}
