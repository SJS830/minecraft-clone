let CHUNK_WIDTH = 32;
let CHUNK_HEIGHT = 256;

let numTextures = 0;
let textures = {};
let imagePositions = {};

function getTextureUvs(blockid, side) {
  let x = (imagePositions[textures[blockid][side]] % Math.ceil(Math.sqrt(numTextures))) * 16;
  let y = Math.floor(imagePositions[textures[blockid][side]] / Math.ceil(Math.sqrt(numTextures))) * 16;
  let width = Math.ceil(Math.sqrt(numTextures)) * 16;
  let height = Math.ceil(Math.sqrt(numTextures)) * 16;

  //let uv = [x / width, 1 - ((y + 16) / height), (x + 16) / width, 1 - (y / height)];
  let uv = [(x + .001) / width, 1 - ((y + 15.999) / height), (x + 15.999) / width, 1 - ((y + .001) / height)];

  return uv;
}

function blockPosToArrayIndex(x, y, z) {
  if (x < 0 || y < 0 || z < 0 || x >= CHUNK_WIDTH || y >= CHUNK_HEIGHT | z >= CHUNK_WIDTH) {
    return undefined;
  }

  return (z * CHUNK_WIDTH * CHUNK_HEIGHT) + (x * CHUNK_HEIGHT) + y;
}

function arrayIndexToBlockPos(index) {
  let y = index % CHUNK_HEIGHT;
  index -= y;
  index /= CHUNK_HEIGHT;

  let z = Math.floor(index / CHUNK_WIDTH);
  let x = index % CHUNK_WIDTH;

  return [x, y, z];
}

function getBlock(blocks, x, y, z) {
  let index = blockPosToArrayIndex(x, y, z);

  if (!index) {
    return 0;
  } else {
    return blocks[index];
  }
}

function isTransparent(x) {
  return x == 0 || x == 7;
}

function isAir(x) {
  return x == 0;
}

