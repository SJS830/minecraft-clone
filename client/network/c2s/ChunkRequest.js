export default function (chunkx, chunkz) {
  return JSON.stringify({
    type: "chunk_request",
    data: {
      chunkx: chunkx,
      chunkz: chunkz
    }
  });
}
