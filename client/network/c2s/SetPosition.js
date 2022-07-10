export default function (x, y, z, rx, ry, rz, shifting) {
  return JSON.stringify({
    type: "set_position",
    data: {
      x: x,
      y: y,
      z: z,
      rx: rx,
      ry: ry,
      rz: rz,
      shifting: shifting
    }
  });
}
