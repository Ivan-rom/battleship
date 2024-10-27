import { WebSocketServer } from "ws";
import { parseMessage } from "../utils/methods";
import { MessageTypes } from "../utils/types";
import { DB } from "../db";

const db = new DB();

const wss = new WebSocketServer({ port: 3000 });

wss.on("connection", (client) => {
  console.log("ws ready");

  client.on("message", async (msg) => {
    try {
      const message = await parseMessage(msg);

      switch (message.type) {
        case MessageTypes.REG:
          const newUser = db.addUser(message.data.name, message.data.password);

          const response = {
            type: MessageTypes.REG,
            data: JSON.stringify(newUser),
            id: 0,
          };

          client.send(JSON.stringify(response));

          break;
        default:
          break;
      }

      console.log(message);
    } catch (error) {
      console.log(error);
    }
  });

  client.on("close", () => {
    console.log("closed");
  });
});
