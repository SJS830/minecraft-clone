export const pressedKeys: {[key: string]: boolean} = {};

document.addEventListener("keydown", (event) => {
  pressedKeys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
  pressedKeys[event.code] = false;
});
