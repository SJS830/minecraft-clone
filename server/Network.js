const { wss } = require("./Server.js");
const { Chunk } = require("./Chunk.js");
const { SimplexNoise } = require("simplex-noise");

const simplex = new SimplexNoise("69420");
const RENDER_DISTANCE = 8;

module.exports.packet_handlers = {
  "set_position": (ws, event) => {
    let _cx = Math.floor(event.x / 32);
    let _cz = Math.floor(event.z / 32);

    for (let d = 0; d <= RENDER_DISTANCE; d++) {
      for (let dx = -d; dx <= d; dx++) {
        for (let dz = -d; dz <= d; dz++) {
          let cx = _cx + dx;
          let cz = _cz + dz;

          if (!ws.loadedChunks.includes(`${cx}_${cz}`)) {
            ws.loadedChunks.push(`${cx}_${cz}`)

            if (ws.world.getChunk(cx, cz) === undefined) {
              let chunk = new Chunk(cx, cz);

              for (let x = 0; x < 32; x++) {
                for (let z = 0; z < 32; z++) {
                  let my = 60 + Math.floor(simplex.noise2D((x + cx * 32) / 150, (z + cz * 32) / 150) * 20);

                  for (let y = 0; y < my - 1; y++) {
                    chunk.setBlock(x, y, z, 2);
                  }

                  chunk.setBlock(x, my - 1, z, 1);
                }
              }

              ws.world.setChunk(cx, cz, chunk);
            }

            let blocks = ws.world.getChunk(cx, cz).blocks;
            let rle_encoded = [[blocks[0], 0]];
            let pointer = 0;

            for (let i = 0; i < blocks.length; i++) {
              if (blocks[i] == rle_encoded[pointer][0]) {
                rle_encoded[pointer][1]++;
              } else {
                rle_encoded.push([blocks[i], 1]);
                pointer++;
              }
            }

            ws.send(JSON.stringify({
              type: "chunk_init",
              data: {
                chunkx: cx,
                chunkz: cz,
                blocks: rle_encoded
              }
            }));
          }
        }
      }
    }

    ws.loadedChunks.forEach(chunk => {
      let cx = parseInt(chunk.split("_")[0]);
      let cz = parseInt(chunk.split("_")[1]);

      if (Math.max(Math.abs(cx - _cx), Math.abs(cz - _cz)) > RENDER_DISTANCE) {
        ws.send(JSON.stringify({
          type: "unload_chunk",
          data: {
            chunkx: cx,
            chunkz: cz
          }
        }));

        ws.loadedChunks = ws.loadedChunks.filter(x => x != chunk);
      }
    });

    wss.clients.forEach((client) => {
      if (client.readyState === 1 && client.uuid != ws.uuid) {
        client.send(JSON.stringify({
          type: "player_move",
          data: {
            id: ws.uuid,
            x: event.x,
            y: event.y,
            z: event.z,
            rx: event.rx,
            ry: event.ry,
            rz: event.rz,
            shifting: event.shifting
          }
        }));
      }
    });
  },

  "block_break": (ws, event) => {
    ws.world.setBlock(event.x, event.y, event.z, 0);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "block_update",
          data: {
            x: event.x,
            y: event.y,
            z: event.z,
            block: 0
          }
        }));
      }
    });
  },

  "block_place": (ws, event) => {
    ws.world.setBlock(event.x, event.y, event.z, event.slot);

    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "block_update",
          data: {
            x: event.x,
            y: event.y,
            z: event.z,
            block: event.slot
          }
        }));
      }
    });
  },

  "chat_message": (ws, event) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "chat_message",
          data: {
            message: event.message.replace("\n", "")
          }
        }));
      }
    });
  },

  "attack_player": (ws, event) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({
          type: "get_hit",
          data: {
            id: event.id
          }
        }));
      }
    });
  }
};
