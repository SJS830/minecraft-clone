let CHUNK_WIDTH = 32;
let CHUNK_HEIGHT = 256;

class Chunk {
  constructor(chunkx, chunkz) {
    this.chunkx = chunkx;
    this.chunkz = chunkz;

    this.blocks = new Int8Array(CHUNK_WIDTH * CHUNK_HEIGHT * CHUNK_WIDTH).fill(0);
  }

  blockPosToArrayIndex(x, y, z) {
    if (x < 0 || y < 0 || z < 0 || x >= CHUNK_WIDTH || y >= CHUNK_HEIGHT | z >= CHUNK_WIDTH) {
      return undefined;
    }

    return (z * CHUNK_WIDTH * CHUNK_HEIGHT) + (x * CHUNK_HEIGHT) + y;
  }

  arrayIndexToBlockPos(index) {
    let y = index % CHUNK_HEIGHT;
    index -= y;
    index /= CHUNK_HEIGHT;

    let z = Math.floor(index / CHUNK_WIDTH);
    let x = index % CHUNK_WIDTH;

    return [x, y, z];
  }

	getBlock(x, y, z) {
    let index = this.blockPosToArrayIndex(x, y, z);

    return this.blocks[index];
	}

  setBlock(x, y, z, val) {
    let index = this.blockPosToArrayIndex(x, y, z);

    this.blocks[index] = val;
  }
}

module.exports.Chunk = Chunk;
