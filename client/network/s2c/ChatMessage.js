import Minecraft from "/Minecraft.js";

export let packet_name = "chat_message";

export function handle(data) {
  Minecraft.getInstance().ChatBoxGui.addMessage(data.message);
}
