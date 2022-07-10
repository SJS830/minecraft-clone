export default function (id) {
  return JSON.stringify({
    type: "attack_player",
    data: {
      id: id
    }
  });
}
