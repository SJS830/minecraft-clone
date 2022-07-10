import * as THREE from "three";

export class PlayerModel {
  constructor(id) {
    this.id = id;

    this.mesh = new THREE.Group();
    this.mesh.player = this;

    this.head = new THREE.Mesh(new THREE.BoxGeometry(.75, .75, .75), [
      new THREE.MeshBasicMaterial({color: 0x00ff00}),
      new THREE.MeshBasicMaterial({color: 0x00ff00}),
      new THREE.MeshBasicMaterial({color: 0x00ff00}),
      new THREE.MeshBasicMaterial({color: 0x00ff00}),
      new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load("textures/player/face.jpg")}),
      new THREE.MeshBasicMaterial({color: 0x00ff00})
    ]);
    this.head.position.set(0, 1.9, 0);

    this.lshoulder = new THREE.Group();
    this.lshoulder.position.set(-.65, 1.5, 0)

    this.rshoulder = new THREE.Group();
    this.rshoulder.position.set(.65, 1.5, 0)

    this.larm = new THREE.Mesh(new THREE.BoxGeometry(.3, 1, .3), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    this.larm.position.set(0, -.5, 0);

    this.rarm = new THREE.Mesh(new THREE.BoxGeometry(.3, 1, .3), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    this.rarm.position.set(0, -.5, 0);

    this.lshoulder.add(this.larm);
    this.rshoulder.add(this.rarm);

    this.lhip = new THREE.Group();
    this.lhip.position.set(-.35, 0, 0)

    this.rhip = new THREE.Group();
    this.rhip.position.set(.35, 0, 0)

    this.lleg = new THREE.Mesh(new THREE.BoxGeometry(.3, 1, .3), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    this.lleg.position.set(0, -.5, 0);

    this.rleg = new THREE.Mesh(new THREE.BoxGeometry(.3, 1, .3), new THREE.MeshBasicMaterial({color: 0x00ff00}));
    this.rleg.position.set(0, -.5, 0);

    this.lhip.add(this.lleg);
    this.rhip.add(this.rleg);

    this.chest = new THREE.Mesh(new THREE.BoxGeometry(1, 1.5, .3), new THREE.MeshBasicMaterial({color: 0x0000ff}));
    this.chest.position.set(0, .75, 0);

    this.body = new THREE.Group();
    this.body.add(this.chest);
    this.body.add(this.lshoulder);
    this.body.add(this.rshoulder);
    this.body.add(this.lhip);
    this.body.add(this.rhip);
    this.body.add(this.head);

    this.body.scale.x = .6;
    this.body.scale.y = .6;
    this.body.scale.z = .6;
    this.mesh.add(this.body);

    this.mesh.player = this;

    this.bbox = new THREE.Box3();

    //const hitboxOutliine = new THREE.Box3Helper(this.bbox, 0xffff00);
    //scene.add(hitboxOutliine);

    this.timeout = setTimeout(() => {});

    //Minecraft.getRenderer().scene.add(this.mesh);
  }

  updatePosition(x, y, z, rx, ry, rz, shifting) {
    if (shifting) {
      this.lleg.scale.y = .6;
      this.rleg.scale.y = .6;
      this.lleg.position.set(0, -.2, 0);
      this.rleg.position.set(0, -.2, 0);
      this.body.position.set(x, y + .3, z);

      this.bbox.min.set(x - .25, y, z - .25);
      this.bbox.max.set(x + .25, y + 1.7, z + .25);
    } else {
      this.lleg.scale.y = 1;
      this.rleg.scale.y = 1;
      this.lleg.position.set(0, -.5, 0);
      this.rleg.position.set(0, -.5, 0);
      this.body.position.set(x, y + .65, z);

      this.bbox.min.set(x - .25, y, z - .25);
      this.bbox.max.set(x + .25, y + 2, z + .25);
    }

    this.head.rotation.x = -Math.atan(ry);
    this.body.rotation.y = Math.atan2(rx, rz);

    this.lshoulder.rotation.x = Math.sin(new Date().getTime() / 100) / 2;
    this.rshoulder.rotation.x = -Math.sin(new Date().getTime() / 100) / 2;
    this.lhip.rotation.x = -Math.sin(new Date().getTime() / 100) / 2;
    this.rhip.rotation.x = Math.sin(new Date().getTime() / 100) / 2;

    clearTimeout(this.timeout);
    this.timeout = setTimeout(() => {
      this.lshoulder.rotation.x = 0;
      this.rshoulder.rotation.x = 0;
      this.lhip.rotation.x = 0;
      this.rhip.rotation.x = 0;
    }, 20);
  }

  destroy() {
    scene.remove(this.mesh);
  }
}

let localPlayer = new PlayerModel();

export { localPlayer }

let players = {};

export { players }

export function getPlayer(id) {
  return players[id];
}

export function initPlayer(id) {
  players[id] = new PlayerModel(id);
}
