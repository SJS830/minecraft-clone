import * as THREE from "three";
import Minecraft from "/Minecraft.js";

import * as Network from "/network/Network.js";
import { players, localPlayer } from "/player/PlayerModel.js";

import SetPositionPacket from "/network/c2s/SetPosition.js";
import BlockBreakPacket from "/network/c2s/BlockBreak.js";
import BlockPlacePacket from "/network/c2s/BlockPlace.js";
import AttackPlayerPacket from "/network/c2s/AttackPlayer.js";

export const player_reach = 8;

export default class LocalPlayer {
  constructor() {
    this.has_pointer = false;

    this.gui = {
      highlightedBlock: new THREE.Mesh(new THREE.BoxGeometry(1.01, 1.01, 1.01), new THREE.MeshBasicMaterial({color: 0x000000, opacity: .15, transparent: true})),
      renderer: undefined,
    }

    Minecraft.getRenderer().scene.add(this.gui.highlightedBlock);

    this.view = {
      third_person: false,
    }

    this.movement = {
      forward: false,
      backward: false,
      left: false,
      right: false,
      shifting: false,
      sprinting: false,
      jumping: false,
    }

    this.velocity = {
      y: 0,
    }

    this.position = {
      coordinates: new THREE.Vector3(0, 200, 0),
      rotation: new THREE.Vector3(),
    }

    this.targeted = {
      type: undefined, //"block" or "player"
      block: undefined,
      block_face: undefined,
      player: undefined,
    }

    this.controls = {
      fpsControls: undefined,
      pressedKeys: {},
    }
  }

  raycast() {
    let step = .005;

    let dir = this.position.rotation.clone().multiplyScalar(step);
    let pos = Minecraft.getRenderer().camera.position.clone();
    let distance = 0;

    while (distance < 10) {
      let foundPlayer = false;

      Object.values(players).forEach(player => {
        if (!foundPlayer && player.bbox.containsPoint(pos)) {
          this.targeted.player = player.id;
          this.targeted.block = undefined;
          this.targeted.block_face = undefined;
          this.targeted.type = "player";

          this.gui.highlightedBlock.visible = false;

          foundPlayer = true;
          return;
        }
      });

      if (foundPlayer) {
        return;
      }

      if (Minecraft.getWorld().getBlock(...pos.clone().floor().toArray()) != 0) {
        this.targeted.block = pos.clone().floor();
        this.targeted.block_face = new THREE.Vector3();
        this.targeted.player = undefined;
        this.targeted.type = "block";

        this.gui.highlightedBlock.visible = true;
        this.gui.highlightedBlock.position.copy(pos.clone().floor().addScalar(.5));

        let [x, y, z] = pos.toArray();

        //Euclidian modulo
        x %= 1; y %= 1; z %= 1;
        x += 1; y += 1; z += 1;
        x %= 1; y %= 1; z %= 1;

        if (x < .01 && dir.x > 0) {
          this.targeted.block_face.x = -1;
        } else if (x > .99 && dir.x < 0) {
          this.targeted.block_face.x = 1;
        } else if (y < .01 && dir.y > 0) {
          this.targeted.block_face.y = -1;
        } else if (y > .99 && dir.y < 0) {
          this.targeted.block_face.y = 1;
        } else if (z < .01 && dir.z > 0) {
          this.targeted.block_face.z = -1;
        } else if (z > .99 && dir.z < 0) {
          this.targeted.block_face.z = 1;
        } else {
          console.log("?????????????");
        }

        console.log(x, y, z, this.targeted.block_face);

        return;
      }

      pos.add(dir);
      distance += step;
    }

    this.targeted.player = undefined;
    this.targeted.block = undefined;
    this.targeted.block_face = undefined;
    this.targeted.type = undefined;

    this.gui.highlightedBlock.visible = false;
  }

  isColliding() {
    let player_vertices = [];

    //TODO
    [.1, 1, this.getPlayerHeight() + .1].forEach(dy => {
      [-.25, .25].forEach(dx => {
        [-.25, .25].forEach(dz => {
          player_vertices.push(this.position.coordinates.clone().add(new THREE.Vector3(dx, dy, dz)).floor());
        });
      });
    });

    let colliding = false;

    player_vertices.forEach(vertex => {
      let block = Minecraft.getWorld().getBlock(...vertex.toArray());

      if (block != 0) {
        colliding = true;
      }
    });

    return colliding;
  }

  onFloor() {
    let player_vertices = [];

    [0].forEach(dy => {
      [-.25, .25].forEach(dx => {
        [-.25, .25].forEach(dz => {
          player_vertices.push(this.position.coordinates.clone().add(new THREE.Vector3(dx, dy, dz)).floor());
        });
      });
    });

    let colliding = false;

    player_vertices.forEach(vertex => {
      let block = Minecraft.getWorld().getBlock(...vertex.toArray());

      if (block != 0) {
        colliding = true;
      }
    });

    return colliding;
  }

  breakBlock() {
    if (this.targeted.type == "player") {
      Network.sendPacket(Network.packets.AttackPlayerPacket(this.targeted.player));
    } else if (this.targeted.type == "block") {
      Network.sendPacket(BlockBreakPacket(...this.targeted.block.toArray()));
    }
  }

