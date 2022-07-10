const { Chunk } = require("./Chunk.js");

class World {
  constructor() {
    this.chunks = {};
  }

  getChunk(x, z) {
    return this.chunks[`${x}_${z}`];
  }

  setChunk(x, z, val) {
    this.chunks[`${x}_${z}`] = val;
  }

  getChunkFromBlock(x, z) {
    return this.getChunk(Math.floor(x / 32), Math.floor(z / 32));
  }

  getBlock(x, y, z) {
    let chunk = this.getChunkFromBlock(x, z);

    if (chunk) {
      return chunk.getBlock(((x % 32) + 32) % 32, y, ((z % 32) + 32) % 32);
    } else {
      return undefined;
    }
  }

  setBlock(x, y, z, val) {
    let chunk = this.getChunkFromBlock(x, z);

    if (chunk) {
      chunk.setBlock(((x % 32) + 32) % 32, y, ((z % 32) + 32) % 32, val);
    }
  }
}

module.exports.World = World;
