import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (client) => {
  console.log("ws ready");

  client.on("message", (msg) => {
    console.log(msg.toString());
  });

  client.on("close", () => {
    console.log("closed");
  });
});