  placeBlock() {
    if (this.targeted.type != "block") {
      return;
    }

    let pos = this.targeted.block.clone().add(this.targeted.block_face);

    Minecraft.getWorld().setBlock(pos.x, pos.y, pos.z, 1);
    let colliding = this.isColliding();
    Minecraft.getWorld().setBlock(pos.x, pos.y, pos.z, 0);

    if (colliding) {
      return;
    }

    let blockInSlot = Minecraft.getInstance().HotBarGui.getSlot(Minecraft.getInstance().HotBarGui.getHotbarSlot());

    if (blockInSlot) {
      Network.sendPacket(BlockPlacePacket(...pos.toArray(), blockInSlot));
    }
  }

  getPlayerSpeed() {
    if (Minecraft.getInput().pressedKeys["ShiftLeft"]) {
      return .5;
    } else if (Minecraft.getInput().pressedKeys["CapsLock"]) {
      return 2;
    } else {
      return 1;
    }
  }

  getPlayerHeight() {
    if (Minecraft.getInput().pressedKeys["ShiftLeft"]) {
      return 1.5;
    } else {
      return 1.8;
    }
  }

  attach() {
    Minecraft.getEventHandler().on("mouse_click", (button) => {
        if (button == 0) {
          this.breakBlock();
        } else if (button == 2) {
          this.placeBlock();
        }
    });

    setInterval(() => {
      Minecraft.getRenderer().camera.position.x = this.position.coordinates.x;
      Minecraft.getRenderer().camera.position.y = this.position.coordinates.y + this.getPlayerHeight();
      Minecraft.getRenderer().camera.position.z = this.position.coordinates.z;

      /*if (third_person) {
        let dir = new THREE.Vector3();
        camera.getWorldDirection(dir);

        localPlayer.updatePosition(...this.position.coordinates.toArray(), ...dir.toArray(), Minecraft.getInput().pressedKeys["ShiftLeft"]);

        camera.position.x -= dir.x * 5;
        camera.position.y -= dir.y * 5;
        camera.position.z -= dir.z * 5;
      }*/
    }, 1000 / 60);

    setInterval(() => {
      Minecraft.getInput().fpsControls.getDirection(this.position.rotation);
    }, 1000 / 60);

    setInterval(() => {
      //If we dont do this the "this" keyboard is Window
      this.raycast();
    }, 1000 / 60);

    setInterval(() => {
      Network.sendPacket(Network.packets.SetPositionPacket(...this.position.coordinates.toArray(), ...this.position.rotation.toArray(), Minecraft.getInput().pressedKeys["ShiftLeft"]));
    }, 1000 / 60);

    setInterval(() => {
      let dir = this.position.rotation;
      dir.setY(0);
      dir.normalize();
      dir.multiplyScalar(this.getPlayerSpeed() / 8);

      document.querySelector("#info").innerText = `XYZ: ${this.position.coordinates.x.toFixed(2)} ${this.position.coordinates.y.toFixed(2)} ${this.position.coordinates.z.toFixed(2)} (facing ${["S", "SW", "W", "NW", "N", "NE", "E", "SE", "S"][Math.round(Math.atan2(dir.x, dir.z) / (Math.PI / 4) + 4)]})`;

      if (!Minecraft.getInstance().ChatBoxGui.isTyping()) {
        if (Minecraft.getInput().pressedKeys["KeyW"]) {
          this.position.coordinates.x += dir.x;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.x -= dir.x;
          }

          this.position.coordinates.z += dir.z;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.z -= dir.z;
          }
        }
        if (Minecraft.getInput().pressedKeys["KeyS"]) {
          this.position.coordinates.x -= dir.x;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.x += dir.x;
          }

          this.position.coordinates.z -= dir.z;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.z += dir.z;
          }
        }
        if (Minecraft.getInput().pressedKeys["KeyA"]) {
          let t = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2);

          this.position.coordinates.x += t.x;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.x -= t.x;
          }

          this.position.coordinates.z += t.z;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.z -= t.z;
          }
        }
        if (Minecraft.getInput().pressedKeys["KeyD"]) {
          let t = dir.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 2);

          this.position.coordinates.x += t.x;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.x -= t.x;
          }

          this.position.coordinates.z += t.z;

          if (this.isColliding() || (this.velocity.y === 0 && Minecraft.getInput().pressedKeys["ShiftLeft"] && !this.onFloor())) {
            this.position.coordinates.z -= t.z;
          }
        }
      }

      if (this.position.coordinates.y < -50) {
        Network.sendPacket(Network.packets.ChatMessagePacket("rip"));
        this.position.coordinates.x = 0;
        this.position.coordinates.y = 200;
        this.position.coordinates.z = 0;
        return;
      }

      if (!this.onFloor()) {
        this.velocity.y -= .01;
      } else {
        this.velocity.y = 0;

        if (Minecraft.getInput().pressedKeys["Space"] && !Minecraft.getInstance().ChatBoxGui.isTyping()) {
          this.velocity.y = .3;
        }
      }

      this.position.coordinates.y += this.velocity.y;

      if (this.isColliding()) {
        while (this.isColliding()) {
          if (this.velocity.y > 0) {
            this.position.coordinates.y -= .01;
          } else {
            this.position.coordinates.y += .01;
          }
        }

        this.velocity.y = 0;
      }
    }, 1000 / 60);
  }
}
