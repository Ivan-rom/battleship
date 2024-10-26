import { WebSocketServer } from "ws";
import { parseMessage } from "../utils/methods";

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (client) => {
  console.log("ws ready");

  client.on("message", async (msg) => {
    try {
      const message = await parseMessage(msg);

      console.log(message);
    } catch (error) {
      console.log(error);
    }
  });

  client.on("close", () => {
    console.log("closed");
  });
});
