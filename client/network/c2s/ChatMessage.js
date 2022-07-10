export default function (message) {
  return JSON.stringify({
    type: "chat_message",
    data: {
      message: message
    }
  });
}
