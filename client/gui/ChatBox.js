import Minecraft from "/Minecraft.js";
import ChatMessagePacket from "/network/c2s/ChatMessage.js";
import * as Network from "/network/Network.js";

export default class ChatBox {
  chatbox_container;
  chatbox_messages;
  chatbox_input;

  fade_out_time = 0;
  chat_messages = [];
  typing = false;

  init() {
    this.chatbox_container = document.createElement("div");
    this.chatbox_container.style.cssText = `
      position: absolute;
      color: white;
      left: 1.5vh;
      right: 50%;
      top: 70%;
      bottom: 1.5vh;
    `;

    this.chatbox_messages = document.createElement("p");
    this.chatbox_messages.style.cssText = `
      position: absolute;
      width: 100%;
      bottom: 4vh;
    `;

    setInterval(() => {
      let o = Math.max(Math.min(1 - (new Date().getTime() - this.fade_out_time) / 3000, 1), 0);

      this.chatbox_messages.style.opacity = o;
      this.chatbox_messages.style.backgroundColor = "#323232" + Math.round(o * 128).toString(16);
    }, 1000 / 60);

    this.chatbox_input = document.createElement("textarea");
    this.chatbox_input.style.cssText = `
      position: absolute;
      width: 100%;
      bottom: 0;
      visibility: hidden;
    `;

    this.chatbox_container.appendChild(this.chatbox_messages);
    this.chatbox_container.appendChild(this.chatbox_input);

    document.body.appendChild(this.chatbox_container);

    Minecraft.getEventHandler().on("key_up", (key) => {
      if (!this.isTyping()) {
        if (key == "KeyT") {
          this.typing = true;
          this.chatbox_input.style.visibility = "visible";
          this.chatbox_input.select();
        }
      } else {
        if (key == "Enter") {
          Network.sendPacket(ChatMessagePacket(this.chatbox_input.value));
          this.typing = false;
          this.chatbox_input.style.visibility = "hidden";
          this.fade_out_time = new Date().getTime() + 5000;
        } else if (key == "Escape") {
          this.typing = false;
          this.chatbox_input.style.visibility = "hidden";
          this.fade_out_time = new Date().getTime() + 5000;
        }
      }
    });
  }

  addMessage(message) {
    this.chat_messages.push("&nbsp;" + message);
    this.chat_messages = this.chat_messages.slice(-11);
    this.fade_out_time = new Date().getTime() + 5000;

    this.update();
  }

  isTyping() {
    return this.typing;
  }

  update() {
    this.chatbox_messages.innerHTML = this.chat_messages.slice(-11).join("<br>");
  }
}
