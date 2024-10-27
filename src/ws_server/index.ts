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
          const existedUser = db.getUser(message.data.name);

          let response;

          if (existedUser) {
            if (existedUser.password === message.data.password) {
              response = {
                type: MessageTypes.REG,
                data: JSON.stringify({
                  ...existedUser,
                  error: false,
                  errorText: "",
                }),
                id: 0,
              };
            } else {
              response = {
                type: MessageTypes.REG,
                data: JSON.stringify({
                  ...existedUser,
                  error: true,
                  errorText: "Wrong password",
                }),
                id: 0,
              };
            }
          } else {
            const newUser = db.addUser(
              message.data.name,
              message.data.password
            );

            response = {
              type: MessageTypes.REG,
              data: JSON.stringify({
                ...newUser,
                error: false,
                errorText: "",
              }),
              id: 0,
            };
          }

          client.send(JSON.stringify(response));

          client.send(
            JSON.stringify({
              type: MessageTypes.UPDATE_WINNERS,
              id: 0,
              data: JSON.stringify(db.winners),
            })
          );

          break;
        default:
          break;
      }
    } catch (error) {
      console.log(error);
    }
  });

  client.on("close", () => {
    console.log("closed");
  });
});
