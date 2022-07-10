export default function (x, y, z) {
  return JSON.stringify({
    type: "block_break",
    data: {
      x: x,
      y: y,
      z: z
    }
  });
}
