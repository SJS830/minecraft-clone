import { Chunk, CHUNK_WIDTH } from "/world/Chunk.js";
import { initSky } from "/world/Sky.js";

export default class World {
	constructor() {
		this.chunks = {};
		initSky();
	}

	getChunk(x, z) {
		return this.chunks[`${x}_${z}`];
	}

	getChunkFromBlock(x, z) {
	  return this.getChunk(Math.floor(x / CHUNK_WIDTH), Math.floor(z / CHUNK_WIDTH));
	}

	getBlock(x, y, z) {
	  let chunk = this.getChunkFromBlock(x, z);

	  if (chunk) {
	    return chunk.getBlock(((x % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH, y, ((z % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH);
	  } else {
	    return 0;
	  }
	}

	initChunk(chunkx, chunkz) {
		let chunk = new Chunk(chunkx, chunkz);

		this.chunks[`${chunkx}_${chunkz}`] = chunk;

		return chunk;
	}

	setBlock(x, y, z, val) {
	  let chunk = this.getChunkFromBlock(x, z);

	  if (chunk) {
	    chunk.setBlock(((x % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH, y, ((z % CHUNK_WIDTH) + CHUNK_WIDTH) % CHUNK_WIDTH, val);
	  }
	}

	removeChunk(chunkx, chunkz) {
		let chunk = this.getChunk(chunkx, chunkz);
		chunk.destroy();

		delete this.chunks[`${chunkx}_${chunkz}`];
	}
}