onmessage = function(e) {
  let blocks = new Int8Array(e.data[0]);
  [numTextures, textures, imagePositions] = e.data[1];

  let vertices = new Float32Array(2 ** 15);
  let uvs = new Float32Array(2 ** 15);

  let vp = 0;
  function verticespush() {
    for (let i = 0; i < arguments.length; i++) {
      if (vp == vertices.length - 1) {
        let v = new Float32Array(vertices.length + 2 ** 15);
        v.set(vertices);
        vertices = v;
      }

      vertices[vp] = arguments[i];
      vp++;
    }
  }

  let up = 0;
  function uvspush() {
    for (let i = 0; i < arguments.length; i++) {
      if (up == uvs.length - 1) {
        let u = new Float32Array(uvs.length + 2 ** 15);
        u.set(uvs);
        uvs = u;
      }

      uvs[up] = arguments[i];
      up++;
    }
  }

  let tvertices = new Float32Array(2 ** 15);
  let tuvs = new Float32Array(2 ** 15);

  let tvp = 0;
  function tverticespush() {
    for (let i = 0; i < arguments.length; i++) {
      if (tvp == tvertices.length - 1) {
        let v = new Float32Array(tvertices.length + 2 ** 15);
        v.set(tvertices);
        tvertices = v;
      }

      tvertices[tvp] = arguments[i];
      tvp++;
    }
  }

  let tup = 0;
  function tuvspush() {
    for (let i = 0; i < arguments.length; i++) {
      if (tup == tuvs.length - 1) {
        let u = new Float32Array(tuvs.length + 2 ** 15);
        u.set(tuvs);
        tuvs = u;
      }

      tuvs[tup] = arguments[i];
      tup++;
    }
  }

  let minX = Infinity;
  let minY = Infinity;
  let minZ = Infinity;

  let maxX = -Infinity;
  let maxY = -Infinity;
  let maxZ = -Infinity;

  for (let x = 0; x < CHUNK_WIDTH; x++) {
    for (let y = 0; y < CHUNK_HEIGHT; y++) {
      for (let z = 0; z < CHUNK_WIDTH; z++) {
        let block = getBlock(blocks, x, y, z);

        if (!block) {
          continue;
        }

        if ( x < minX ) minX = x;
        if ( y < minY ) minY = y;
        if ( z < minZ ) minZ = z;

        if ( x + 1 > maxX ) maxX = x + 1;
        if ( y + 1 > maxY ) maxY = y + 1;
        if ( z + 1 > maxZ ) maxZ = z + 1;

        //TODO: wtf is this
        if (isTransparent(block)) {
          if (x == CHUNK_WIDTH - 1 || isAir(getBlock(blocks, x + 1, y, z))) {
            let texture_uvs = getTextureUvs(block, "1 0 0");
            tverticespush(x + 1, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
            tverticespush(x + 1, y, z + 1); tuvspush(texture_uvs[2], texture_uvs[1]); //Bottom right

            tverticespush(x + 1, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y + 1, z); tuvspush(texture_uvs[0], texture_uvs[3]); //Top left
            tverticespush(x + 1, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
          }

          if (x == 0 || isAir(getBlock(blocks, x - 1, y, z))) {
            let texture_uvs = getTextureUvs(block, "-1 0 0");
            tverticespush(x, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x, y, z + 1); tuvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            tverticespush(x, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right

            tverticespush(x, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
            tverticespush(x, y + 1, z); tuvspush(texture_uvs[0], texture_uvs[3]); //Top left
          }

          if (z == CHUNK_WIDTH - 1 || isAir(getBlock(blocks, x, y, z + 1))) {
            let texture_uvs = getTextureUvs(block, "0 0 1");
            tverticespush(x, y, z + 1); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y, z + 1); tuvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            tverticespush(x + 1, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right

            tverticespush(x, y, z + 1); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
            tverticespush(x, y + 1, z + 1); tuvspush(texture_uvs[0], texture_uvs[3]); //Top left
          }

          if (z == 0 || isAir(getBlock(blocks, x, y, z - 1))) {
            let texture_uvs = getTextureUvs(block, "0 0 -1");
            tverticespush(x, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y + 1, z); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
            tverticespush(x + 1, y, z); tuvspush(texture_uvs[2], texture_uvs[1]); //Bottom right

            tverticespush(x, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x, y + 1, z); tuvspush(texture_uvs[0], texture_uvs[3]); //Top left
            tverticespush(x + 1, y + 1, z); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
          }

          if (y == CHUNK_HEIGHT - 1 || isAir(getBlock(blocks, x, y + 1, z))) {
            let texture_uvs = getTextureUvs(block, "0 1 0");
            tverticespush(x, y + 1, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            tverticespush(x + 1, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right

            tverticespush(x, y + 1, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y + 1, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
            tverticespush(x + 1, y + 1, z); tuvspush(texture_uvs[0], texture_uvs[3]); //Top left
          }

          if (y == 0 || isAir(getBlock(blocks, x, y - 1, z))) {
            let texture_uvs = getTextureUvs(block, "0 -1 0");
            tverticespush(x, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); //Top right
            tverticespush(x, y, z + 1); tuvspush(texture_uvs[0], texture_uvs[3]); //Top left

            tverticespush(x, y, z); tuvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            tverticespush(x + 1, y, z); tuvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            tverticespush(x + 1, y, z + 1); tuvspush(texture_uvs[2], texture_uvs[3]); // Top right
          }
        } else {
          if (x == CHUNK_WIDTH - 1 || isTransparent(getBlock(blocks, x + 1, y, z))) {
            let texture_uvs = getTextureUvs(block, "1 0 0");
            verticespush(x + 1, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
            verticespush(x + 1, y, z + 1); uvspush(texture_uvs[2], texture_uvs[1]); //Bottom right

            verticespush(x + 1, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y + 1, z); uvspush(texture_uvs[0], texture_uvs[3]); //Top left
            verticespush(x + 1, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
          }

          if (x == 0 || isTransparent(getBlock(blocks, x - 1, y, z))) {
            let texture_uvs = getTextureUvs(block, "-1 0 0");
            verticespush(x, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x, y, z + 1); uvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            verticespush(x, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right

            verticespush(x, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
            verticespush(x, y + 1, z); uvspush(texture_uvs[0], texture_uvs[3]); //Top left
          }

          if (z == CHUNK_WIDTH - 1 || isTransparent(getBlock(blocks, x, y, z + 1))) {
            let texture_uvs = getTextureUvs(block, "0 0 1");
            verticespush(x, y, z + 1); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y, z + 1); uvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            verticespush(x + 1, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right

            verticespush(x, y, z + 1); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
            verticespush(x, y + 1, z + 1); uvspush(texture_uvs[0], texture_uvs[3]); //Top left
          }

          if (z == 0 || isTransparent(getBlock(blocks, x, y, z - 1))) {
            let texture_uvs = getTextureUvs(block, "0 0 -1");
            verticespush(x, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y + 1, z); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
            verticespush(x + 1, y, z); uvspush(texture_uvs[2], texture_uvs[1]); //Bottom right

            verticespush(x, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x, y + 1, z); uvspush(texture_uvs[0], texture_uvs[3]); //Top left
            verticespush(x + 1, y + 1, z); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
          }

          if (y == CHUNK_HEIGHT - 1 || isTransparent(getBlock(blocks, x, y + 1, z))) {
            let texture_uvs = getTextureUvs(block, "0 1 0");
            verticespush(x, y + 1, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            verticespush(x + 1, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right

            verticespush(x, y + 1, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y + 1, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
            verticespush(x + 1, y + 1, z); uvspush(texture_uvs[0], texture_uvs[3]); //Top left
          }

          if (y == 0 || isTransparent(getBlock(blocks, x, y - 1, z))) {
            let texture_uvs = getTextureUvs(block, "0 -1 0");
            verticespush(x, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); //Top right
            verticespush(x, y, z + 1); uvspush(texture_uvs[0], texture_uvs[3]); //Top left

            verticespush(x, y, z); uvspush(texture_uvs[0], texture_uvs[1]); //Bottom left
            verticespush(x + 1, y, z); uvspush(texture_uvs[2], texture_uvs[1]); //Bottom right
            verticespush(x + 1, y, z + 1); uvspush(texture_uvs[2], texture_uvs[3]); // Top right
          }
        }
      }
    }
  }

  vertices = vertices.slice(0, vp);
  uvs = uvs.slice(0, up);
  tvertices = tvertices.slice(0, tvp);
  tuvs = tuvs.slice(0, tup);

  let centerX = (minX + maxX) / 2;
  let centerY = (minY + maxY) / 2;
  let centerZ = (minZ + maxZ) / 2;
  let maxDist = -Infinity;

  for (let i = 0; i < vertices.length; i += 3) {
    let x = vertices[i];
    let y = vertices[i + 1];
    let z = vertices[i + 2];

    let dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2 + (z - centerZ) ** 2);
    if (dist > maxDist) maxDist = dist;
  }

  for (let i = 0; i < tvertices.length; i += 3) {
    let x = tvertices[i];
    let y = tvertices[i + 1];
    let z = tvertices[i + 2];

    let dist = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2 + (z - centerZ) ** 2);
    if (dist > maxDist) maxDist = dist;
  }

  postMessage([vertices.buffer, uvs.buffer, tvertices.buffer, tuvs.buffer, [centerX, centerY, centerZ, maxDist]]);
}
