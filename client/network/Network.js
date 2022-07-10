let socket;
let packet_handlers = {};

//Webpack magic DO NOT TOUCH
require.context("./s2c", true, /\.js$/).keys().forEach(filename => {
  import(`./s2c/${filename.slice(2)}`).then((module) => {
    const { packet_name, handle } = module;
    packet_handlers[packet_name] = handle;
  });
});

export function init() {
  socket = new WebSocket(`ws://${document.location.host}:81`);

  socket.addEventListener("message", function (event) {
    let packet = JSON.parse(event.data);
    packet_handlers[packet.type](packet.data);
  });

  socket.addEventListener("close", function (event) {
    alert("Connection to the server lost.");
  });

  socket.send = socket.send;
}

export function sendPacket(packet) {
  if (socket.readyState === 1) {
    socket.send(packet);
  }
}

const packets = {};

require.context("./c2s", true, /\.js$/).keys().forEach(filename => {
  import(`./c2s/${filename.slice(2)}`).then((module) => {
    packets[filename.slice(2, -3) + "Packet"] = module.default;
  });
});

export { packets };
