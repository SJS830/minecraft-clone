export default function (x, y, z, slot) {
  return JSON.stringify({
    type: "block_place",
    data: {
      x: x,
      y: y,
      z: z,
      slot: slot
    }
  });
}
