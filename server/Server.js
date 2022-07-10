const { WebSocketServer } = require("ws");
const { World } = require("./World.js");
const { Chunk } = require("./Chunk.js");
const { SimplexNoise } = require("simplex-noise");
const uuidv4 = require("uuid").v4;

const wss = new WebSocketServer({port: 81});
module.exports.wss = wss;

const { packet_handlers } = require("./Network.js");

const world = new World();

wss.on("connection", function connection(ws) {
  ws.world = world;
  ws.loadedChunks = [];
  ws.uuid = uuidv4();

  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.uuid != ws.uuid) {
      ws.send(JSON.stringify({
        type: "player_init",
        data: {
          id: client.uuid
        }
      }));
    }
  });

  wss.clients.forEach((client) => {
    if (client.readyState === 1 && client.uuid != ws.uuid) {
      client.send(JSON.stringify({
        type: "player_init",
        data: {
          id: ws.uuid
        }
      }));
    }
  });

  ws.on("message", function (data) {
    data = JSON.parse(data);
    packet_handlers[data.type](ws, data.data);
  });

  ws.on("close", () => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.uuid != ws.uuid) {
        client.send(JSON.stringify({
          type: "player_remove",
          data: {
            id: ws.uuid
          }
        }));
      }
    });
  });
});

const simplex = new SimplexNoise("69420");

for (let chunkx = -32; chunkx <= 32; chunkx++) {
  for (let chunkz = -32; chunkz <= 32; chunkz++) {
    let chunk = new Chunk(chunkx, chunkz);

    for (let x = 0; x < 32; x++) {
      for (let z = 0; z < 32; z++) {
        let my = 60 + Math.floor(simplex.noise2D((x + chunkx * 32) / 150, (z + chunkz * 32) / 150) * 20);

        for (let y = 0; y < my - 1; y++) {
          chunk.setBlock(x, y, z, 2);
        }

        chunk.setBlock(x, my - 1, z, 1);
      }
    }

    world.setChunk(chunkx, chunkz, chunk);
  }
}
